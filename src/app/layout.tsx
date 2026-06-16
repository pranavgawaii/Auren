import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});



export const metadata: Metadata = {
  title: {
    template: "%s — Auren",
    default: "Auren — AI Execution Layer",
  },
  description:
    "A single text command to execute actions across GitHub, Calendar, and Gmail.",
  icons: {
    icon: "/auren_logo.webp",
  },
};

import { ClerkProvider } from '@clerk/nextjs'
import { SmoothScroll } from "@/components/auren/smooth-scroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className="scrollbar-hide"
      >
        <body
          className={cn(
            inter.variable,
            plusJakartaSans.variable,
            jetbrainsMono.variable,
            "antialiased"
          )}
        >
          <SmoothScroll />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
