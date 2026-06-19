import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* LEFT COLUMN: Mascot & Branding */}
      <div 
        className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#F0DDD0" }}
      >
        {/* Dot grid pattern (top right corner) */}
        <svg aria-hidden="true" style={{
          position: "absolute", top: 0, right: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 0, opacity: 0.6
        }}>
          <defs>
            <pattern id="dot-grid" x="100%" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
              <line x1="13" y1="7" x2="13" y2="19" stroke="rgba(36,27,20,0.10)" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="7" y1="13" x2="19" y2="13" stroke="rgba(36,27,20,0.10)" strokeWidth="1.4" strokeLinecap="round"/>
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Mascot Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[400px]">
          <div className="relative w-[360px] h-[360px]">
            <Image 
              src="/mascot-welcome.webp" 
              alt="Welcome back mascot" 
              width={1024} 
              height={1024} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <h2 style={{
            fontFamily: "var(--font-civane), serif",
            fontWeight: 400,
            fontSize: "28px",
            color: "#241B14",
            marginTop: "24px",
            marginBottom: "8px"
          }}>
            Welcome back
          </h2>
          <p style={{
            fontFamily: "var(--font-sans), sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            color: "rgba(36,27,20,0.5)",
            margin: 0
          }}>
            Pick up right where you left off.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Card */}
      <div 
        className="w-full md:w-1/2 flex items-center justify-center relative"
        style={{
          backgroundColor: "#FBF3EC",
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(232,89,60,0.12), transparent 50%)",
          padding: "24px",
          fontFamily: "var(--font-sans), sans-serif"
        }}
      >

        <div className="w-full max-w-[420px]">
          <SignIn
            fallbackRedirectUrl="/app"
            appearance={{
              variables: {
                colorPrimary: "#E8593C",
                colorBackground: "#FFFFFF",
                borderRadius: "0.75rem",
              },
              elements: {
                card: "bg-white shadow-[0_20px_50px_-16px_rgba(36,27,20,0.12)] rounded-[20px] border border-[rgba(36,27,20,0.08)] p-8 font-sans z-10 w-full max-w-[420px]",
                headerTitle: "font-civane text-[#241B14] text-[28px] font-medium tracking-tight",
                headerSubtitle: "font-sans text-[rgba(36,27,20,0.5)] text-[14px] mt-1",
                formFieldLabel: "font-sans text-[13px] text-[#241B14] font-medium mb-1.5",
                formFieldInput: "font-sans h-[44px] rounded-[10px] border-[rgba(36,27,20,0.12)] focus:border-[#E8593C] focus:ring-1 focus:ring-[#E8593C] text-[14px] px-3 shadow-sm focus:shadow-[0_0_0_3px_rgba(232,89,60,0.1)] transition-shadow duration-150",
                formButtonPrimary: "font-sans h-[44px] bg-[#E8593C] hover:bg-[#D14F31] text-white font-medium rounded-[10px] text-[14px] normal-case mt-2 shadow-sm transition-colors duration-150",
                footerActionText: "font-sans text-[13px] text-[rgba(36,27,20,0.5)]",
                footerActionLink: "font-sans text-[13px] text-[#E8593C] hover:text-[#D44A2D] font-medium",
                dividerLine: "bg-[rgba(36,27,20,0.08)]",
                dividerText: "font-sans text-[12px] text-[rgba(36,27,20,0.4)]",
                socialButtonsBlockButton: "font-sans h-[44px] border border-[rgba(36,27,20,0.12)] rounded-[10px] text-[#241B14] hover:bg-[rgba(36,27,20,0.02)] transition-colors shadow-sm",
                socialButtonsBlockButtonText: "font-sans font-medium text-[14px]",
                identityPreviewText: "font-sans text-[#241B14] text-[14px]",
                identityPreviewEditButton: "text-[#E8593C] hover:text-[#D44A2D]",
                formFieldErrorText: "font-sans text-[#DC2626] text-[12px] mt-1.5",
                footer: "hidden"
              }
            }}
            signUpUrl="/sign-up"
          />

          <div className="mt-8 text-center text-[13px] text-[rgba(36,27,20,0.6)] font-sans leading-relaxed">
            <p>
              New to Auren? <Link href="/sign-up" className="text-[#E8593C] hover:text-[#D14F31] font-medium transition-colors">Create an Account</Link>
            </p>
            <p className="mt-2">
              By continuing you agree to our Terms of Service.
            </p>
            <p className="mt-1">
              Built by <a href="https://pranavx.in" target="_blank" rel="noopener noreferrer" className="text-[rgba(36,27,20,0.8)] hover:text-[#241B14] font-medium transition-colors">Pranav Gawai</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
