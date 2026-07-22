import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Any coach can attach a demo-video link to any exercise — the exercise library
// is shared across the whole coaching team, not owned per-coach.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoUrl } = await req.json();
  try {
    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: { videoUrl: videoUrl || null },
    });
    return NextResponse.json(exercise);
  } catch (error) {
    console.error("saving exercise video failed", error);
    return NextResponse.json({ error: "השמירה נכשלה" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id: params.id, coachId: session.user.id, isCustom: true },
  });

  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.exercise.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
