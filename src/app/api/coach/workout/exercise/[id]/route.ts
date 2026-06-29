import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const exercise = await prisma.sessionExercise.update({
    where: { id: params.id },
    data: {
      sets: data.sets !== undefined ? Number(data.sets) : undefined,
      reps: data.reps !== undefined ? String(data.reps) : undefined,
      weight: data.weight !== undefined && data.weight !== "" ? Number(data.weight) : null,
      techniqueNotes: data.techniqueNotes ?? undefined,
    },
  });
  return NextResponse.json(exercise);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.sessionExercise.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
