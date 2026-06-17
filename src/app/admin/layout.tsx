import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  // STRICT PROTECTION: Only allow this specific email.
  if (email !== "pranvgg@gmail.com") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#241B14] font-sans antialiased selection:bg-[#E8593C]/20">
      {children}
    </div>
  );
}
