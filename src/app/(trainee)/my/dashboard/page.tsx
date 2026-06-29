// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { TraineeDashboardClient } from "./trainee-dashboard-client";
import { startOfDay } from "date-fns";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function TraineeDashboardPage() {
  if (!isDatabaseConfigured) {
    return <TraineeDashboardClient user={DEMO_TRAINEES[0] as any} />;
  }

  const session = await auth();
  const userId = session!.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <TraineeDashboardClient user={demoUser as any} />;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        traineeProfile: true,
        workoutPlans: {
          where: { isActive: true },
          include: {
            sessions: {
              include: { exercises: { include: { exercise: true } } },
              orderBy: { order: "asc" },
            },
          },
          take: 1,
        },
        workoutLogs: {
          where: { date: { gte: startOfDay(new Date()) } },
          include: { session: true },
        },
        checkIns: { orderBy: { date: "desc" }, take: 1 },
      },
    });
    return <TraineeDashboardClient user={user} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <TraineeDashboardClient user={demoUser as any} />;
  }
}

