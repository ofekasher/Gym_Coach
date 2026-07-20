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
  } catch {
    const demoTrainee = DEMO_TRAINEES.find(t => t.id === params.id) ?? DEMO_TRAINEES[0];
    return <WorkoutBuilderClient trainee={{ id: demoTrainee.id, name: demoTrainee.name }} exercises={DEMO_EXERCISES as any} coachId={coachId} />;
  }
}
