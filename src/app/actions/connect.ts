"use server";

import { getTenant, getCorsairInstance } from "@/lib/corsair";
import { getUserId } from "@/lib/user";

export async function getConnectUrl(service: "google" | "github"): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const tenant = await getTenant();
    const plugins = service === "google" ? ["gmail", "googlecalendar"] : ["github"];
    
    // Create a connect link for this specific tenant and service
    const link = await tenant.connectLink.create({
      plugins: plugins as any,
    });
    
    return { success: true, url: link.url };
  } catch (error: any) {
    console.error(`Failed to generate connect link for ${service}:`, error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function checkConnectionStatus(): Promise<{ google: boolean; github: boolean }> {
  try {
    const userId = await getUserId();
    const inst = getCorsairInstance();
    
    // Query Corsair to see if credentials exist for this tenant
    const gmailCredentials = await inst.plugins.credentials.list("gmail", userId);
    const githubCredentials = await inst.plugins.credentials.list("github", userId);
    
    const googleConnected = gmailCredentials.fields.find((f: any) => f.field === "access_token")?.set || false;
    const githubConnected = githubCredentials.fields.find((f: any) => f.field === "access_token")?.set || false;
    
    return { google: googleConnected, github: githubConnected };
  } catch (error) {
    console.error("Failed to check connection status:", error);
    return { google: false, github: false };
  }
}

export async function disconnectService(service: "google" | "github"): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getTenant();
    if (service === "google") {
      await tenant.plugins.credentials.clear("gmail", "access_token");
      try {
        await tenant.plugins.credentials.clear("gmail", "refresh_token");
      } catch (e) {
        console.warn("Failed to clear gmail refresh_token:", e);
      }
      await tenant.plugins.credentials.clear("googlecalendar", "access_token");
      try {
        await tenant.plugins.credentials.clear("googlecalendar", "refresh_token");
      } catch (e) {
        console.warn("Failed to clear googlecalendar refresh_token:", e);
      }
    } else {
      await tenant.plugins.credentials.clear("github", "access_token");
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to disconnect ${service}:`, error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
