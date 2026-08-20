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
    where: { isPremium: true },
    data: { isPremium: false },
  });
  console.log(`✅ ${result.count} articles mis en accès public (isPremium = false)`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
