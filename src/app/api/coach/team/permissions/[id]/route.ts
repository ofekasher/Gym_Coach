import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FLAGS = ["canManageTrainees", "canCreatePlans", "canManageExercises", "canMessage", "canManageSchedule", "canManagePayments"] as const;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only the owner (a sub-coach's coachId points at the current session user) may edit permissions.
  const subCoach = await prisma.user.findFirst({
    where: { id: params.id, coachId: session.user.id, role: "COACH" },
    select: { id: true },
  });
  if (!subCoach) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, boolean> = {};
  for (const flag of FLAGS) {
    if (typeof body[flag] === "boolean") data[flag] = body[flag];
  }

  try {
    const permission = await prisma.coachPermission.upsert({
      where: { coachId: params.id },
      create: { coachId: params.id, ...data },
      update: data,
    });
    return NextResponse.json({ permission });
  } catch (error) {
    console.error("saving coach permission failed", error);
    return NextResponse.json({ error: "השמירה נכשלה, נסה שוב" }, { status: 500 });
  }
}
