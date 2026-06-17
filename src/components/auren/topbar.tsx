"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const FONT_BODY = "var(--font-sans)";

export function Topbar() {
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, targetId: string) => {
    // Intercept default routing if element is on the current page view
    const element = document.getElementById(targetId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      router.push(path, { scroll: false });
    }
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      height: "72px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px",
      borderBottom: "1px solid rgba(36,27,20,0.07)",
      background: "rgba(251,243,236,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      transform: "translateZ(0)",
    }}>
      {/* LEFT: Logo */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            style={{
              width: "28px", height: "28px", borderRadius: "7px", overflow: "hidden",
              position: "relative", flexShrink: 0,
            }}
          >
            <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
          </motion.div>
          <span style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400, fontSize: "22px", letterSpacing: "-0.02em", color: "#241B14" }}>
            Auren
          </span>
        </Link>
      </div>

      {/* CENTER: Links */}
      <div className="hidden md:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "26px" }}>
        <Link href="/how-it-works" onClick={(e) => handleNavClick(e, "/how-it-works", "how-it-works")} className="text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] transition-colors duration-200" style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}>
          How it works
        </Link>
        <Link href="/features" onClick={(e) => handleNavClick(e, "/features", "features")} className="text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] transition-colors duration-200" style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}>
          Features
        </Link>
        <Link href="/integrations" onClick={(e) => handleNavClick(e, "/integrations", "integrations")} className="text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] transition-colors duration-200" style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}>
          Integrations
        </Link>
        <Link href="/docs" className="text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] transition-colors duration-200" style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}>
          Docs
        </Link>
      </div>

      {/* RIGHT: CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {/* GitHub icon */}
        <Link
          href="https://github.com/pranavgawaii/Auren"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          className="nav-github-link"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", borderRadius: "6px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </Link>
        <SignedOut>
          <Link href="/sign-in" className="nav-signin-link" style={{
            fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px",
            textDecoration: "none", padding: "10px 16px",
          }}>Sign in</Link>
          <Link href="/#waitlist" style={{
            fontFamily: FONT_BODY, fontWeight: 500, fontSize: "14px",
            color: "white", background: "#E8593C",
            borderRadius: "6px", padding: "10px 20px", textDecoration: "none",
          }}>Get started</Link>
        </SignedOut>
        <SignedIn>
          <div style={{ marginLeft: "16px", display: "flex", alignItems: "center" }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
}
