import type { Metadata } from "next";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

export const metadata: Metadata = {
  title: {
    template: "%s | Auren",
    default: "Auren App",
  },
};
