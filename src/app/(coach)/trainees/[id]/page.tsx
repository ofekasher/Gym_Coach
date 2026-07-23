// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { TraineeDetailClient } from "./trainee-detail-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function TraineeDetailPage({ params }: { params: { id: string } }) {
  if (isDemoId(params.id)) {
    const trainee = DEMO_TRAINEES.find(t => t.id === params.id) ?? DEMO_TRAINEES[0];
    return <TraineeDetailClient trainee={trainee as any} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  try {
    const trainee = await prisma.user.findFirst({
      where: { id: params.id, coachId },
      include: {
        traineeProfile: true,
        workoutPlans: {
          where: { isActive: true },
          include: { sessions: { include: { exercises: { include: { exercise: true } } }, orderBy: { order: "asc" } } },
          orderBy: { createdAt: "desc" }, take: 1,
        },
        nutritionPlans: {
          where: { isActive: true },
          include: { meals: { include: { foodItems: true }, orderBy: { order: "asc" } } },
          orderBy: { createdAt: "desc" }, take: 1,
        },
        checkIns: { orderBy: { date: "desc" }, take: 10, include: { photos: true } },
        workoutLogs: { orderBy: { date: "desc" }, take: 20, include: { session: true, exerciseLogs: { include: { exercise: true } } } },
        timelineEvents: { orderBy: { date: "desc" }, take: 30 },
      },
    });
    if (!trainee) notFound();
    return <TraineeDetailClient trainee={trainee} />;
  } catch (error) {
    console.error("Failed to load trainee detail", error);
    return (
      <div dir="rtl" style={{ textAlign: "center", padding: "80px 20px", color: "#71717A" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#F87171" }}>טעינת פרופיל המתאמן נכשלה</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>בדוק את החיבור ונסה לרענן את הדף</p>
      </div>
    );
  }
}
