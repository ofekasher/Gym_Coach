import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoachSidebar } from "@/components/shared/coach-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { isDatabaseConfigured } from "@/lib/prisma";

const DEMO_COACH_USER = { id: "demo-coach-1", name: "ליאור זיו", email: "coach@demo.com", role: "COACH" as const, image: null };

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured) {
    return (
      <div className="flex min-h-screen" style={{ background: "#070707" }}>
        <CoachSidebar user={DEMO_COACH_USER} />
        <main className="flex-1 lg:mr-[204px] min-h-screen">
          <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  const session = await auth();
  if (!session || session.user.role !== "COACH") redirect("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "#070707" }}>
      <CoachSidebar user={session.user} />
      <main className="flex-1 lg:mr-[204px] min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
