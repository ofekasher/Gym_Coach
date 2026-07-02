// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";
import { BackHeader } from "@/components/shared/back-header";

export default async function TraineeProfilePage() {
  let user = DEMO_TRAINEES[0];

  if (isDatabaseConfigured) {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId && !isDemoId(userId)) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser) user = dbUser as any;
      } catch {}
    } else if (userId) {
      user = DEMO_TRAINEES.find((t) => t.id === userId) ?? DEMO_TRAINEES[0];
    }
  }

  return (
    <div dir="rtl">
      <BackHeader title="פרופיל" />
      <div style={{ background: "#161B22", borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{user.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{user.email}</div>
      </div>
    </div>
  );
}
