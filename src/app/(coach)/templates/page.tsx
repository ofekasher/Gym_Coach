import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { TemplatesClient } from "./templates-client";

export default async function TemplatesPage() {
  if (!isDatabaseConfigured) {
    return <TemplatesClient templates={[]} trainees={[]} coachId="demo-coach-1" />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  const [templates, trainees] = await Promise.all([
    prisma.workoutPlanTemplate.findMany({ where: { coachId }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ where: { coachId, role: "TRAINEE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <TemplatesClient templates={templates as any} trainees={trainees} coachId={coachId} />;
}
