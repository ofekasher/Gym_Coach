// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";
import { subDays } from "date-fns";
import { startOfDayIsrael } from "@/lib/date";
import { DEMO_TRAINEES, DEMO_ALERTS, isDemoId } from "@/lib/demo-data";

export default async function DashboardPage() {
  const weekAgo = subDays(new Date(), 7);

  if (!isDatabaseConfigured) {
    const trainees = DEMO_TRAINEES;
    const stats = {
      total: trainees.length,
      activeThisWeek: trainees.filter(t => t.workoutLogs.length > 0).length,
      checkedInThisWeek: trainees.filter(t => t.checkIns.some(c => c.date >= weekAgo)).length,
      unreadAlerts: DEMO_ALERTS.length,
    };
    return <DashboardClient trainees={trainees as any} alerts={DEMO_ALERTS as any} stats={stats} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  try {
    const todayStart = startOfDayIsrael();
    const trainees = await prisma.user.findMany({
      where: { coachId },
      include: {
        traineeProfile: true,
        checkIns: { orderBy: { date: "desc" }, take: 2 },
        workoutLogs: { where: { date: { gte: weekAgo } }, orderBy: { date: "desc" } },
        workoutPlans: { where: { isActive: true }, include: { sessions: true } },
        nutritionPlans: { where: { isActive: true }, take: 1 },
        nutritionLogs: { where: { date: { gte: todayStart } } },
        waterLogs: { where: { date: { gte: todayStart } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const alerts = await prisma.coachAlert.findMany({
      where: { coachId, isRead: false },
      include: { trainee: { select: { name: true, id: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const stats = {
      total: trainees.length,
      activeThisWeek: trainees.filter(t => t.workoutLogs.length > 0).length,
      checkedInThisWeek: trainees.filter(t => t.checkIns.some(c => c.date >= weekAgo)).length,
      unreadAlerts: alerts.length,
    };

    return <DashboardClient trainees={trainees} alerts={alerts} stats={stats} />;
  } catch (error) {
    console.error("Failed to load coach dashboard", error);
    return <DashboardClient trainees={[]} alerts={[]} stats={{ total: 0, activeThisWeek: 0, checkedInThisWeek: 0, unreadAlerts: 0 }} />;
  }
}

