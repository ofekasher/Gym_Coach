// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

// POST: generate alerts for all trainees of the coach
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coachId = session.user.id;
  const weekAgo = subDays(new Date(), 7);
  const twoWeeksAgo = subDays(new Date(), 14);

  const trainees = await prisma.user.findMany({
    where: { coachId },
    include: {
      checkIns: { where: { date: { gte: weekAgo } }, orderBy: { date: "desc" } },
      workoutLogs: { where: { date: { gte: weekAgo } } },
      sessions: { where: { expires: { gte: new Date() } }, orderBy: { expires: "desc" }, take: 1 },
    },
  });

  const newAlerts: { type: string; message: string; traineeId: string }[] = [];

  for (const trainee of trainees) {
    // No check-in this week
    if (trainee.checkIns.length === 0) {
      newAlerts.push({
        type: "NO_CHECKIN",
        message: `${trainee.name} לא שלח/ה צ׳ק-אין השבוע`,
        traineeId: trainee.id,
      });
    }

    // Low workout consistency (less than 2 per week)
    const completedWorkouts = trainee.workoutLogs.filter((l) => l.status === "COMPLETED").length;
    if (completedWorkouts < 2) {
      newAlerts.push({
        type: "LOW_CONSISTENCY",
        message: `${trainee.name} השלים/ה רק ${completedWorkouts} אימונים השבוע`,
        traineeId: trainee.id,
      });
    }

    // No weight update in 2 weeks
    const recentWeight = await prisma.weeklyCheckIn.findFirst({
      where: { traineeId: trainee.id, date: { gte: twoWeeksAgo }, weight: { not: null } },
    });
    if (!recentWeight) {
      newAlerts.push({
        type: "NO_WEIGHT_UPDATE",
        message: `${trainee.name} לא עדכן/ה משקל ב-2 שבועות`,
        traineeId: trainee.id,
      });
    }
  }

  // Avoid duplicate alerts (don't add if same type+trainee already unread)
  const existingAlerts = await prisma.coachAlert.findMany({
    where: { coachId, isRead: false },
  });

  const toCreate = newAlerts.filter((alert) => {
    return !existingAlerts.some(
      (ea) => ea.traineeId === alert.traineeId && ea.type === alert.type
    );
  });

  if (toCreate.length > 0) {
    await prisma.coachAlert.createMany({
      data: toCreate.map((a) => ({ ...a, coachId })),
    });
  }

  return NextResponse.json({ created: toCreate.length });
}

// PATCH: mark alert as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId } = await req.json();

  await prisma.coachAlert.update({
    where: { id: alertId, coachId: session.user.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}

// GET: list alerts
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.coachAlert.findMany({
    where: { coachId: session.user.id, isRead: false },
    include: { trainee: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}
