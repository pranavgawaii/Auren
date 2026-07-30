"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Blinking mascot — ported from the GrindOS AI chat button (`ai-chat-bot-icon`).
 * Same head path and the same `ai-blink` cadence: eyes stay open for 92% of a
 * 2.2s cycle then squash on scaleY for a single ~175ms blink, which is what
 * makes it feel alive rather than animated.
 *
 * Eyes are knocked out in the surface color, so `eyeClassName` should match
 * whatever the mascot sits on.
 */
export function AurenMascot({
  size = 20,
  className,
  headClassName = "fill-[#E8593C]",
  eyeClassName = "fill-white dark:fill-[#383838]",
  eyeStyle,
}: {
  size?: number;
  className?: string;
  headClassName?: string;
  eyeClassName?: string;
  /** Overrides eyeClassName's fill — used when the colour isn't a Tailwind token. */
  eyeStyle?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("block shrink-0", className)}
    >
      {/* Base pill */}
      <rect x="36" y="84" width="28" height="6" rx="3" className={headClassName} />

      {/* Head */}
      <path
        d="M 50,15 C 58,15 65,19 69,25 C 76,24 83,29 84,36 C 89,41 89,49 86,55 C 88,62 82,70 75,71 C 68,75 60,78 50,78 C 40,78 32,75 25,71 C 18,70 12,62 14,55 C 11,49 11,41 16,36 C 17,29 24,24 31,25 C 35,19 42,15 50,15 Z"
        className={headClassName}
      />

      {/* Eyes */}
      <rect
        x="37"
        y="38"
        width="6"
        height="18"
        rx="3"
        className={cn("animate-eye-blink", !eyeStyle && eyeClassName)}
        style={{ transformOrigin: "50px 47px", ...eyeStyle }}
      />
      <rect
        x="57"
        y="38"
        width="6"
        height="18"
        rx="3"
        className={cn("animate-eye-blink", !eyeStyle && eyeClassName)}
        style={{ transformOrigin: "50px 47px", ...eyeStyle }}
      />
    </svg>
  );
}

/**
 * Mascot knocked out in white on a flat orange disc — the product mark.
 * Deliberately flat: no gradient, no orb.
 *
 * The disc uses a lighter, warmer orange than the brand red (#E8593C), which went
 * heavy at large sizes. Buttons and accents keep the brand colour; this is the
 * mascot's own tone.
 */
const MASCOT_ORANGE = "#F5845E";

export function AurenMascotBadge({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size, backgroundColor: MASCOT_ORANGE }}
      className={cn("rounded-full flex items-center justify-center shrink-0", className)}
    >
      <AurenMascot
        size={Math.round(size * 0.62)}
        headClassName="fill-white"
        eyeStyle={{ fill: MASCOT_ORANGE }}
      />
    </span>
  );
}

export default AurenMascot;
