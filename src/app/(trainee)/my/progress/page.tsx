// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ProgressClient } from "./progress-client";
import { startOfDayIsrael } from "@/lib/date";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function MyProgressPage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} targetWeight={null} waterMl={0} todayCalories={0} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProgressClient checkIns={demoUser.checkIns as any} targetWeight={null} waterMl={0} todayCalories={0} />;
  }

  try {
    const [checkIns, profile, waterLogs, todayLogs] = await Promise.all([
      prisma.weeklyCheckIn.findMany({ where: { traineeId: userId }, orderBy: { date: "asc" } }),
      prisma.traineeProfile.findUnique({ where: { userId } }),
      prisma.waterLog.findMany({ where: { traineeId: userId, date: { gte: startOfDayIsrael() } } }),
      prisma.nutritionLog.findMany({ where: { traineeId: userId, date: { gte: startOfDayIsrael() } } }),
    ]);
    const waterMl = waterLogs.reduce((s: number, l: any) => s + (l.amount ?? 0), 0);
    const todayCalories = todayLogs.reduce((s: number, l: any) => s + (l.calories ?? 0), 0);
    return <ProgressClient checkIns={checkIns} targetWeight={profile?.targetWeight ?? null} waterMl={waterMl} todayCalories={todayCalories} />;
  } catch (error) {
    console.error("Failed to load progress data", error);
    return <ProgressClient checkIns={[]} targetWeight={null} waterMl={0} todayCalories={0} />;
  }
}
