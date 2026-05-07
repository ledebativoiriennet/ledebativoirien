const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.article.count({
    where: { categories: { some: { slug: 'afrique-occidentale' } } }
  });
  console.log('Afrique de l\'Ouest (afrique-occidentale) count:', count);
  
  const sample = await prisma.article.findMany({
    where: { categories: { some: { slug: 'afrique-occidentale' } } },
    take: 5,
    select: { title: true }
  });
  console.log('Sample articles:', sample);
}

main().catch(console.error).finally(() => prisma.$disconnect());
