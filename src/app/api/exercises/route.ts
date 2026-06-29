import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ isCustom: false }, { coachId: session.user.id }] },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const exercise = await prisma.exercise.create({
    data: {
      name: body.name,
      muscleGroup: body.muscleGroup,
      description: body.description || null,
      isCustom: true,
      coachId: session.user.id,
    },
  });

  return NextResponse.json(exercise);
}
