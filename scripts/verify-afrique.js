const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      categories: {
        some: {
          slug: { in: ['afrique-occidentale', 'cedeau', 'afrique', 'benin', 'togo', 'mali', 'burkina-faso', 'senegal', 'guinee'] }
        }
      }
    },
    include: { categories: true }
  });

  console.log('Number of Afrique de l\'Ouest related articles found:', articles.length);
  articles.forEach(a => {
    console.log(`- ${a.title} (Slug: ${a.slug}, Categories: ${a.categories.map(c => c.slug).join(', ')})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
