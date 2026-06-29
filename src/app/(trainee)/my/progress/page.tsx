// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ProgressClient } from "./progress-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function MyProgressPage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} workoutLogs={demoUser.workoutLogs as any} />;
  }

  const session = await auth();
  const userId = session!.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} workoutLogs={demoUser.workoutLogs as any} />;
  }

  try {
    const checkIns = await prisma.weeklyCheckIn.findMany({
      where: { traineeId: userId },
      orderBy: { date: "asc" },
      include: { photos: true },
    });
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { traineeId: userId },
      orderBy: { date: "asc" },
      take: 50,
    });
    return <ProgressClient checkIns={checkIns} workoutLogs={workoutLogs} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} workoutLogs={demoUser.workoutLogs as any} />;
  }
}

