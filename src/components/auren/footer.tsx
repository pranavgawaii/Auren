"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FONT_BODY = "var(--font-sans)";

export function Footer() {
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      router.push(path, { scroll: false });
    }
  };

  return (
    <footer style={{
      padding: "80px 48px 40px",
      maxWidth: "1440px", margin: "0 auto",
      borderTop: "1px solid rgba(36,27,20,0.07)"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "48px", marginBottom: "64px" }}>
        {/* Logo & Info */}
        <div style={{ maxWidth: "320px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "5px", overflow: "hidden", position: "relative", flexShrink: 0 }}>
              <Image src="/auren_logo.webp" alt="Auren Logo" fill style={{ objectFit: "cover" }} />
            </div>
            <span style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400, fontSize: "20px", color: "#241B14" }}>Auren</span>
          </Link>
          <p style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", lineHeight: 1.6, margin: 0 }}>
            The execution layer between thinking and doing. Connect your workspace and act with a single command.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: "64px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "14px", color: "#241B14", margin: 0 }}>Product</h4>
            <Link href="/how-it-works" onClick={(e) => handleNavClick(e, "/how-it-works", "how-it-works")} style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>How it works</Link>
            <Link href="/features" onClick={(e) => handleNavClick(e, "/features", "features")} style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>Features</Link>
            <Link href="/integrations" onClick={(e) => handleNavClick(e, "/integrations", "integrations")} style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>Integrations</Link>
            <Link href="/#waitlist" style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>Premium</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "14px", color: "#241B14", margin: 0 }}>Developers</h4>
            <Link href="/docs" style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>Documentation</Link>
            <a href="https://github.com/pranavgawaii/Auren" target="_blank" rel="noopener noreferrer" style={{ fontFamily: FONT_BODY, fontSize: "14px", color: "rgba(36,27,20,0.6)", textDecoration: "none" }}>GitHub</a>
          </div>
        </div>
      </div>

      <div style={{ 
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px",
        borderTop: "1px solid rgba(36,27,20,0.07)", paddingTop: "32px"
      }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: "13px", color: "rgba(36,27,20,0.4)", margin: 0 }}>
          © {new Date().getFullYear()} Auren.
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: "13px", color: "rgba(36,27,20,0.4)", margin: 0, textAlign: "right" }}>
          Built by <a href="https://pranavx.in" target="_blank" rel="noopener noreferrer" className="text-[rgba(36,27,20,0.6)] hover:text-[#241B14] transition-colors duration-200" style={{ textDecoration: "none" }}>Pranav Gawai.</a>
        </p>
      </div>
    </footer>
  );
}
