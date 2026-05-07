const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date().toLocaleDateString('fr-FR');
  const maxOrder = await prisma.marketIndicator.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  const nextOrder = (maxOrder?.order ?? 0) + 1;

  const toSeed = [
    { id: 'brent-crude',  label: 'Pétrole Brent', order: nextOrder },
    { id: 'cotton',       label: 'Coton',          order: nextOrder + 1 },
    { id: 'natural-gas',  label: 'Gaz Naturel',    order: nextOrder + 2 },
  ];

  for (const ind of toSeed) {
    await prisma.marketIndicator.upsert({
      where: { id: ind.id },
      update: { label: ind.label },
      create: {
        id: ind.id,
        label: ind.label,
        value: 'N/A',
        group: 'ENERGIE',
        trend: 'FLAT',
        dateLabel: today,
        order: ind.order,
      }
    });
    console.log('Added: ' + ind.label);
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
