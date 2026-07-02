// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";
import { ProfileClient } from "./profile-client";

export default async function TraineeProfilePage() {
  if (!isDatabaseConfigured) {
    const demoUser = DEMO_TRAINEES[0];
    return <ProfileClient user={demoUser as any} />;
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (userId && isDemoId(userId)) {
    const demoUser = DEMO_TRAINEES.find((t) => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProfileClient user={demoUser as any} />;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        traineeProfile: true,
        workoutLogs: true,
        workoutPlans: {
          where: { isActive: true },
          include: { sessions: { include: { exercises: true } } },
        },
      },
    });
    return <ProfileClient user={user as any} />;
  } catch {
    const demoUser = DEMO_TRAINEES.find((t) => t.id === userId) ?? DEMO_TRAINEES[0];
    return <ProfileClient user={demoUser as any} />;
  }
}
