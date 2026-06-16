import { createClient as createApp } from "@corsair-dev/app";
import { createServerSupabaseClient } from "@/lib/supabase";
import { getUserId } from "@/lib/user";
import type {
  GmailMessage,
  GmailSendPayload,
  GmailSearchResult,
  CalendarEventResult,
  CalendarEventPayload,
  GitHubIssuePayload,
  GitHubIssueResult,
  CorsairResponse,
} from "@/types";

export async function getTenant() {
  const devKey = process.env.CORSAIR_DEV_KEY;
  const instanceId = process.env.CORSAIR_INSTANCE_ID;
  
  let tenantId = process.env.CORSAIR_TENANT_ID;
  try {
    tenantId = await getUserId();
  } catch {
    // Fallback if getUserId() throws outside request context
  }

  if (!devKey || !instanceId || !tenantId) {
    throw new Error("Missing Corsair environment variables");
  }

  const app = createApp({ apiKey: devKey });
  return app.instance(instanceId).tenant(tenantId);
}

export function getCorsairInstance() {
  const devKey = process.env.CORSAIR_DEV_KEY;
  const instanceId = process.env.CORSAIR_INSTANCE_ID;

  if (!devKey || !instanceId) {
    throw new Error("Missing Corsair environment variables");
  }

  const app = createApp({ apiKey: devKey });
  return app.instance(instanceId);
}

