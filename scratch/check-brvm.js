const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const brvm = await prisma.marketIndicator.findMany({
    where: { group: 'BRVM' }
  });
  console.log('BRVM Data:', JSON.stringify(brvm, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
