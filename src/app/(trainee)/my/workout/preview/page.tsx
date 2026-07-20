// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { WorkoutPreviewClient } from "./preview-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function WorkoutPreviewPage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    const plan = demoUser.workoutPlans[0] ?? null;
    return <WorkoutPreviewClient session={plan?.sessions?.[0] ?? null} coachName="ליאור זיו" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const plan = demoUser.workoutPlans[0] ?? null;
    return <WorkoutPreviewClient session={plan?.sessions?.[0] ?? null} coachName="ליאור זיו" />;
  }

  try {
    const [plan, user] = await Promise.all([
      prisma.workoutPlan.findFirst({
        where: { traineeId: userId, isActive: true },
        include: {
          sessions: {
            include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { coach: { select: { name: true } } } }),
    ]);
    return <WorkoutPreviewClient session={plan?.sessions?.[0] ?? null} coachName={user?.coach?.name ?? "המאמן שלך"} />;
  } catch (error) {
    console.error("Failed to load workout preview", error);
    return <WorkoutPreviewClient session={null} coachName="המאמן שלך" />;
  }
}
