import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  if (!isDatabaseConfigured) {
    return <TeamClient coaches={[]} />;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const coachId = session.user.id;

  const coaches = await prisma.user.findMany({
    where: { coachId, role: "COACH" as any },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return <TeamClient coaches={coaches as any} />;
}
