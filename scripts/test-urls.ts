import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const articles = await prisma.article.findMany({
    where: { imageUrl: { startsWith: 'http' } },
    take: 5
  });
  
  for (const art of articles) {
    console.log(`Checking: ${art.imageUrl}`);
    try {
      const res = await fetch(art.imageUrl as string, { method: 'HEAD' });
      console.log(`Status: ${res.status} ${res.statusText}`);
    } catch (e: any) {
      console.log(`Error: ${e.message}`);
    }
  }
}

test().finally(() => prisma.$disconnect());
