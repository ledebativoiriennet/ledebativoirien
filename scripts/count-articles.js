const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = ['politique', 'politiques', 'economie', 'economie-finances', 'faits-divers', 'faits-divers'];
  for (const slug of categories) {
    const count = await prisma.article.count({
      where: { categories: { some: { slug } } }
    });
    console.log(`Category ${slug}: ${count} articles`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
