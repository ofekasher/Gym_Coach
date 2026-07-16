import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { startOfWeek } from "date-fns";

// Vercel Cron hits this every Thursday morning (see vercel.json).
// Reminds trainees who haven't logged a check-in yet this week to weigh in
// on an empty stomach, after using the bathroom.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });

  const trainees = await prisma.user.findMany({
    where: {
      role: "TRAINEE",
      checkIns: { none: { date: { gte: weekStart } } },
    },
    select: { id: true },
  });

  const results = await Promise.allSettled(
    trainees.map((t) =>
      sendPushToUser(t.id, {
        title: "יום שקילה! ⚖️",
        body: "היום צריך להישקל — על בטן ריקה, אחרי שירותים, לפני האוכל. ככה נקבל מדידה מדויקת 💪",
        url: "/my/checkin",
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ remindedTrainees: trainees.length, sent });
}
