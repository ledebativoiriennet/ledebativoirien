import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const today = new Date().toLocaleDateString('fr-FR');
  const maxOrder = await prisma.marketIndicator.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
  const nextOrder = (maxOrder?.order ?? 0) + 1;

  const indicators = [
    { id: 'brent-crude',  label: 'Pétrole Brent', order: nextOrder },
    { id: 'cotton',       label: 'Coton',          order: nextOrder + 1 },
    { id: 'natural-gas',  label: 'Gaz Naturel',    order: nextOrder + 2 },
  ];

  for (const ind of indicators) {
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
    console.log(`✓ ${ind.label} ajouté`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
