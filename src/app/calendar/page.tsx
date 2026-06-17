import type { Metadata } from "next";
import { DashboardClient } from "@/components/auren/app/dashboard-client";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Manage your schedule with Auren.",
};

export default function CalendarPage() {
  return <DashboardClient />;
}
