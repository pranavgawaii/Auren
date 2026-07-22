import { Topbar } from "@/components/auren/topbar";
import { Footer } from "@/components/auren/footer";

export const metadata = {
  title: "Terms of Service | Auren",
};

export default function TermsPage() {
  return (
    <div style={{ background: "#FBF3EC", color: "#241B14", fontFamily: "var(--font-sans)", overflowX: "clip", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar />
      
      <main className="flex-1 px-6 md:px-12 py-20 max-w-[800px] mx-auto w-full">
        <h1 
          className="text-[32px] mb-2"
          style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
        >
          Terms of Service
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(36,27,20,0.6)", marginBottom: "40px" }}>
          Last updated: June 17, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "rgba(36,27,20,0.8)" }}>
          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Auren, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>2. Use License</h2>
            <p>
              Auren grants you a limited, non-exclusive, non-transferable, and revocable license to use the service for personal or internal business purposes in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>3. User Obligations</h2>
            <p>
              You agree not to misuse the services. You are responsible for maintaining the confidentiality of your account credentials and for all actions taken under your account. You must notify us immediately if you suspect any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>4. Service Access & Integrations</h2>
            <p>
              Auren integrates with external accounts (Gmail, Google Calendar, GitHub) using the Corsair integration layer. We act as your agent to execute actions based on your natural language commands. You must ensure you have the authority to grant us these permissions.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>5. Disclaimer</h2>
            <p>
              Auren is provided &ldquo;as is&rdquo;. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>6. Limitation of Liability</h2>
            <p>
              In no event shall Auren, its creators, or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the services, even if we have been notified of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>7. Contact</h2>
            <p>
              If you have any questions or feedback regarding these Terms, please reach out to us at <a href="mailto:pranavgawai@craftastudio.ai" style={{ color: "#E8593C", textDecoration: "none" }}>pranavgawai@craftastudio.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
