// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";
import { ProfileClient } from "./profile-client";

export default async function TraineeProfilePage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    return <ProfileClient user={demoUser as any} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find((t) => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProfileClient user={demoUser as any} />;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        traineeProfile: true,
        workoutLogs: true,
        workoutPlans: {
          where: { isActive: true },
          include: { sessions: { include: { exercises: true } } },
        },
      },
    });
    return <ProfileClient user={user as any} />;
  } catch (error) {
    console.error("Failed to load trainee profile", error);
    return (
      <div dir="rtl" style={{ textAlign: "center", padding: "80px 20px", color: "#71717A" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#F87171" }}>טעינת הפרופיל נכשלה</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>בדוק את החיבור ונסה לרענן את הדף</p>
      </div>
    );
  }
}
