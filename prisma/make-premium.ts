import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Passage de tous les articles en Premium...");

  const result = await prisma.article.updateMany({
    data: {
      isPremium: true,
    },
  });

  console.log(`${result.count} articles ont été mis à jour en statut PREMIUM.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
