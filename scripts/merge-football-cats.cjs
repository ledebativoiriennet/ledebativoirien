const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Merging Foot Ball into Football...');

  // 1. Get the categories
  const footballCat = await prisma.category.findUnique({ where: { slug: 'football' } });
  const footBallCat = await prisma.category.findUnique({ where: { slug: 'foot-ball' } });

  if (!footballCat) {
    console.log('Target category "football" not found. Creating it...');
    // Create it if it doesn't exist
    const newFootball = await prisma.category.create({ data: { name: 'Football', slug: 'football' } });
    // Retry finding foot-ball
    if (footBallCat) {
        await merge(footBallCat, newFootball);
    }
    return;
  }

  if (!footBallCat) {
    console.log('Source category "foot-ball" not found. Nothing to merge.');
    return;
  }

  await merge(footBallCat, footballCat);
}

async function merge(source, target) {
  console.log(`Moving articles from ${source.name} (${source.id}) to ${target.name} (${target.id})...`);

  // Find articles in the source category
  const articles = await prisma.article.findMany({
    where: { categories: { some: { id: source.id } } }
  });

  console.log(`Found ${articles.length} articles to move.`);

  for (const article of articles) {
    // Connect to target and disconnect from source
    await prisma.article.update({
      where: { id: article.id },
      data: {
        categories: {
          connect: { id: target.id },
          disconnect: { id: source.id }
        }
      }
    });
  }

  // Delete the source category
  await prisma.category.delete({ where: { id: source.id } });

  console.log(`Successfully merged ${articles.length} articles and deleted ${source.name}.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
