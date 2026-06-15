import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.googleSearchStat.count();
  console.log(`GoogleSearchStat count: ${count}`);
  
  const sample = await prisma.googleSearchStat.findFirst({
    orderBy: { date: 'desc' }
  });
  console.log('Sample:', sample);
}

check().catch(console.error).finally(() => prisma.$disconnect());
