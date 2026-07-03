import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.nutritionLog.findMany({
    where: { traineeId: session.user.id, date: { gte: startOfDay(new Date()) } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mealName, foodName, actualGrams, calories, protein, carbs, fat, plannedGrams, source } = await req.json();

  if (!mealName || !foodName || actualGrams == null || calories == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const log = await prisma.nutritionLog.create({
    data: {
      traineeId: session.user.id,
      mealName,
      foodName,
      actualGrams,
      calories,
      protein,
      carbs,
      fat,
      plannedGrams,
      source: source ?? "plan",
    },
  });

  return NextResponse.json({ log }, { status: 201 });
}
