// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { auth } from "@/lib/auth";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { TraineesClient } from "./trainees-client";
import { DEMO_TRAINEES, isDemoId } from "@/lib/demo-data";

export default async function TraineesPage() {
  if (!isDatabaseConfigured) {
    return <TraineesClient trainees={DEMO_TRAINEES as any} />;
  }

  const session = await auth();
  const coachId = session!.user.id;

  if (isDemoId(coachId)) {
    return <TraineesClient trainees={DEMO_TRAINEES as any} />;
  }

  try {
    const trainees = await prisma.user.findMany({
      where: { coachId },
      include: {
        traineeProfile: true,
        checkIns: { orderBy: { date: "desc" }, take: 1 },
        workoutPlans: { where: { isActive: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return <TraineesClient trainees={trainees} />;
  } catch {
    return <TraineesClient trainees={DEMO_TRAINEES as any} />;
  }
}