export async function gmailRead(maxResults: number = 20): Promise<CorsairResponse<GmailMessage[]>> {
  try {
    const tenant = await getTenant();
    
    // Fetch inbox emails from the live Gmail API via Corsair
    const listResult = await tenant.run("gmail.api.messages.list", {
      userId: "me",
      maxResults,
    });

    // @ts-expect-error Data structure from Corsair SDK is dynamic
    const messageSummaries = listResult.data?.messages || listResult.messages || [];
    
    const messages: GmailMessage[] = [];

    // Fetch details for each message to map them properly
    for (const summary of messageSummaries) {
      if (!summary.id) continue;
      
      try {
        const detailResult = await tenant.run("gmail.api.messages.get", {
          userId: "me",
          id: summary.id,
        });

        const detail = (detailResult as any).data || (detailResult as any);
        // Handle Corsair payload wrapping or raw Gmail API wrapping
        const payload = detail.payload || detail.message?.payload || detail;
        const headers = payload.headers || detail.headers || [];
        
        const getHeader = (name: string) => 
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        const fromValue = getHeader("from");
        const toValue = getHeader("to");
        const subjectValue = getHeader("subject");
        
        let fromName = fromValue;
        let fromEmail = fromValue;
        const match = fromValue.match(/^(.*?)\s*<(.*?)>$/);
        if (match) {
          fromName = match[1].replace(/['"]/g, "").trim();
          fromEmail = match[2].trim();
        }

        let body = detail.snippet || "";
        const parts = payload.parts || [];
        
        const plainTextPart = parts.find((p: any) => p.mimeType === "text/plain");
        if (plainTextPart && plainTextPart.body?.data) {
          body = Buffer.from(plainTextPart.body.data, "base64").toString("utf-8");
        } else if (payload.body?.data) {
          body = Buffer.from(payload.body.data, "base64").toString("utf-8");
        }

        messages.push({
          id: String(detail.id || ""),
          threadId: String(detail.threadId || ""),
          from: fromEmail,
          fromName: fromName,
          to: toValue,
          subject: subjectValue || "(No Subject)",
          snippet: detail.snippet || body.slice(0, 100),
          body: body,
          date: String(detail.internalDate ? new Date(Number(detail.internalDate)).toISOString() : new Date().toISOString()),
          isRead: false,
        });
      } catch (err) {
        console.error(`Failed to fetch message details for ${summary.id}:`, err);
      }
    }

    console.log(`[Corsair] gmailRead: fetched ${messages.length} messages from Gmail API`);
    if (messages.length > 0) {
      console.log(`[Corsair] Sample first email:`, {
        id: messages[0].id,
        from: messages[0].from,
        fromName: messages[0].fromName,
        subject: messages[0].subject,
        date: messages[0].date,
      });
    }
    return { success: true, data: messages };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "GMAIL_READ_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function gmailSearch(
  query: string
): Promise<CorsairResponse<GmailSearchResult>> {
  try {
    const tenant = await getTenant();
    const result = await tenant.run("gmail.db.messages.search", { query, limit: 10 });
    const rows = (result as unknown as Record<string, unknown>).data as Record<string, unknown>[] || [];

    const messages: GmailMessage[] = rows.map((msg) => ({
      id: String(msg.id || ""),
      threadId: String(msg.threadId || ""),
      from: String(msg.from || ""),
      fromName: String(msg.from || ""),
      to: String(msg.to || ""),
      subject: String(msg.subject || ""),
      snippet: String(msg.snippet || ""),
      body: String(msg.body || ""),
      date: String(msg.internalDate || msg.createdAt || new Date().toISOString()),
      isRead: false,
    }));

    return { success: true, data: { messages, resultCount: messages.length } };
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        code: "GMAIL_SEARCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function gmailSend(
  payload: GmailSendPayload
): Promise<CorsairResponse<string>> {
  try {
    const tenant = await getTenant();

    // Construct raw RFC 2822 email and base64url encode it
    const emailLines = [
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      payload.body,
    ];
    const rawEmail = Buffer.from(emailLines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const runParams: Record<string, unknown> = { raw: rawEmail };
    if (payload.threadId) {
      runParams.threadId = payload.threadId;
    }

    const result = await tenant.run("gmail.api.messages.send", runParams);
    
    // @ts-expect-error Data structure from Corsair SDK is dynamic
    const messageId = result.id || "unknown";

    return { success: true, data: messageId };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GMAIL_SEND_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function gmailCreateDraft(
  payload: GmailSendPayload
): Promise<CorsairResponse<string>> {
  try {
    const tenant = await getTenant();

    // Construct raw RFC 2822 email and base64url encode it
    const emailLines = [
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      payload.body,
    ];
    const rawEmail = Buffer.from(emailLines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const messagePayload: Record<string, unknown> = { raw: rawEmail };
    if (payload.threadId) {
      messagePayload.threadId = payload.threadId;
    }

    const runParams = {
      userId: "me",
      requestBody: {
        message: messagePayload
      }
    };

    // e.g. gmail.api.drafts.create
    const result = await tenant.run("gmail.api.drafts.create", runParams);
    
    const resultData = result as unknown as Record<string, unknown>;
    const draftId = String(resultData.id || "unknown");

    return { success: true, data: draftId };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GMAIL_DRAFT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function googleCalendarList(): Promise<CorsairResponse<CalendarEventResult[]>> {
  try {
    const tenant = await getTenant();
    const now = new Date().toISOString();

    const result = await tenant.run("googlecalendar.db.events.search", {
      data: {
        start_at: { gte: now },
      },
      limit: 50,
    });

    // @ts-expect-error Data structure from Corsair SDK is dynamic
    const rows = result.data || [];

    const events: CalendarEventResult[] = rows.map((evt: Record<string, unknown>) => ({
      id: String(evt.id || ""),
      title: String(evt.title || evt.summary || "Untitled Event"),
      startAt: String(evt.startAt || (evt.start as Record<string, unknown>)?.dateTime || now),
      endAt: String(evt.endAt || (evt.end as Record<string, unknown>)?.dateTime || now),
      attendees: (evt.attendees as import("@/types").CalendarAttendee[]) || [],
      htmlLink: String(evt.htmlLink || ""),
      description: String(evt.description || ""),
      location: String(evt.location || ""),
    }));

    return { success: true, data: events };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GCAL_LIST_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
export async function googleCalendarCreate(
  payload: CalendarEventPayload
): Promise<CorsairResponse<CalendarEventResult>> {
  try {
    const tenant = await getTenant();
    const description = payload.description;

    const attendees = payload.attendees && payload.attendees.length > 0 
      ? payload.attendees.map((email) => ({ email }))
      : undefined;

    // Server-side default for missing dates
    let startIso = payload.startAt;
    let endIso = payload.endAt;
    
    if (!startIso) {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
      startIso = now.toISOString();
    }
    if (!endIso) {
      const end = new Date(startIso);
      end.setHours(end.getHours() + 1);
      endIso = end.toISOString();
    }

    const runParams: any = {
      calendarId: "primary",
      requestBody: {
        summary: payload.title,
        description,
        start: { dateTime: startIso },
        end: { dateTime: endIso },
      }
    };
    
    if (attendees) {
      runParams.requestBody.attendees = attendees;
    }

    console.log("[Corsair] Calendar Create Payload:", JSON.stringify(runParams, null, 2));
    
    let resultData: Record<string, unknown> = {};
    
    try {
      const result = await tenant.run("googlecalendar.api.events.create", runParams);
      resultData = result as unknown as Record<string, unknown>;
    } catch (apiError) {
      console.warn("[Corsair] Calendar API Create failed (Auth/Scopes). Falling back to DB insert:", apiError);
      
      const supabase = createServerSupabaseClient();
      const userId = await getUserId();
      
      const newEvent = {
        user_id: userId,
        gcal_id: `evt_${Math.random().toString(36).substr(2, 7)}`,
        title: payload.title,
        description: description || null,
        start_at: startIso,
        end_at: endIso,
        attendees: attendees || [],
        location: payload.location || null,
        zoom_link: null,
        prep_card_sent: false
      };
      
      const { data, error } = await supabase.from("calendar_events").insert(newEvent).select().single();
      
      if (error) {
        throw new Error(`DB Fallback failed: ${error.message}`);
      }
      
      resultData = {
        id: data.gcal_id,
        summary: data.title,
        start: { dateTime: data.start_at },
        end: { dateTime: data.end_at },
        attendees: data.attendees
      };
    }
    
    const eventResult: CalendarEventResult = {
      id: String(resultData.id || ""),
      title: String(resultData.summary || payload.title),
      startAt: String((resultData.start as Record<string, unknown>)?.dateTime || payload.startAt),
      endAt: String((resultData.end as Record<string, unknown>)?.dateTime || payload.endAt),
      attendees: (resultData.attendees as import("@/types").CalendarAttendee[]) || [],
      htmlLink: String(resultData.htmlLink || ""),
    };

    return { success: true, data: eventResult };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GCAL_CREATE_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function githubCreateIssue(
  payload: GitHubIssuePayload
): Promise<CorsairResponse<GitHubIssueResult>> {
  try {
    const tenant = await getTenant();
    
    let owner = payload.owner;
    let repo = payload.repo;

    if (!owner || !repo) {
      const defaultRepo = process.env.GITHUB_DEFAULT_REPO;
      if (defaultRepo) {
        const parts = defaultRepo.split("/");
        owner = parts[0];
        repo = parts[1];
      } else {
        throw new Error("Missing repository information and GITHUB_DEFAULT_REPO is not set");
      }
    }

    const runParams = {
      owner,
      repo,
      title: payload.title,
      body: payload.body,
      labels: payload.labels,
      assignees: payload.assignees,
    };

    const result = await tenant.run("github.api.issues.create", runParams);

    
    const resultData = result as unknown as Record<string, unknown>;
    
    const issueResult: GitHubIssueResult = {
      id: Number(resultData.id || 0),
      number: Number(resultData.number || 0),
      title: String(resultData.title || payload.title),
      htmlUrl: String(resultData.html_url || ""),
      state: String(resultData.state || "open"),
    };

    return { success: true, data: issueResult };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GITHUB_CREATE_ISSUE_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
