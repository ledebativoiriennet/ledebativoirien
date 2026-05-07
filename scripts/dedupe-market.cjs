const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.marketIndicator.findMany({
    orderBy: { order: 'asc' }
  });
  
  const seen = new Set();
  const toDelete = [];

  for (const ind of all) {
    const key = `${ind.label}-${ind.group}`;
    if (seen.has(key)) {
      toDelete.push(ind.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    await prisma.marketIndicator.deleteMany({
      where: {
        id: { in: toDelete }
      }
    });
    console.log(`${toDelete.length} doublons supprimés.`);
  } else {
    console.log("Aucun doublon trouvé.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
