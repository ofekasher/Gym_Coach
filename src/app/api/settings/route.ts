import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { isDemoId } from "@/lib/demo-data";
import bcrypt from "bcryptjs";

const DEMO_SETTINGS = {
  settings: { businessName: "SmartFit Demo", bio: "מאמן כושר מקצועי", phone: "050-0000000", currency: "ILS", monthlyPrice: 400, quarterPrice: 1100, annualPrice: 3900, notifyWorkout: true, notifyCheckin: true, notifyInactive: true, notifyPayment: true },
  coach: { name: "ליאור זיו", email: "coach@demo.com" },
};

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured || isDemoId(session.user.id)) return NextResponse.json(DEMO_SETTINGS);

  try {
    const settings = await prisma.coachSettings.findUnique({ where: { coachId: session.user.id } });
    const coach = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } });
    return NextResponse.json({ settings, coach });
  } catch (error) {
    console.error("Failed to load settings", error);
    return NextResponse.json({ error: "טעינת ההגדרות נכשלה" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured || isDemoId(session.user.id)) return NextResponse.json({ ok: true, demo: true });

  try {
    const body = await req.json();
    const { name, businessName, bio, phone, currency, monthlyPrice, quarterPrice, annualPrice,
      notifyWorkout, notifyCheckin, notifyInactive, notifyPayment, newPassword } = body;

    if (newPassword) {
      if (newPassword.length < 8) return NextResponse.json({ error: "הסיסמה חייבת להכיל לפחות 8 תווים" }, { status: 400 });
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
    }

    if (name) {
      await prisma.user.update({ where: { id: session.user.id }, data: { name } });
    }

    const settings = await prisma.coachSettings.upsert({
      where: { coachId: session.user.id },
      update: { businessName, bio, phone, currency, monthlyPrice, quarterPrice, annualPrice,
        notifyWorkout, notifyCheckin, notifyInactive, notifyPayment },
      create: { coachId: session.user.id, businessName, bio, phone, currency, monthlyPrice,
        quarterPrice, annualPrice, notifyWorkout, notifyCheckin, notifyInactive, notifyPayment },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json({ error: "השמירה נכשלה, נסה שוב" }, { status: 500 });
  }
}

