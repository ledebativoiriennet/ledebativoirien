const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const indicators = await prisma.marketIndicator.findMany();
  console.log('Indicators Groups:', [...new Set(indicators.map(i => i.group))]);
  console.log('BRVM Indicators:', indicators.filter(i => i.group === 'BRVM').map(i => i.label));
}

main().catch(console.error).finally(() => prisma.$disconnect());
