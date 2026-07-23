// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { NutritionBuilderClient } from "./nutrition-builder-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function NewNutritionPage({ params }: { params: { id: string } }) {
  if (isDemoId(params.id)) {
    const demoTrainee = DEMO_TRAINEES.find(t => t.id === params.id) ?? DEMO_TRAINEES[0];
    return <NutritionBuilderClient trainee={demoTrainee as any} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  try {
    const trainee = await prisma.user.findFirst({
      where: { id: params.id, coachId },
      include: {
        traineeProfile: { select: { goals: true } },
        nutritionPlans: {
          where: { isActive: true },
          include: { meals: { include: { foodItems: true }, orderBy: { order: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!trainee) notFound();
    return <NutritionBuilderClient trainee={trainee} />;
  } catch (error) {
    console.error("Failed to load trainee for nutrition builder", error);
    return (
      <div dir="rtl" style={{ textAlign: "center", padding: "80px 20px", color: "#71717A" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#F87171" }}>טעינת פרטי המתאמן נכשלה</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>בדוק את החיבור ונסה לרענן את הדף</p>
      </div>
    );
  }
}
