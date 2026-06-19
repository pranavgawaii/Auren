import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { HeroWidget } from "@/components/auren/hero-widget";
import { Topbar } from "@/components/auren/topbar";
import { Footer } from "@/components/auren/footer";
import { IntegrationsStrip, TheGapSection, HowItWorksSection, BuiltForBuildersSection, HeroIllustration, GetStartedCTASection } from "@/components/auren/landing-animations";
import { Features } from "@/components/blocks/features-10";
import { WatchDemoModal } from "@/components/auren/watch-demo-modal";

export const metadata = {
  title: "Auren — AI Execution Layer",
  description: "Your inbox, calendar, and GitHub. Executed in one line.",
};

/* ── Font assignments ── */
const FONT_BODY = "var(--font-sans)";
const FONT_SUBHEAD = "var(--font-sans)";

export default async function LandingPage() {
  let userId = null;
  try {
    const authData = await auth();
    userId = authData.userId;
  } catch (e) {
    // Ignore outside of Next request context
  }

  if (userId) {
    redirect("/app");
  }



  return (
    <div style={{ background: "#FBF3EC", color: "#241B14", fontFamily: FONT_BODY, overflowX: "clip", minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════════════
          NAV — sticky
      ═══════════════════════════════════════════════ */}
      <Topbar />

      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section 
        className="flex flex-col px-6 md:px-12 pt-16 pb-10 max-w-[1440px] mx-auto w-full"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >

        {/* Hero text row (Horizontal Layout restored & made responsive) */}
        <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-8 lg:gap-16 mb-12">

          {/* LEFT — Tight, structured heading */}
          <div className="w-full lg:flex-1">
            <h1 
              className="text-[40px] sm:text-[48px] md:text-[56px] leading-[1.1] tracking-tight"
              style={{
                fontFamily: "var(--font-civane, Georgia, serif)",
                fontWeight: 400,
                color: "#1C1513",
                margin: 0,
              }}
            >
              The execution layer<br />
              between thinking and <span style={{ color: "#E8593C" }}>doing</span>.
            </h1>
          </div>

          {/* RIGHT — Subhead + CTAs */}
          <div className="w-full lg:w-[380px] lg:flex-shrink-0 pt-2">
            <p style={{
              fontFamily: FONT_SUBHEAD,
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "1.6",
              color: "rgba(36,27,20,0.58)",
              margin: "0 0 24px 0",
            }}>
              Auren normalizes your work into a single command.
              Calibrated to expert workflows, not manual clicks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#watch-demo" className="transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:bg-neutral-50/80 active:scale-[0.98] inline-block" style={{
                fontFamily: FONT_BODY, fontWeight: 500, fontSize: "14px",
                color: "#241B14", background: "white",
                border: "1px solid rgba(36,27,20,0.15)", borderRadius: "6px",
                padding: "11px 22px", textDecoration: "none",
                boxShadow: "0 1px 3px rgba(36,27,20,0.06)",
              }}>Watch Demo</Link>
              <Link href="/sign-in" className="transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:bg-[#d44a2d] active:scale-[0.98] inline-block" style={{
                fontFamily: FONT_BODY, fontWeight: 500, fontSize: "14px",
                color: "white", background: "#E8593C",
                borderRadius: "6px", padding: "11px 22px", textDecoration: "none",
                boxShadow: "0 2px 8px rgba(232,89,60,0.30)",
              }}>Try Auren for Free</Link>
            </div>
          </div>
        </div>

        {/* Widget + illustration */}
        <div style={{ position: "relative", flex: 1, paddingBottom: "40px" }}>

          {/* Decorative SVG: + grid + concentric arcs */}
          <svg aria-hidden="true" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 0, overflow: "visible",
            transform: "translateZ(0)",
            willChange: "transform",
          }}>
            <defs>
              <pattern id="pg" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
                <line x1="13" y1="7" x2="13" y2="19" stroke="rgba(36,27,20,0.10)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="7" y1="13" x2="19" y2="13" stroke="rgba(36,27,20,0.10)" strokeWidth="1.4" strokeLinecap="round"/>
              </pattern>
            </defs>
            <rect x="52%" y="0" width="48%" height="100%" fill="url(#pg)" />
            <circle cx="100%" cy="100%" r="200" fill="none" stroke="rgba(36,27,20,0.07)" strokeWidth="1.5"/>
            <circle cx="100%" cy="100%" r="280" fill="none" stroke="rgba(36,27,20,0.05)" strokeWidth="1.5"/>
            <circle cx="100%" cy="100%" r="360" fill="none" stroke="rgba(36,27,20,0.035)" strokeWidth="1.5"/>
          </svg>

          <HeroWidget />

          {/* Illustration ON TOP (z-index: 20) and moved up */}
          <HeroIllustration />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          INTEGRATIONS STRIP
      ═══════════════════════════════════════════════ */}
      <IntegrationsStrip />

      {/* ═══════════════════════════════════════════════
          THE GAP SECTION
      ═══════════════════════════════════════════════ */}
      <TheGapSection />

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS (3 CARDS)
      ═══════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ═══════════════════════════════════════════════
          BUILT FOR BUILDERS (NEW SECTION)
      ═══════════════════════════════════════════════ */}
      <BuiltForBuildersSection />

      {/* ═══════════════════════════════════════════════
          FEATURES SECTION (New)
      ═══════════════════════════════════════════════ */}
      <Features />

      {/* ═══════════════════════════════════════════════
          GET STARTED CTA SECTION
      ═══════════════════════════════════════════════ */}
      <GetStartedCTASection />

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <Footer />

      <WatchDemoModal />
    </div>
  );
}
