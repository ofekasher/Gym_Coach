// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ProgressClient } from "./progress-client";
import { startOfDay } from "date-fns";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function MyProgressPage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} targetWeight={null} todayCalories={0} />;
  }

  const session = await auth();
  const userId = session!.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} targetWeight={null} todayCalories={0} />;
  }

  try {
    const [checkIns, profile, todayLogs] = await Promise.all([
      prisma.weeklyCheckIn.findMany({ where: { traineeId: userId }, orderBy: { date: "asc" } }),
      prisma.traineeProfile.findUnique({ where: { userId } }),
      prisma.nutritionLog.findMany({ where: { traineeId: userId, date: { gte: startOfDay(new Date()) } } }),
    ]);
    const todayCalories = todayLogs.reduce((s: number, l: any) => s + (l.calories ?? 0), 0);
    return <ProgressClient checkIns={checkIns} targetWeight={profile?.targetWeight ?? null} todayCalories={todayCalories} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} targetWeight={null} todayCalories={0} />;
  }
}
