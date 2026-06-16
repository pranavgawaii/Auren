import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo — Auren",
  description:
    "Try Auren without signing up. Pre-seeded demo data lets you explore the AI agent bar, inbox, and calendar.",
};

export default function DemoPage() {
  return (
    <main>
      <h1>Demo Mode</h1>
    </main>
  );
}
