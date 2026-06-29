// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";
import { subDays } from "date-fns";
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
  const coachId = session!.user.id;

  try {
    const trainees = await prisma.user.findMany({
      where: { coachId },
      include: {
        traineeProfile: true,
        checkIns: { orderBy: { date: "desc" }, take: 2 },
        workoutLogs: { where: { date: { gte: weekAgo } }, orderBy: { date: "desc" } },
        workoutPlans: { where: { isActive: true }, include: { sessions: true } },
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
  } catch {
    const trainees = DEMO_TRAINEES;
    const stats = {
      total: trainees.length,
      activeThisWeek: trainees.filter(t => t.workoutLogs.length > 0).length,
      checkedInThisWeek: trainees.filter(t => t.checkIns.some(c => c.date >= weekAgo)).length,
      unreadAlerts: DEMO_ALERTS.length,
    };
    return <DashboardClient trainees={trainees as any} alerts={DEMO_ALERTS as any} stats={stats} />;
  }
}

