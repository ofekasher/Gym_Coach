import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const plan = await prisma.nutritionPlan.update({
    where: { id: params.id },
    data: {
      calories: data.calories !== undefined ? Number(data.calories) : undefined,
      protein: data.protein !== undefined ? Number(data.protein) : undefined,
      carbs: data.carbs !== undefined ? Number(data.carbs) : undefined,
      fat: data.fat !== undefined ? Number(data.fat) : undefined,
    },
  });
  return NextResponse.json(plan);
}
