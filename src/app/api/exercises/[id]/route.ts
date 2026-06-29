import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
