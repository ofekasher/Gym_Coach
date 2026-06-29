import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TraineeBottomNav } from "@/components/shared/trainee-bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { isDatabaseConfigured } from "@/lib/prisma";

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  if (!isDatabaseConfigured) {
    return (
      <div className="min-h-screen" style={{ background: "#111111" }}>
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
    <div className="min-h-screen" style={{ background: "#111111" }}>
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
