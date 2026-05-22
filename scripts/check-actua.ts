import { prisma } from '../src/lib/prisma';

async function main() {
  // Check how many articles are in 'actualite'
  const count = await (prisma as any).article.count({
    where: { publishedAt: { not: null }, categories: { some: { slug: 'actualite' } } }
  });
  console.log(`Articles with slug 'actualite': ${count}`);

  // Fetch the top 4 to see if they exist
  const articles = await (prisma as any).article.findMany({
    where: { publishedAt: { not: null }, categories: { some: { slug: 'actualite' } } },
    take: 4,
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, publishedAt: true, categories: { select: { slug: true } } },
    include: undefined
  });
  console.log('\nTop 4 Actualité articles:');
  console.log(JSON.stringify(articles, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
