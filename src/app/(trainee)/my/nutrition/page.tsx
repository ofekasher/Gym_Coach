// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { NutritionClient } from "./nutrition-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function MyNutritionPage() {
  if (!isDatabaseConfigured) {
    const plan = DEMO_TRAINEES[0].nutritionPlans[0] ?? null;
    return <NutritionClient plan={plan as any} />;
  }

  const session = await auth();
  const userId = session!.user.id;

  if (isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const plan = demoUser.nutritionPlans[0] ?? null;
    return <NutritionClient plan={plan as any} />;
  }

  try {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { traineeId: userId, isActive: true },
      include: { meals: { include: { foodItems: true }, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return <NutritionClient plan={plan} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const plan = demoUser.nutritionPlans[0] ?? null;
    return <NutritionClient plan={plan as any} />;
  }
}

