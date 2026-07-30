import { redirect } from "next/navigation";

/**
 * Legacy route. The dashboard now lives at /dashboard and the inbox at /mail;
 * kept so old links, bookmarks, and any cached redirects still land somewhere sensible.
 */
export default function LegacyAppPage() {
  redirect("/dashboard");
}
