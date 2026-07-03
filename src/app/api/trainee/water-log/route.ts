import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.waterLog.findMany({
    where: { traineeId: session.user.id, date: { gte: startOfDay(new Date()) } },
    orderBy: { createdAt: "asc" },
  });

  const total = logs.reduce((sum: number, l: any) => sum + l.amount, 0);
  return NextResponse.json({ total, logs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  await prisma.waterLog.create({
    data: { traineeId: session.user.id, amount },
  });

  const logs = await prisma.waterLog.findMany({
    where: { traineeId: session.user.id, date: { gte: startOfDay(new Date()) } },
  });
  const total = logs.reduce((sum: number, l: any) => sum + l.amount, 0);

  return NextResponse.json({ total }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const last = await prisma.waterLog.findFirst({
    where: { traineeId: session.user.id, date: { gte: startOfDay(new Date()) } },
    orderBy: { createdAt: "desc" },
  });

  if (last) {
    await prisma.waterLog.delete({ where: { id: last.id } });
  }

  const logs = await prisma.waterLog.findMany({
    where: { traineeId: session.user.id, date: { gte: startOfDay(new Date()) } },
  });
  const total = logs.reduce((sum: number, l: any) => sum + l.amount, 0);

  return NextResponse.json({ total });
}
