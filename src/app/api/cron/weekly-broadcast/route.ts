import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// Vercel Cron hits this once a day (see vercel.json — Vercel's Hobby plan hard-caps cron
// invocations at once per day, so true hour-of-day precision needs a Pro-plan upgrade).
// Each coach configures ONE weekly broadcast (day + a "preferred hour" that is stored but
// not yet enforced) from /settings; this fires on the configured day to all of that coach's
// trainees, guarded by lastSentDate so the same broadcast never sends twice in one day.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekdayStr = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", weekday: "short" }).format(now);
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentDayOfWeek = weekdayMap[weekdayStr];
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now); // YYYY-MM-DD

  const due = await prisma.weeklyBroadcast.findMany({
    where: {
      enabled: true,
      dayOfWeek: currentDayOfWeek,
      NOT: { lastSentDate: todayKey },
    },
  });

  let totalSent = 0;
  for (const broadcast of due) {
    const trainees = await prisma.user.findMany({
      where: { coachId: broadcast.coachId, role: "TRAINEE" },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      trainees.map((t) => sendPushToUser(t.id, { title: "הודעה מהמאמן שלך 📣", body: broadcast.message, url: "/my/dashboard" }))
    );
    totalSent += results.filter((r) => r.status === "fulfilled").length;

    await prisma.weeklyBroadcast.update({
      where: { id: broadcast.id },
      data: { lastSentDate: todayKey },
    });
  }

  return NextResponse.json({ checked: due.length, sent: totalSent });
}
