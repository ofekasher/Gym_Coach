import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const broadcast = await prisma.weeklyBroadcast.findUnique({ where: { coachId: session.user.id } });
  return NextResponse.json({ broadcast });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const dayOfWeek = Number(body.dayOfWeek);
  const hour = Number(body.hour);
  const message = String(body.message ?? "").trim();
  const enabled = Boolean(body.enabled);

  if (dayOfWeek < 0 || dayOfWeek > 6 || hour < 0 || hour > 23) {
    return NextResponse.json({ error: "יום או שעה לא תקינים" }, { status: 400 });
  }
  if (enabled && !message) {
    return NextResponse.json({ error: "צריך לכתוב הודעה כדי להפעיל את התזכורת" }, { status: 400 });
  }

  try {
    const broadcast = await prisma.weeklyBroadcast.upsert({
      where: { coachId: session.user.id },
      create: { coachId: session.user.id, enabled, dayOfWeek, hour, message },
      update: { enabled, dayOfWeek, hour, message },
    });
    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error("saving weekly broadcast failed", error);
    return NextResponse.json({ error: "השמירה נכשלה, נסה שוב" }, { status: 500 });
  }
}
