import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return !!session?.value;
}

// Admins can manage any user; coaches may only create trainees under themselves.
async function verifyRequester(): Promise<{ ok: boolean; coachId: string | null }> {
  if (await verifyAdmin()) return { ok: true, coachId: null };

  const session = await auth();
  if (session?.user?.role === "COACH") return { ok: true, coachId: session.user.id };

  return { ok: false, coachId: null };
}

export async function GET() {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      coachId: true,
      _count: { select: { trainees: true, workoutLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const requester = await verifyRequester();
  if (!requester.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, name, email, password, phone } = await req.json();

  if (action === "create") {
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "משתמש עם אימייל זה כבר קיים" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone: phone ?? null,
          role: "TRAINEE",
          coachId: requester.coachId,
        },
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
      console.error("Failed to create trainee:", err);
      return NextResponse.json({ error: "שגיאה ביצירת המתאמן" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function PATCH(req: Request) {
  if (!(await verifyAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, action } = await req.json();

  if (action === "delete") {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  }

  if (action === "setRole") {
    const { role } = await req.json();
    await prisma.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
