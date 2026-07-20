import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { traineeId, calories, protein, carbs, fat, preferences, notes, meals } = body;

  const trainee = await prisma.user.findFirst({
    where: { id: traineeId, coachId: session.user.id, role: "TRAINEE" },
    select: { id: true },
  });
  if (!trainee) return NextResponse.json({ error: "Trainee not found" }, { status: 404 });

  // Deactivate old plans
  await prisma.nutritionPlan.updateMany({
    where: { traineeId, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.nutritionPlan.create({
    data: {
      traineeId,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      preferences: preferences ?? [],
      notes: notes || null,
      isActive: true,
      meals: {
        create: meals.map((m: any, i: number) => ({
          name: m.name,
          time: m.time || null,
          order: i,
          foodItems: {
            create: m.foodItems.map((item: any) => ({
              name: item.name,
              quantity: Number(item.quantity),
              unit: item.unit,
              calories: Number(item.calories),
              protein: Number(item.protein),
              carbs: Number(item.carbs),
              fat: Number(item.fat),
              category: item.category || null,
            })),
          },
        })),
      },
    },
  });

  await prisma.timelineEvent.create({
    data: {
      traineeId,
      type: "NUTRITION_PLAN_UPDATED",
      description: `תוכנית תזונה עודכנה — ${calories} קק״ל`,
    },
  });

  return NextResponse.json({ success: true, planId: plan.id });
}
