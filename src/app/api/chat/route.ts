import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Chat is only allowed between a coach and their own trainee, or a coach and
// their own sub-coach (team) — never between two arbitrary users on the platform.
async function canChatWith(myId: string, otherId: string): Promise<boolean> {
  if (myId === otherId) return false;
  const [me, other] = await Promise.all([
    prisma.user.findUnique({ where: { id: myId }, select: { coachId: true } }),
    prisma.user.findUnique({ where: { id: otherId }, select: { id: true, coachId: true } }),
  ]);
  if (!me || !other) return false;
  return other.id === me.coachId || other.coachId === myId;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");
  if (!withUserId) return NextResponse.json({ error: "Missing param" }, { status: 400 });

  const me = session.user.id;
  if (!(await canChatWith(me, withUserId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me, receiverId: withUserId },
        { senderId: withUserId, receiverId: me },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  // Mark received messages as READ
  await prisma.message.updateMany({
    where: { senderId: withUserId, receiverId: me, status: "SENT" },
    data: { status: "READ" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();
  if (!receiverId || !content?.trim()) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (!(await canChatWith(session.user.id, receiverId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content: content.trim() },
  });

  return NextResponse.json({ message });
}
