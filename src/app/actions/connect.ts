"use server";

import { getTenant, getCorsairInstance } from "@/lib/corsair";
import { getUserId } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from "next/cache";

export async function getConnectUrl(service: "google" | "github"): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const tenant = await getTenant();
    
    // Clean up any stale fields on Corsair in parallel before generating the connect link
    const fields: ("access_token" | "refresh_token" | "expires_at" | "scope")[] = [
      "access_token",
      "refresh_token",
      "expires_at",
      "scope"
    ];
    
    if (service === "google") {
      const clearPromises = fields.flatMap((field) => [
        tenant.plugins.credentials.clear("gmail", field).catch(() => {}),
        tenant.plugins.credentials.clear("googlecalendar", field).catch(() => {})
      ]);
      await Promise.all(clearPromises);
    } else {
      const clearPromises = fields.map((field) => 
        tenant.plugins.credentials.clear("github", field).catch(() => {})
      );
      await Promise.all(clearPromises);
    }

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
  noStore();
  try {
    const userId = await getUserId();
    const inst = getCorsairInstance();
    
    // Query Corsair to see if credentials exist for this tenant
    const gmailCredentials = await inst.plugins.credentials.list("gmail", userId);
    const githubCredentials = await inst.plugins.credentials.list("github", userId);
    const calendarCredentials = await inst.plugins.credentials.list("googlecalendar", userId);
    
    console.log("[DEBUG] checkConnectionStatus gmailCredentials:", JSON.stringify(gmailCredentials));
    console.log("[DEBUG] checkConnectionStatus githubCredentials:", JSON.stringify(githubCredentials));
    console.log("[DEBUG] checkConnectionStatus calendarCredentials:", JSON.stringify(calendarCredentials));
    
    const googleConnected = (gmailCredentials.fields.find((f: any) => f.field === "access_token")?.set || false) || 
                            (calendarCredentials.fields.find((f: any) => f.field === "access_token")?.set || false);
    const githubConnected = githubCredentials.fields.find((f: any) => f.field === "access_token")?.set || false;
    
    return { google: googleConnected, github: githubConnected };
  } catch (error) {
    console.error("Failed to check connection status:", error);
    return { google: false, github: false };
  }
}

export async function getConnectedGithubUsername(): Promise<string | null> {
  try {
    const tenant = await getTenant();
    // Use Corsair's proxy to Octokit to get the authenticated user's profile
    const result: any = await tenant.run("github.api.rest.users.getAuthenticated", {});
    console.log("[DEBUG] getConnectedGithubUsername result:", JSON.stringify(result));
    
    if (result && result.data && result.data.login) {
      return result.data.login;
    } else if (result && result.login) {
      return result.login;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch connected github username:", error);
    return null;
  }
}

export async function getDefaultGithubUsername(): Promise<string> {
  try {
    const user = await currentUser();
    if (user) {
      const email = user.emailAddresses[0]?.emailAddress || "";
      const isPranav = email.includes("pranav") || email.includes("pranvg");
      if (!isPranav) {
        const prefix = email.split("@")[0];
        if (prefix) return prefix;
      }
    }
  } catch (e) {
    console.warn("Failed to get clerk user in getDefaultGithubUsername:", e);
  }
  const defaultRepo = process.env.GITHUB_DEFAULT_REPO || "pranavgawaii/Auren";
  return defaultRepo.split("/")[0];
}

export async function getConnectedGithubRepos(): Promise<any[]> {
  try {
    const tenant = await getTenant();
    // Securely fetch repositories for the connected user using Corsair backend
    const result: any = await tenant.run("github.api.rest.repos.listForAuthenticatedUser", {
      sort: "updated",
      per_page: 6
    });
    console.log("[DEBUG] getConnectedGithubRepos result type:", typeof result, Array.isArray(result));
    
    if (Array.isArray(result)) {
      return result;
    }
    // Check if data is nested
    if (result && Array.isArray(result.data)) {
      return result.data;
    }
    
    console.log("[DEBUG] getConnectedGithubRepos strange result:", JSON.stringify(result).substring(0, 200));
    return [];
  } catch (error) {
    console.error("Failed to fetch connected github repos:", error);
    return [];
  }
}

export async function disconnectService(service: "google" | "github"): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getTenant();
    const fields: ("access_token" | "refresh_token" | "expires_at" | "scope")[] = [
      "access_token",
      "refresh_token",
      "expires_at",
      "scope"
    ];
    
    if (service === "google") {
      for (const field of fields) {
        try {
          await tenant.plugins.credentials.clear("gmail", field);
        } catch {}
        try {
          await tenant.plugins.credentials.clear("googlecalendar", field);
        } catch {}
      }
      
      // Permanently delete tenant record to clear all sticky Corsair state/cache
      try {
        await tenant.delete();
      } catch (e) {
        console.warn("Failed to delete tenant on Corsair:", e);
      }
    } else {
      for (const field of fields) {
        try {
          await tenant.plugins.credentials.clear("github", field);
        } catch {}
      }
    }
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to disconnect ${service}:`, error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
