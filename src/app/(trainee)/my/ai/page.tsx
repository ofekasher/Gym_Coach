// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { AIChatClient } from "./ai-chat-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function AICoachPage() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") redirect("/login");

  const userId = session.user.id;

  if (!isDatabaseConfigured || isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find(t => t.id === userId) ?? DEMO_TRAINEES[0];
    const userContext = {
      name: demoUser.name?.split(" ")[0] ?? "מתאמן",
      weight: demoUser.checkIns?.[0]?.weight ?? null,
      planName: demoUser.workoutPlans?.[0]?.name ?? null,
      streak: demoUser.workoutLogs?.length ?? 0,
    };
    return <AIChatClient userContext={userContext} />;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workoutPlans: { where: { isActive: true }, take: 1 },
        checkIns: { orderBy: { date: "desc" }, take: 1 },
        workoutLogs: { where: { status: "COMPLETED" }, orderBy: { date: "desc" }, take: 10 },
      },
    });
    const userContext = {
      name: user?.name?.split(" ")[0] ?? "מתאמן",
      weight: user?.checkIns?.[0]?.weight ?? null,
      planName: user?.workoutPlans?.[0]?.name ?? null,
      streak: user?.workoutLogs?.length ?? 0,
    };
    return <AIChatClient userContext={userContext} />;
  } catch (error) {
    console.error("Failed to load AI chat context", error);
    const userContext = { name: session.user.name?.split(" ")[0] ?? "מתאמן", weight: null, planName: null, streak: 0 };
    return <AIChatClient userContext={userContext} />;
  }
}

