import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Real, derived notification feed for the coach header bell — no separate Notification
// table; composed live from unread trainee messages + expired/pending trainee payments,
// matching the coach-dashboard spec's "(a) unread trainee messages, (c) payment alerts".
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coachId = session.user.id;

  const trainees = await prisma.user.findMany({
    where: { coachId, role: "TRAINEE" as any },
    select: { id: true, name: true },
  });
  const traineeIds = trainees.map((t) => t.id);
  const traineeName = new Map(trainees.map((t) => [t.id, t.name]));

  const [unreadMessages, subscriptions] = await Promise.all([
    traineeIds.length
      ? prisma.message.findMany({
          where: { senderId: { in: traineeIds }, receiverId: coachId, status: "SENT" as any },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.traineeSubscription.findMany({
      where: { traineeId: { in: traineeIds }, status: { in: ["EXPIRED", "PENDING"] as any } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // One notification per trainee thread — latest unread message only
  const latestByTrainee = new Map<string, (typeof unreadMessages)[number]>();
  for (const m of unreadMessages) {
    if (!latestByTrainee.has(m.senderId)) latestByTrainee.set(m.senderId, m);
  }

  const messageNotifs = Array.from(latestByTrainee.values()).map((m) => ({
    id: `msg-${m.id}`,
    kind: "message" as const,
    title: `הודעה מ${traineeName.get(m.senderId) ?? "מתאמן"}`,
    body: m.content,
    createdAt: m.createdAt,
    href: `/chat?with=${m.senderId}`,
    color: "#b6ff4a",
  }));

  const paymentNotifs = subscriptions.map((s) => ({
    id: `pay-${s.id}`,
    kind: "payment" as const,
    title: s.status === "EXPIRED" ? "תשלום פג תוקף" : "תשלום ממתין",
    body: traineeName.get(s.traineeId) ?? "מתאמן",
    createdAt: s.updatedAt,
    href: "/payments",
    color: s.status === "EXPIRED" ? "#ff5c5c" : "#f5d442",
  }));

  const notifications = [...messageNotifs, ...paymentNotifs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ notifications, unreadCount: notifications.length });
}
