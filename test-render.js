const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRender() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    orderBy: { publishedAt: 'desc' }
  });

  for (const paper of newspapers) {
    try {
      const d = new Date(paper.publishedAt);
      d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch (err) {
      console.error('Error on paper ID:', paper.id, err);
    }
  }
  console.log('Tested', newspapers.length, 'newspapers.');
}

testRender();
