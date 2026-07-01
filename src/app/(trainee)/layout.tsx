import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TraineeBottomNav } from "@/components/shared/trainee-bottom-nav";
import { Toaster } from "@/components/ui/toaster";
import { isDatabaseConfigured } from "@/lib/prisma";

export default async function TraineeLayout({ children }: { children: React.ReactNode }) {
  const bgStyle: React.CSSProperties = {
    background:
      "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(ellipse 600px 400px at 90% 30%, rgba(139,92,246,0.08), transparent 60%), #0A0E14",
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
