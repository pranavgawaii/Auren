import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/user";
import { exchangeCodeForTokens, saveTokens } from "@/lib/google-direct";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  const close = (message: string, ok: boolean) =>
    new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>${ok ? "Connected" : "Connection failed"}</title></head>
       <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;background:#FAF8F5;color:#241B14">
         <div style="font-size:15px;font-weight:600;margin-bottom:6px">${message}</div>
         <div style="font-size:12px;color:rgba(36,27,20,0.5)">You can close this window.</div>
         <script>setTimeout(function(){window.close()},1200)</script>
       </body></html>`,
      { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  if (error) return close(`Google returned an error: ${error}`, false);
  if (!code) return close("Missing authorization code.", false);

  try {
    const userId = await getUserId();
    const tokens = await exchangeCodeForTokens(code, origin);

    if (!tokens.refresh_token) {
      // Without a refresh token the grant dies in an hour — force a clean re-consent.
      return close("Google did not return a refresh token. Please try connecting again.", false);
    }

    await saveTokens(userId, tokens);
    return close("Google Calendar connected.", true);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GoogleDirect] callback failed:", message);
    return close(`Connection failed: ${message}`, false);
  }
}
