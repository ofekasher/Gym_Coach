import { PrismaClient } from "@prisma/client";
import { EXERCISE_LIBRARY } from "../src/lib/exercise-library";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${EXERCISE_LIBRARY.length} exercises...`);

  await prisma.exercise.deleteMany({ where: { isCustom: false } });

  let count = 0;
  for (const exercise of EXERCISE_LIBRARY) {
    await prisma.exercise.create({
      data: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        description: exercise.description,
        howTo: exercise.howTo,
        tips: exercise.tips,
        commonMistakes: exercise.commonMistakes,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
        videoUrl: exercise.videoUrl,
        imageUrl: exercise.imageUrl,
        isCustom: false,
        coachId: null,
      },
    });
    count++;
  }

  console.log(`Seeded ${count} exercises successfully`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
