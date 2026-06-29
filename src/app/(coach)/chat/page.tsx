// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import CoachChatClient from "./coach-chat-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function CoachChatPage() {
  if (!isDatabaseConfigured) {
    const trainees = DEMO_TRAINEES.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return <CoachChatClient myId="demo-coach-1" trainees={trainees} />;
  }

  const session = await auth();
  if (!session || session.user.role !== "COACH") redirect("/login");

  const coachId = session.user.id;

  if (isDemoId(coachId)) {
    const trainees = DEMO_TRAINEES.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return <CoachChatClient myId={coachId} trainees={trainees} />;
  }

  try {
    const trainees = await prisma.user.findMany({
      where: { coachId, role: "TRAINEE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return <CoachChatClient myId={coachId} trainees={trainees} />;
  } catch {
    const trainees = DEMO_TRAINEES.map(t => ({ id: t.id, name: t.name, email: t.email }));
    return <CoachChatClient myId={coachId} trainees={trainees} />;
  }
}

