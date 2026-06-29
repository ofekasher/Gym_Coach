import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
  startingWeight: z.number().optional(),
  currentWeight: z.number().optional(),
  goals: z.array(z.string()),
  injuries: z.string().optional(),
  medicalConditions: z.string().optional(),
  limitations: z.string().optional(),
  medications: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trainee = await prisma.user.findFirst({ where: { id: params.id, coachId: session.user.id } });
  if (!trainee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = schema.parse(await req.json());

  await prisma.traineeProfile.upsert({
    where: { userId: params.id },
    update: {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    },
    create: {
      userId: params.id,
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    },
  });

  return NextResponse.json({ success: true });
}
