import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const exerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  sets: z.number().int().positive(),
  reps: z.string(),
});

const daySchema = z.object({
  name: z.string(),
  dayLabel: z.string(),
  exercises: z.array(exerciseSchema),
});

const createSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["FBW", "UPPER_LOWER", "PPL", "AB", "CUSTOM"]),
  days: z.array(daySchema),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.workoutPlanTemplate.findMany({
    where: { coachId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.parse(await req.json());

  const template = await prisma.workoutPlanTemplate.create({
    data: {
      coachId: session.user.id,
      name: body.name,
      category: body.category as any,
      days: body.days,
    },
  });

  return NextResponse.json(template);
}
