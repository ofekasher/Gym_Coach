// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ExercisesClient } from "./exercises-client";
import { DEMO_EXERCISES, isDemoId } from "@/lib/demo-data";

export default async function ExercisesPage() {
  if (!isDatabaseConfigured) {
    return <ExercisesClient exercises={DEMO_EXERCISES as any} coachId="demo-coach-1" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  if (isDemoId(coachId)) {
    return <ExercisesClient exercises={DEMO_EXERCISES as any} coachId={coachId} />;
  }

  try {
    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ isCustom: false }, { coachId }] },
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    });
    return <ExercisesClient exercises={exercises} coachId={coachId} />;
  } catch (error) {
    console.error("Failed to load exercise library", error);
    return <ExercisesClient exercises={[]} coachId={coachId} />;
  }
}

