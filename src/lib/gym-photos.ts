// User-provided gym photos, distributed across the app by category
export const GYM_PHOTOS = {
  cableArms: "/images/gym/cable-arms.jpg",
  dumbbellCurl: "/images/gym/dumbbell-curl.jpg",
  coachSitups: "/images/gym/coach-situps.jpg",
  treadmillRun: "/images/gym/treadmill-run.jpg",
  pullupBack: "/images/gym/pullup-back.jpg",
} as const;

export function getMuscleGymPhoto(muscleGroup: string | undefined): string {
  if (muscleGroup?.includes("ידיים") || muscleGroup?.includes("זרוע")) return GYM_PHOTOS.cableArms;
  if (muscleGroup?.includes("גב")) return GYM_PHOTOS.pullupBack;
  if (muscleGroup?.includes("בטן")) return GYM_PHOTOS.coachSitups;
  if (muscleGroup?.includes("רגליים")) return GYM_PHOTOS.treadmillRun;
  return GYM_PHOTOS.dumbbellCurl;
}
