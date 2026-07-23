// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ScheduleClient } from "./schedule-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function SchedulePage() {
  if (!isDatabaseConfigured) {
    const trainees = DEMO_TRAINEES.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return <ScheduleClient trainees={trainees} coachId="demo-coach-1" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  if (isDemoId(coachId)) {
    const trainees = DEMO_TRAINEES.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return <ScheduleClient trainees={trainees} coachId={coachId} />;
  }

  try {
    const trainees = await prisma.user.findMany({
      where: { coachId, role: "TRAINEE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return <ScheduleClient trainees={trainees} coachId={coachId} />;
  } catch (error) {
    console.error("Failed to load schedule trainees", error);
    return <ScheduleClient trainees={[]} coachId={coachId} />;
  }
}

