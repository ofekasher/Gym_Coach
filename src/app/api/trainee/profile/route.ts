import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { traineeProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ name: user.name, email: user.email, profile: user.traineeProfile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    height, currentWeight, targetWeight, bodyFat,
    goal, equipment, limitations, notifications,
  } = body;

  const data: Record<string, any> = {};
  if (height !== undefined) data.height = height;
  if (currentWeight !== undefined) data.currentWeight = currentWeight;
  if (targetWeight !== undefined) data.targetWeight = targetWeight;
  if (bodyFat !== undefined) data.bodyFat = bodyFat;
  if (goal !== undefined) data.goal = goal;
  if (equipment !== undefined) data.equipment = equipment;
  if (limitations !== undefined) data.limitations = limitations;
  if (notifications !== undefined) data.notifications = notifications;

  const profile = await prisma.traineeProfile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  return NextResponse.json({ profile });
}
