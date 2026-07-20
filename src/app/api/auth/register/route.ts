// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  token: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, token } = schema.parse(body);

    const invite = await prisma.inviteToken.findUnique({ where: { token } });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "קישור הזמנה לא תקין או שפג תוקפו" }, { status: 400 });
    }

    if (invite.email !== email) {
      return NextResponse.json({ error: "האימייל אינו תואם להזמנה" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "משתמש עם אימייל זה כבר קיים" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = invite.role === "COACH" ? "COACH" : "TRAINEE";

    // Atomically claim the invite (used: false → true) so two concurrent requests
    // with the same token can't both pass the earlier `!invite.used` check and race.
    const claimed = await prisma.inviteToken.updateMany({
      where: { id: invite.id, used: false },
      data: { used: true },
    });
    if (claimed.count === 0) {
      return NextResponse.json({ error: "קישור ההזמנה כבר נוצל" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        coachId: invite.coachId,
      },
    });

    if (role === "TRAINEE") {
      await prisma.traineeProfile.create({ data: { userId: user.id } });
      await prisma.timelineEvent.create({
        data: {
          traineeId: user.id,
          type: "TRAINEE_JOINED",
          description: `${name} הצטרף/ה לאימונים`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "שגיאה בהרשמה" }, { status: 500 });
  }
}
