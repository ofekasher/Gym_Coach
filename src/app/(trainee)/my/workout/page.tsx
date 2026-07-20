// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { WorkoutLoggingClient } from "./workout-logging-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function MyWorkoutPage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    const plan = demoUser.workoutPlans[0] ?? null;
    return <WorkoutLoggingClient plan={plan as any} userId="demo-trainee-1" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const plan = demoUser.workoutPlans[0] ?? null;
    return <WorkoutLoggingClient plan={plan as any} userId={userId} />;
  }

  try {
    const plan = await prisma.workoutPlan.findFirst({
      where: { traineeId: userId, isActive: true },
      include: {
        sessions: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Personal record + last-performance per exercise, from the trainee's real log history.
    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: { workoutLog: { traineeId: userId } },
      include: { workoutLog: { select: { date: true } } },
      orderBy: { workoutLog: { date: "desc" } },
    });
    const exerciseHistory: Record<string, { pr: number; lastLabel: string }> = {};
    for (const log of exerciseLogs) {
      const entry = exerciseHistory[log.exerciseId] ?? { pr: 0, lastLabel: "" };
      if (log.weight != null && log.weight > entry.pr) entry.pr = log.weight;
      if (!entry.lastLabel) entry.lastLabel = `${log.sets}×${log.reps}${log.weight ? ` · ${log.weight} ק״ג` : ""}`;
      exerciseHistory[log.exerciseId] = entry;
    }

    return <WorkoutLoggingClient plan={plan} userId={userId} exerciseHistory={exerciseHistory} />;
  } catch (error) {
    // A real logged-in trainee must never silently see fabricated demo data —
    // that would mask an actual DB outage. Show the real "no plan" empty state instead.
    console.error("Failed to load workout plan", error);
    return <WorkoutLoggingClient plan={null} userId={userId} />;
  }
}

