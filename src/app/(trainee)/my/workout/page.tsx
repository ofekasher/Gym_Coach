// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
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
  const userId = session!.user.id;

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
    return <WorkoutLoggingClient plan={plan} userId={userId} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const plan = demoUser.workoutPlans[0] ?? null;
    return <WorkoutLoggingClient plan={plan as any} userId={userId} />;
  }
}

