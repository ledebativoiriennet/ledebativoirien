const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: { name: { contains: 'Afrique' } }
  });
  console.log('Categories containing "Afrique":', categories.map(c => ({ name: c.name, slug: c.slug })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
