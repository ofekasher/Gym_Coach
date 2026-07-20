import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// Vercel Cron hits this hourly (see vercel.json). Each coach configures ONE weekly
// broadcast (day + hour, Israel local time) from /settings; this checks every enabled
// broadcast against the current Israel day/hour and fires it to all of that coach's
// trainees, guarded by lastSentDate so the same broadcast never sends twice in one day.
//
// Note: on Vercel's Hobby plan, cron invocations are capped at roughly once per day —
// the hourly schedule below only fires at true hourly granularity on a Pro plan.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const israelParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekdayStr = israelParts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const currentDayOfWeek = weekdayMap[weekdayStr];
  const currentHour = Number(israelParts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now); // YYYY-MM-DD

  const due = await prisma.weeklyBroadcast.findMany({
    where: {
      enabled: true,
      dayOfWeek: currentDayOfWeek,
      hour: currentHour,
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
