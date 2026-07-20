import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TraineeBottomNav } from "@/components/shared/trainee-bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { isDatabaseConfigured } from "@/lib/prisma";

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  // Lior Fit v2: radial green mesh over #0a1a0a, matching Lior Fit v2.dc.html exactly
  const bgStyle: React.CSSProperties = {
    background:
      "radial-gradient(120% 90% at 70% 0%, rgba(88,196,72,0.32) 0%, rgba(8,11,7,0) 62%), #0a1a0a",
  };

  if (!isDatabaseConfigured) {
    return (
      <div className="min-h-screen" style={bgStyle}>
        <main className="pb-24 min-h-screen">
          <div className="p-4 md:p-6 max-w-2xl mx-auto">
            {children}
          </div>
        </main>
        <TraineeBottomNav />
        <Toaster />
      </div>
    );
  }

  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") redirect("/login");

  return (
    <div className="min-h-screen" style={bgStyle}>
      <main className="pb-24 min-h-screen">
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          {children}
        </div>
      </main>
      <TraineeBottomNav />
      <Toaster />
    </div>
  );
}
