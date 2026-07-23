import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

const DEMO_PAYMENT_TRAINEES = DEMO_TRAINEES.map(t => ({
  id: t.id, name: t.name, email: t.email, subscription: null,
}));

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured || isDemoId(session.user.id)) return NextResponse.json({ trainees: DEMO_PAYMENT_TRAINEES });

  try {
    const trainees = await (prisma as any).user.findMany({
      where: { coachId: session.user.id },
      select: {
        id: true, name: true, email: true,
        subscription: { include: { payments: { orderBy: { paidAt: "desc" }, take: 5 } } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ trainees });
  } catch (error) {
    console.error("Failed to load payments", error);
    return NextResponse.json({ error: "טעינת נתוני התשלומים נכשלה" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isDatabaseConfigured || isDemoId(session.user.id)) return NextResponse.json({ ok: true, demo: true });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create_subscription") {
      const { traineeId, plan, amount, notes } = body;
      const trainee = await prisma.user.findFirst({ where: { id: traineeId, coachId: session.user.id, role: "TRAINEE" }, select: { id: true } });
      if (!trainee) return NextResponse.json({ error: "Trainee not found" }, { status: 404 });

      const endDate = addMonths(plan === "MONTHLY" ? 1 : plan === "QUARTERLY" ? 3 : 12);
      const sub = await (prisma as any).traineeSubscription.upsert({
        where: { traineeId },
        update: { plan, amount, status: "ACTIVE", startDate: new Date(), endDate, notes },
        create: { traineeId, plan, amount, status: "ACTIVE", endDate, notes },
      });
      return NextResponse.json({ subscription: sub });
    }

    if (action === "record_payment") {
      const { subscriptionId, paymentAmount, method, paymentNotes } = body;
      const owned = await (prisma as any).traineeSubscription.findFirst({
        where: { id: subscriptionId, trainee: { coachId: session.user.id } },
        select: { id: true },
      });
      if (!owned) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

      const payment = await (prisma as any).payment.create({
        data: { subscriptionId, amount: paymentAmount, method: method ?? "cash", notes: paymentNotes },
      });
      return NextResponse.json({ payment });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Payments action failed", error);
    return NextResponse.json({ error: "הפעולה נכשלה, נסה שוב" }, { status: 500 });
  }
}

function addMonths(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d;
}

