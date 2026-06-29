import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");
  if (!withUserId) return NextResponse.json({ error: "Missing param" }, { status: 400 });

  const me = session.user.id;

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

  const message = await prisma.message.create({
    data: { senderId: session.user.id, receiverId, content: content.trim() },
  });

  return NextResponse.json({ message });
}
