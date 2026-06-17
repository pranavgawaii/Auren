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
  GitHubListIssuesPayload,
  GitHubListIssuesResult,
  GitHubReviewPrPayload,
  CorsairResponse,
} from "@/types";
import type { CorsairListResult, CorsairSearchResult, CorsairSendResult, CorsairEmailMessage, CorsairCalendarEvent } from "@/types/corsair";


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

  console.log("[Corsair] Tenant ID is:", tenantId);
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

export async function gmailRead(
  maxResults: number = 20,
  folderType?: "INBOX" | "SENT" | "DRAFT"
): Promise<CorsairResponse<GmailMessage[]>> {
  try {
    const tenant = await getTenant();
    
    // Fetch emails from the live Gmail API via Corsair
    const params: any = {
      userId: "me",
      maxResults,
    };

    if (folderType === "INBOX") {
      // Only real inbox messages — exclude spam, trash, promotions, social
      params.labelIds = ["INBOX"];
      params.q = "-in:spam -in:trash";
    } else if (folderType === "SENT") {
      params.labelIds = ["SENT"];
    } else if (folderType === "DRAFT") {
      params.labelIds = ["DRAFT"];
    } else {
      // Default: main inbox only, no spam or trash
      params.labelIds = ["INBOX"];
      params.q = "-in:spam -in:trash";
    }

    const listResult = await tenant.run("gmail.api.messages.list", params);

    const listResultData = listResult as CorsairListResult;
    if (listResultData && listResultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: listResultData.message || "Gmail is not authenticated or disconnected.",
          statusCode: 401,
        },
      };
    }

    const messageSummaries = listResultData.data?.messages || listResultData.messages || [];
    
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
        
        // Prefer HTML to look exactly like Gmail
        const htmlPart = parts.find((p: any) => p.mimeType === "text/html");
        const plainTextPart = parts.find((p: any) => p.mimeType === "text/plain");

        if (htmlPart && htmlPart.body?.data) {
          body = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
        } else if (plainTextPart && plainTextPart.body?.data) {
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
          // UNREAD label present means it's unread; absence means it's been read
          isRead: Array.isArray(detail.labelIds) ? !detail.labelIds.includes("UNREAD") : true,
          labels: detail.labelIds || (folderType ? [folderType] : []),
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
    const resultData = result as CorsairSearchResult;
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "Gmail search is unauthenticated or disconnected.",
          statusCode: 401,
        },
      };
    }
    const rows = (resultData.data as unknown as Record<string, unknown>[]) || [];

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
    const resultData = result as CorsairSendResult;
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "Gmail send is unauthenticated or disconnected.",
          statusCode: 401,
        },
      };
    }
    
    const messageId = resultData.id || "unknown";

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
    const resultData = result as any;
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "Gmail draft creation is unauthenticated or disconnected.",
          statusCode: 401,
        },
      };
    }
    
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

    const resultData = result as CorsairCalendarEvent & { success?: boolean; message?: string; data?: CorsairCalendarEvent[] };
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "Google Calendar is not authenticated or disconnected.",
          statusCode: 401,
        },
      };
    }

    const rows = (resultData.data as unknown as Record<string, unknown>[]) || [];

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

    const attendees: import("@/types").CalendarAttendee[] | undefined =
      payload.attendees && payload.attendees.length > 0
        ? payload.attendees.map((email) => ({ email, name: null, responseStatus: "needsAction" }))
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

    const runParams = {
      calendarId: "primary",
      event: {
        summary: payload.title,
        description,
        start: { dateTime: startIso },
        end: { dateTime: endIso },
        ...(attendees && { attendees }),
      }
    };
    
    let resultData: Record<string, unknown> = {};
    
    try {
      console.log("[Corsair] Creating event...");
      const result = await tenant.run("googlecalendar.api.events.create", runParams);
      resultData = result as unknown as Record<string, unknown>;
    } catch (err: any) {
      let msg = err.message;
      if (err.details) {
        msg += " | Details: " + (typeof err.details === 'object' ? JSON.stringify(err.details) : err.details);
      }
      console.warn("[Corsair] Event creation failed:", msg);
      // Fall through to DB insert
    }
      
    if (!resultData || (!resultData.id && !resultData.htmlLink)) {
      console.warn("[Corsair] All Calendar API Create attempts failed. Falling back to DB insert.");
      const supabase = createServerSupabaseClient();
      const userId = await getUserId();
      
      const newEvent = {
        user_id: userId,
        gcal_id: `evt_${Math.random().toString(36).substr(2, 7)}`,
        title: payload.title || "Untitled Event",
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
        console.error("Calendar fallback DB insert failed:", error.message);
        throw new Error("We encountered an issue saving your calendar event. Please check the event details and try again.");
      }
      
      return {
        success: true,
        data: {
          id: newEvent.gcal_id,
          title: newEvent.title,
          startAt: newEvent.start_at,
          endAt: newEvent.end_at,
          attendees: newEvent.attendees,
          htmlLink: "",
          description: newEvent.description || undefined,
          location: newEvent.location || undefined,
        }
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

function parseRepoUrl(repoInput: string): { owner: string; repo: string } {
  let owner = "";
  let repo = "";
  repoInput = repoInput.trim();

  const urlMatch = repoInput.match(/github\.com\/([^/\s]+)\/([^/\s]+)/i);
  if (urlMatch) {
    owner = urlMatch[1];
    repo = urlMatch[2].replace(/\.git$/, "");
  } else if (repoInput.includes("/")) {
    const parts = repoInput.split("/");
    owner = parts[0];
    repo = parts[1];
  }

  const isValidSlug = (s: string) => /^[a-zA-Z0-9_.\-]+$/.test(s);
  if (!isValidSlug(owner) || !isValidSlug(repo)) {
    const defaultRepo = process.env.GITHUB_DEFAULT_REPO;
    if (defaultRepo && defaultRepo.includes("/")) {
      const parts = defaultRepo.split("/");
      owner = parts[0];
      repo = parts[1];
    } else {
      throw new Error(
        "Cannot determine GitHub owner/repo. Set GITHUB_DEFAULT_REPO=owner/repo in your .env"
      );
    }
  }

  return { owner, repo };
}

export async function githubCreateIssue(
  payload: GitHubIssuePayload
): Promise<CorsairResponse<GitHubIssueResult>> {
  try {
    const tenant = await getTenant();
    const { owner, repo } = parseRepoUrl(payload.repoUrl ?? "");

    const runParams = {
      owner,
      repo,
      title: payload.title,
      body: payload.body,
      labels: payload.labels,
      assignees: payload.assignees,
    };

    const result = await tenant.run("github.api.issues.create", runParams);
    const resultData = result as any;
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "GITHUB_CREATE_ISSUE_ERROR",
          message: JSON.stringify(resultData),
          statusCode: 422,
        },
      };
    }
    
    const issueResult: GitHubIssueResult = {
      id: Number(resultData.id || 0),
      number: Number(resultData.number || 0),
      title: String(resultData.title || payload.title),
      htmlUrl: String(resultData.html_url || ""),
      state: String(resultData.state || "open"),
    };

    return { success: true, data: issueResult };
  } catch (error: any) {
    console.error("[Corsair] Execute Error:", error);
    
    // Attempt to extract detailed GitHub API validation errors from the Corsair error object
    let detailedMessage = error.message;
    if (error.response?.data) {
      detailedMessage += " - " + JSON.stringify(error.response.data);
    } else if (error.details) {
      detailedMessage += " - " + JSON.stringify(error.details);
    }

    return {
      success: false,
      error: {
        code: "GITHUB_CREATE_ISSUE_ERROR",
        message: detailedMessage || "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function githubListIssues(
  payload: GitHubListIssuesPayload
): Promise<CorsairResponse<GitHubListIssuesResult>> {
  try {
    const tenant = await getTenant();
    const { owner, repo } = parseRepoUrl(payload.repoUrl ?? "");

    const runParams = {
      owner,
      repo,
      state: payload.state || "open",
      labels: payload.labels ? payload.labels.join(",") : undefined,
      per_page: payload.limit || 30,
    };

    const result = await tenant.run("github.api.issues.listForRepo", runParams);
    const resultData = result as any;
    
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "GitHub integration is unauthenticated or disconnected.",
          statusCode: 401,
        },
      };
    }
    
    const issues = (Array.isArray(resultData) ? resultData : []).map((issue: any) => ({
      id: Number(issue.id || 0),
      number: Number(issue.number || 0),
      title: String(issue.title || ""),
      htmlUrl: String(issue.html_url || ""),
      state: String(issue.state || "open"),
    }));

    return { success: true, data: { issues } };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GITHUB_LIST_ISSUES_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}

export async function githubReviewPr(
  payload: GitHubReviewPrPayload
): Promise<CorsairResponse<{ id: number; htmlUrl: string }>> {
  try {
    const tenant = await getTenant();
    const { owner, repo } = parseRepoUrl(payload.repoUrl ?? "");

    const runParams = {
      owner,
      repo,
      pull_number: payload.pullNumber,
      body: payload.body,
      event: payload.event,
    };

    const result = await tenant.run("github.api.pulls.createReview", runParams);
    const resultData = result as any;
    
    if (resultData && resultData.success === false) {
      return {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: resultData.message || "GitHub integration is unauthenticated or disconnected.",
          statusCode: 401,
        },
      };
    }
    
    return { 
      success: true, 
      data: { 
        id: Number(resultData.id || 0),
        htmlUrl: String(resultData.html_url || "") 
      } 
    };
  } catch (error: unknown) {
    console.error("[Corsair] Execute Error:", error);
    return {
      success: false,
      error: {
        code: "GITHUB_REVIEW_PR_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        statusCode: 500,
      },
    };
  }
}
