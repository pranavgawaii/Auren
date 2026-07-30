"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AurenMascotBadge } from "@/components/ui/auren-mascot";
import { ShiningText } from "@/components/ui/shining-text";

/**
 * The one loading state for the whole app: blinking mascot above a shimmering
 * message. Every surface uses this so a load never looks like a different product.
 *
 * `overlay` frosts the workspace behind it (used while the shell boots and for
 * modals); `inline` fills whatever container it's dropped into.
 */
export function AurenLoading({
  text,
  variant = "inline",
  size = "md",
  className,
}: {
  text: string;
  variant?: "inline" | "overlay";
  /** sm for panels and drawers, md for full views, lg for the app boot screen. */
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const mascot = size === "lg" ? 64 : size === "md" ? 44 : 30;
  const type =
    size === "lg" ? "text-[15px]" : size === "md" ? "text-[14px]" : "text-[13px]";
  const gap = size === "lg" ? "gap-5" : size === "md" ? "gap-4" : "gap-3";

  const content = (
    <div className={cn("flex flex-col items-center justify-center", gap)}>
      <AurenMascotBadge size={mascot} />
      <ShiningText
        text={text}
        className={cn(type, "font-medium tracking-wide font-sans")}
      />
    </div>
  );

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center",
          "bg-[#FAF8F5]/25 dark:bg-[#2C2C2C]/35 backdrop-blur-[10px] backdrop-saturate-150",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 items-center justify-center w-full h-full", className)}>
      {content}
    </div>
  );
}

export default AurenLoading;
