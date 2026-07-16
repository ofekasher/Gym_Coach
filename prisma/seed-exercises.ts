import { PrismaClient } from "@prisma/client";
import { EXERCISE_LIBRARY } from "../src/lib/exercise-library";

const prisma = new PrismaClient();

async function main() {
  console.log(`Upserting ${EXERCISE_LIBRARY.length} exercises...`);

  // Upsert by name instead of delete+recreate: production already has real SessionExercise
  // rows referencing these exercise IDs (coaches have assigned them to real workout plans),
  // so a destructive delete would violate foreign keys / orphan those assignments.
  const existing = await prisma.exercise.findMany({ where: { isCustom: false }, select: { id: true, name: true } });
  const byName = new Map(existing.map((e) => [e.name, e.id]));

  let created = 0, updated = 0;
  for (const exercise of EXERCISE_LIBRARY) {
    const data = {
      nameEn: exercise.nameEn || null,
      muscleGroup: exercise.muscleGroup,
      secondaryMuscles: exercise.secondaryMuscles,
      description: exercise.description,
      howTo: exercise.howTo,
      tips: exercise.tips,
      commonMistakes: exercise.commonMistakes,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      videoUrl: exercise.videoUrl,
      imageUrl: exercise.imageUrl,
      defaultSets: exercise.defaultSets,
      defaultReps: exercise.defaultReps,
    };
    const existingId = byName.get(exercise.name);
    if (existingId) {
      await prisma.exercise.update({ where: { id: existingId }, data });
      updated++;
    } else {
      await prisma.exercise.create({ data: { name: exercise.name, isCustom: false, coachId: null, ...data } });
      created++;
    }
  }

  console.log(`Done — created ${created}, updated ${updated} exercises`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
