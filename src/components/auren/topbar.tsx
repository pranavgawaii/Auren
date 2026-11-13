"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

const FONT_BODY = "var(--font-sans)";

type NavLink = { label: string; href: string; section?: string };

const NAV_LINKS: NavLink[] = [
  { label: "How it works", href: "/how-it-works", section: "how-it-works" },
  { label: "Features", href: "/features", section: "features" },
  { label: "Integrations", href: "/integrations", section: "integrations" },
  { label: "Docs", href: "/docs" },
];

const GITHUB_PATH = "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z";

const LINK_CLASS =
  "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] transition-colors duration-200";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [showTooltip, setShowTooltip] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, targetId?: string) => {
    closeMobile();
    if (!targetId) return;
    // Intercept default routing if element is on the current page view
    const element = document.getElementById(targetId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      router.push(path, { scroll: false });
    }
  };

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) closeMobile();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMobile]);

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 h-16 md:h-[72px] border-b border-[rgba(36,27,20,0.07)] bg-[rgba(251,243,236,0.92)] backdrop-blur-xl"
      style={{ WebkitBackdropFilter: "blur(12px)", transform: "translateZ(0)" }}
    >
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
            <Image src="/auren_logo.webp" alt="Auren Logo" fill sizes="64px" style={{ objectFit: "cover" }} />
          </motion.div>
          <span style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400, fontSize: "22px", letterSpacing: "-0.02em", color: "#241B14" }}>
            Auren
          </span>
        </Link>
      </div>

      {/* CENTER: Links (desktop only) */}
      <div className="hidden md:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", gap: "26px" }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href, link.section)}
            className={LINK_CLASS}
            style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* RIGHT: CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div 
          className="hidden md:block"
          style={{ position: "relative" }} 
          onMouseEnter={() => setShowTooltip(true)} 
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Link
            href="https://github.com/pranavgawaii/Auren"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-github-link"
            aria-label="View Auren on GitHub"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", borderRadius: "6px" }}
          >
            <motion.svg 
              whileHover={{ scale: 1.08 }} 
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
              className="text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] hover:text-[#E8593C] dark:hover:text-[#E8593C] transition-colors duration-200"
            >
              <path d={GITHUB_PATH} />
            </motion.svg>
          </Link>
          
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 6, x: "-50%", scale: 0.96 }}
                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                exit={{ opacity: 0, y: 6, x: "-50%", scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="absolute top-[46px] left-1/2 bg-white dark:bg-[#1E1C1A] text-[#241B14] dark:text-[#FBF3EC] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-md shadow-[0_4px_12px_rgba(36,27,20,0.05)] z-50 pointer-events-none select-none text-[11.5px] font-sans font-medium whitespace-nowrap"
              >
                View on GitHub
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoaded ? (
          <div style={{ width: "100px", height: "40px" }} />
        ) : !user ? (
          <>
            <Link href="/sign-in" className="nav-signin-link hidden md:inline-flex" style={{
              fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px",
              textDecoration: "none", padding: "10px 16px",
            }}>Sign in</Link>
            <Link href="/sign-up" className="inline-flex rounded-md bg-[#E8593C] hover:bg-[#C44730] transition-colors duration-200 text-white text-[13px] md:text-[14px] font-medium px-3 md:px-5 py-[9px] md:py-[10px]" style={{
              fontFamily: FONT_BODY,
              textDecoration: "none",
            }}>Get started</Link>
          </>
        ) : (
          <div style={{ marginLeft: "16px", display: "flex", alignItems: "center" }}>
            <UserButton />
          </div>
        )}

        {/* Hamburger (mobile only) */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          className="md:hidden flex items-center justify-center w-10 h-10 ml-1 rounded-md text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] hover:text-[#E8593C] transition-colors duration-200"
        >
          <motion.svg
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ duration: 0.18 }}
          >
            {mobileOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </motion.svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            key="mobile-nav-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-full left-0 right-0 border-b border-[rgba(36,27,20,0.07)] bg-[#FBF3EC] shadow-[0_12px_24px_rgba(36,27,20,0.06)] px-4 sm:px-6 py-2 flex flex-col"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.section)}
                className={`${LINK_CLASS} py-3.5 border-b border-[rgba(36,27,20,0.06)]`}
                style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/pranavgawaii/Auren"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
              className={`${LINK_CLASS} py-3.5 flex items-center gap-2`}
              style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "15px", textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={GITHUB_PATH} />
              </svg>
              GitHub
            </a>

            {isLoaded && !user && (
              <div className="flex items-center gap-3 pt-3 pb-2">
                <Link
                  href="/sign-in"
                  onClick={closeMobile}
                  className="nav-signin-link flex-1 text-center py-[10px] rounded-md border border-[rgba(36,27,20,0.12)]"
                  style={{ fontFamily: FONT_BODY, fontWeight: 400, fontSize: "14px", textDecoration: "none" }}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMobile}
                  className="flex-1 text-center py-[10px] rounded-md text-white bg-[#E8593C] hover:bg-[#C44730] transition-colors duration-200"
                  style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "14px", textDecoration: "none" }}
                >
                  Get started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
