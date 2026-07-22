import { Topbar } from "@/components/auren/topbar";
import { Footer } from "@/components/auren/footer";

export const metadata = {
  title: "Privacy Policy | Auren",
};

export default function PrivacyPage() {
  return (
    <div style={{ background: "#FBF3EC", color: "#241B14", fontFamily: "var(--font-sans)", overflowX: "clip", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar />
      
      <main className="flex-1 px-6 md:px-12 py-20 max-w-[800px] mx-auto w-full">
        <h1 
          className="text-[32px] mb-2"
          style={{ fontFamily: "var(--font-civane, Georgia, serif)", fontWeight: 400 }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(36,27,20,0.6)", marginBottom: "40px" }}>
          Last updated: June 17, 2026
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: "rgba(36,27,20,0.8)" }}>
          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>1. What we collect</h2>
            <p>
              We collect your email address when you join our waitlist. When you connect your accounts, we access Gmail, Google Calendar, and GitHub data via the Corsair OAuth integration layer. We only access the data you explicitly grant permissions for.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>2. How we use it</h2>
            <p>
              We use your data solely to provide the Auren service. This includes AI classification of emails and calendar event creation. We do not sell your data or use it for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>3. Data storage</h2>
            <p>
              Your data is stored securely using Supabase (PostgreSQL). All sensitive data is encrypted at rest to ensure your privacy and security.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>4. Third parties</h2>
            <p>
              We utilize trusted third-party services to power Auren:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Corsair</strong> — Integration layer for external services</li>
              <li><strong>Clerk</strong> — Authentication and user management</li>
              <li><strong>Supabase</strong> — Database and secure storage</li>
              <li><strong>Anthropic / OpenRouter</strong> — AI processing models</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>5. Your rights</h2>
            <p>
              You have full control over your data. You can request to delete your account and all associated data at any time by emailing us at <a href="mailto:pranavgawai@craftastudio.ai" style={{ color: "#E8593C", textDecoration: "none" }}>pranavgawai@craftastudio.ai</a>.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-3" style={{ color: "#241B14" }}>6. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:pranavgawai@craftastudio.ai" style={{ color: "#E8593C", textDecoration: "none" }}>pranavgawai@craftastudio.ai</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
