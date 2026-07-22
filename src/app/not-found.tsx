"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ background: "#FBF3EC", color: "#241B14", fontFamily: "var(--font-sans)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <title>404: Page Not Found | Auren</title>
      
      {/* Top minimal header */}
      <header style={{
        height: "72px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px",
        borderBottom: "1px solid rgba(36,27,20,0.07)"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
            <Image src="/auren_logo.webp" alt="Auren" fill style={{ objectFit: "cover" }} />
          </div>
          <span style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400, fontSize: "18px", color: "#241B14" }}>
            Auren
          </span>
        </Link>
      </header>

      {/* Main 404 Card area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        
        <div style={{ maxWidth: "420px", width: "100%", textAlign: "center" }}>
          
          <div style={{
            background: "white",
            borderRadius: "24px",
            border: "1px solid rgba(36,27,20,0.08)",
            boxShadow: "0 12px 32px rgba(36,27,20,0.04)",
            padding: "40px 32px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            
            {/* Mascot Image */}
            <div style={{ width: "180px", height: "180px", marginBottom: "24px", position: "relative" }}>
              <Image 
                src="/confused_lost.webp" 
                alt="Page Not Found Mascot" 
                fill 
                priority
                style={{ objectFit: "contain" }}
              />
            </div>

            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "12px",
              color: "#E8593C",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "12px"
            }}>
              404 Error
            </span>

            <h1 style={{
              fontFamily: "var(--font-civane, Georgia, serif)",
              fontSize: "32px",
              color: "#1C1513",
              margin: "0 0 12px 0",
              fontWeight: 400,
              lineHeight: 1.2
            }}>
              Page not found
            </h1>
            
            <p style={{
              fontSize: "14px",
              color: "rgba(36,27,20,0.58)",
              lineHeight: "1.6",
              margin: 0,
              maxWidth: "340px"
            }}>
              We couldn&apos;t find the page you were looking for. It may have been moved, deleted, or the URL might be incorrect.
            </p>

          </div>

          {/* Action Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link 
              href="/" 
              className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-[#d44a2d] active:scale-[0.98] inline-flex items-center gap-2 font-sans font-medium text-[14px]" 
              style={{
                color: "white", background: "#E8593C",
                borderRadius: "8px", padding: "12px 32px", textDecoration: "none",
                boxShadow: "0 2px 8px rgba(232,89,60,0.30)",
              }}
            >
              <ArrowLeft size={16} /> Return to safety
            </Link>
          </div>

        </div>

      </main>

      {/* Footer copyright */}
      <footer style={{ padding: "24px", textAlign: "center", borderTop: "1px solid rgba(36,27,20,0.07)" }}>
        <span style={{ fontSize: "12px", color: "rgba(36,27,20,0.4)" }}>
          © {new Date().getFullYear()} Auren. All rights reserved.
        </span>
      </footer>

    </div>
  );
}
