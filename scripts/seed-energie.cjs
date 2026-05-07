const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date().toLocaleDateString('fr-FR');
  const maxOrder = await prisma.marketIndicator.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  const nextOrder = (maxOrder?.order ?? 0) + 1;

  const toSeed = [
    { id: 'cotton',       label: 'Coton',          group: 'ANACARDE', order: nextOrder },
    { id: 'brent-crude',  label: 'Pétrole Brent',  group: 'ENERGIE',  order: nextOrder + 1 },
    { id: 'natural-gas',  label: 'Gaz Naturel',    group: 'ENERGIE',  order: nextOrder + 2 },
    { id: 'zinc-market',  label: 'Zinc',           group: 'METAUX1',  order: nextOrder + 3 },
    { id: 'gold-market',  label: 'Or',             group: 'METAUX1',  order: nextOrder + 4 },
  ];

  for (const ind of toSeed) {
    await prisma.marketIndicator.upsert({
      where: { id: ind.id },
      update: { label: ind.label, group: ind.group },
      create: {
        id: ind.id,
        label: ind.label,
        value: 'N/A',
        group: ind.group,
        trend: 'FLAT',
        dateLabel: today,
        order: ind.order,
      }
    });
    console.log('Added: ' + ind.label + ' [' + ind.group + ']');
  }
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
