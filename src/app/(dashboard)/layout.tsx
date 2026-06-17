import { DashboardClient } from "@/components/auren/app/dashboard-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardClient />
      <div style={{ display: "none" }}>{children}</div>
    </>
  );
}
