// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ error: "אימייל נדרש" }, { status: 400 });

  let invite;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "משתמש עם אימייל זה כבר קיים" }, { status: 400 });

    invite = await prisma.inviteToken.create({
      data: {
        email,
        coachId: session.user.id,
        role: role === "COACH" ? "COACH" : "TRAINEE",
        expiresAt: addDays(new Date(), 7),
      },
    });
  } catch (error) {
    console.error("invite creation failed", error);
    return NextResponse.json({ error: "יצירת ההזמנה נכשלה, נסה שוב" }, { status: 500 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/register?token=${invite.token}`;

  // Send email if configured
  if (process.env.EMAIL_SERVER_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `הזמנה להצטרף לאפליקציית מאמן כושר`,
        html: `
          <div dir="rtl" style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>הוזמנת להצטרף!</h2>
            <p>${session.user.name} הזמין/ה אותך להצטרף לאפליקציית מאמן כושר Pro.</p>
            <a href="${inviteUrl}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
              הצטרף/י עכשיו
            </a>
            <p style="margin-top:16px;font-size:12px;color:#666;">הקישור תקף ל-7 ימים.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  return NextResponse.json({ success: true, inviteUrl });
}
