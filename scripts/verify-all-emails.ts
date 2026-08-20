/**
 * Migration : Marquer tous les utilisateurs existants comme ayant un email vérifié
 *
 * À exécuter avec :
 *   npx tsx scripts/verify-all-emails.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      emailVerified: null,
    },
    data: {
      emailVerified: new Date(),
    },
  });
  console.log(`✅ ${result.count} utilisateurs ont été marqués comme ayant un email vérifié.`);
}

main()
  .catch((err) => {
    console.error('Erreur:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
