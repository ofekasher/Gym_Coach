// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { ChatWindow } from "@/components/shared/chat-window";
import { BackHeader } from "@/components/shared/back-header";
import { isDemoId } from "@/lib/demo-data";

const DEMO_COACH = { id: "demo-coach-001", name: "ליאור זיו", email: "coach@demo.com" };

export default async function TraineeChatPage() {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") redirect("/login");

  const userId = session.user.id;

  if (!isDatabaseConfigured || isDemoId(userId)) {
    return (
      <div dir="rtl">
        <BackHeader title="צ׳אט עם המאמן" />
        <div style={{ height: "calc(100vh - 220px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, overflow: "hidden" }}>
          <ChatWindow myId={userId} otherId={DEMO_COACH.id} otherName={DEMO_COACH.name} />
        </div>
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
        <div dir="rtl">
          <BackHeader title="צ׳אט עם המאמן" />
          <div style={{ padding: 32, textAlign: "center", color: "#52525B" }}>
            <p>אין לך מאמן מחובר עדיין.</p>
          </div>
        </div>
      );
    }

    return (
      <div dir="rtl">
        <BackHeader title="צ׳אט עם המאמן" subtitle={me.coach.name ?? me.coach.email} />
        <div style={{ height: "calc(100vh - 220px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, overflow: "hidden" }}>
          <ChatWindow myId={userId} otherId={me.coach.id} otherName={me.coach.name ?? me.coach.email} />
        </div>
      </div>
    );
  } catch {
    return (
      <div dir="rtl">
        <BackHeader title="צ׳אט עם המאמן" />
        <div style={{ height: "calc(100vh - 220px)", background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, overflow: "hidden" }}>
          <ChatWindow myId={userId} otherId={DEMO_COACH.id} otherName={DEMO_COACH.name} />
        </div>
      </div>
    );
  }
}

