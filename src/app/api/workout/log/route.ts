// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { traineeId, sessionId, status, exerciseLogs } = await req.json();

  if (traineeId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const ownedSession = await prisma.workoutSession.findFirst({
      where: { id: sessionId, plan: { traineeId } },
      select: { id: true },
    });
    if (!ownedSession) {
      return NextResponse.json({ error: "התוכנית התעדכנה בינתיים — רענן את המסך ונסה שוב" }, { status: 409 });
    }

    const log = await prisma.workoutLog.create({
      data: {
        traineeId,
        sessionId,
        status,
        exerciseLogs: {
          create: (exerciseLogs ?? []).map((el: any) => ({
            exerciseId: el.exerciseId,
            sets: el.sets ?? 0,
            reps: el.reps ?? "",
            weight: el.weight,
          })),
        },
      },
      include: { exerciseLogs: true },
    });

    // Check for new PRs
    const newPRs: { exerciseName: string; weight: number }[] = [];

    if (status === "COMPLETED" && exerciseLogs?.length > 0) {
      for (const el of exerciseLogs) {
        if (!el.weight || !el.exerciseId) continue;

        const previousBest = await prisma.exerciseLog.findFirst({
          where: {
            exerciseId: el.exerciseId,
            workoutLog: { traineeId, status: "COMPLETED" },
            id: { not: log.exerciseLogs.find((l) => l.exerciseId === el.exerciseId)?.id },
          },
          orderBy: { weight: "desc" },
          include: { exercise: true },
        });

        if (!previousBest || (previousBest.weight && el.weight > previousBest.weight)) {
          newPRs.push({ exerciseName: previousBest?.exercise?.name ?? el.exerciseId, weight: el.weight });

          await prisma.timelineEvent.create({
            data: {
              traineeId,
              type: "NEW_PR",
              description: `שיא אישי חדש! ${previousBest?.exercise?.name ?? ""}: ${el.weight} ק״ג`,
              metadata: { exerciseName: previousBest?.exercise?.name ?? "", weight: el.weight },
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, newPRs });
  } catch (error) {
    console.error("workout log failed", error);
    return NextResponse.json({ error: "שמירת האימון נכשלה, נסה שוב" }, { status: 500 });
  }
}
