// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { WorkoutBuilderClient } from "./workout-builder-client";
import { DEMO_TRAINEES, DEMO_EXERCISES, isDemoId } from "@/lib/demo-data";

export default async function NewWorkoutPage({ params }: { params: { id: string } }) {
  if (isDemoId(params.id)) {
    const demoTrainee = DEMO_TRAINEES.find(t => t.id === params.id) ?? DEMO_TRAINEES[0];
    return <WorkoutBuilderClient trainee={{ id: demoTrainee.id, name: demoTrainee.name }} exercises={DEMO_EXERCISES as any} coachId="demo-coach-1" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  try {
    const trainee = await prisma.user.findFirst({
      where: { id: params.id, coachId },
      select: { id: true, name: true },
    });
    if (!trainee) notFound();

    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ isCustom: false }, { coachId }] },
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    });
    return <WorkoutBuilderClient trainee={trainee} exercises={exercises} coachId={coachId} />;
  } catch (error) {
    console.error("Failed to load trainee/exercises for workout builder", error);
    return (
      <div dir="rtl" style={{ textAlign: "center", padding: "80px 20px", color: "#71717A" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#F87171" }}>טעינת נתוני בונה האימון נכשלה</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>בדוק את החיבור ונסה לרענן את הדף</p>
      </div>
    );
  }
}
