import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessionExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.string(),
  weight: z.number().optional(),
  restTime: z.number().optional(),
  techniqueNotes: z.string().optional(),
});

const sessionSchema = z.object({
  name: z.string(),
  dayLabel: z.string(),
  exercises: z.array(sessionExerciseSchema),
});

const schema = z.object({
  traineeId: z.string(),
  name: z.string(),
  template: z.string(),
  sessions: z.array(sessionSchema),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.parse(await req.json());

  // Only allow assigning plans to trainees that actually belong to this coach —
  // never trust a client-supplied coachId or an unverified traineeId.
  const trainee = await prisma.user.findFirst({
    where: { id: body.traineeId, coachId: session.user.id, role: "TRAINEE" },
    select: { id: true },
  });
  if (!trainee) {
    return NextResponse.json({ error: "Trainee not found" }, { status: 404 });
  }

  // Deactivate old plans
  await prisma.workoutPlan.updateMany({
    where: { traineeId: body.traineeId, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.workoutPlan.create({
    data: {
      traineeId: body.traineeId,
      coachId: session.user.id,
      name: body.name,
      template: body.template as any,
      isActive: true,
      sessions: {
        create: body.sessions.map((s, i) => ({
          name: s.name,
          dayLabel: s.dayLabel,
          order: i,
          exercises: {
            create: s.exercises.map((ex, j) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              restTime: ex.restTime,
              techniqueNotes: ex.techniqueNotes,
              order: j,
            })),
          },
        })),
      },
    },
  });

  await prisma.timelineEvent.create({
    data: {
      traineeId: body.traineeId,
      type: "WORKOUT_PLAN_CREATED",
      description: `תוכנית אימון חדשה נוצרה: ${body.name}`,
    },
  });

  return NextResponse.json({ success: true, planId: plan.id });
}
