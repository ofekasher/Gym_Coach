import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "TRAINEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { photos, ...checkInData } = body;

  const checkIn = await prisma.weeklyCheckIn.create({
    data: {
      traineeId: session.user.id,
      weight: checkInData.weight,
      waist: checkInData.waist,
      chest: checkInData.chest,
      hip: checkInData.hip,
      arm: checkInData.arm,
      bodyFat: checkInData.bodyFat,
      followedPlan: checkInData.followedPlan ?? true,
      workoutsCompleted: checkInData.workoutsCompleted ?? 0,
      traineeNotes: checkInData.traineeNotes,
      photos: {
        create: (photos ?? []).map((p: { angle: string; url: string }) => ({
          url: p.url,
          angle: p.angle as any,
        })),
      },
    },
  });

  // Update profile current weight
  if (checkInData.weight) {
    await prisma.traineeProfile.updateMany({
      where: { userId: session.user.id },
      data: { currentWeight: checkInData.weight },
    });
  }

  await prisma.timelineEvent.create({
    data: {
      traineeId: session.user.id,
      type: "CHECKIN_COMPLETED",
      description: `צ׳ק-אין שבועי הושלם${checkInData.weight ? ` — ${checkInData.weight} ק״ג` : ""}`,
    },
  });

  if (photos?.length > 0) {
    await prisma.timelineEvent.create({
      data: {
        traineeId: session.user.id,
        type: "PROGRESS_PHOTOS_UPLOADED",
        description: `${photos.length} תמונות התקדמות הועלו`,
      },
    });
  }

  return NextResponse.json({ success: true, checkInId: checkIn.id });
}
