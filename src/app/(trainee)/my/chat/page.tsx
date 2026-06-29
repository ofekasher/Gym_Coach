// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ChatWindow } from "@/components/shared/chat-window";
import { isDemoId } from "@/lib/demo-data";

const DEMO_COACH = { id: "demo-coach-001", name: "יוני מאמן", email: "coach@demo.com" };

export default async function TraineeChatPage() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") redirect("/login");

  const userId = session.user.id;

  if (!isDatabaseConfigured || isDemoId(userId)) {
    return (
      <div style={{ height: "calc(100vh - 100px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
        <ChatWindow myId={userId} otherId={DEMO_COACH.id} otherName={DEMO_COACH.name} />
      </div>
    );
  }

  try {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      include: { coach: { select: { id: true, name: true, email: true } } },
    });

    if (!me?.coach) {
      return (
        <div style={{ padding: 32, textAlign: "center", color: "#52525B" }} dir="rtl">
          <p>אין לך מאמן מחובר עדיין.</p>
        </div>
      );
    }

    return (
      <div style={{ height: "calc(100vh - 100px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
        <ChatWindow myId={userId} otherId={me.coach.id} otherName={me.coach.name ?? me.coach.email} />
      </div>
    );
  } catch {
    return (
      <div style={{ height: "calc(100vh - 100px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
        <ChatWindow myId={userId} otherId={DEMO_COACH.id} otherName={DEMO_COACH.name} />
      </div>
    );
  }
}

