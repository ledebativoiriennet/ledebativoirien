/**
 * Migration : rendre tous les articles publics (isPremium = false)
 *
 * À exécuter sur la production avec :
 *   npx tsx scripts/make-all-articles-public.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.article.updateMany({
    where: {
      OR: [
        { isPremium: true },
        { isConfidentiel: true }
      ]
    },
    data: {
      isPremium: false,
      isConfidentiel: false
    },
  });
  console.log(`✅ ${result.count} articles mis en accès public (Premium et Confidentiel désactivés).`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
