const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Renommer Or (Once) en Or
  await prisma.marketIndicator.updateMany({
    where: { label: 'Or (Once)' },
    data: { label: 'Or' }
  });

  // 2. Ajouter Zinc dans METAUX1
  const maxOrder = await prisma.marketIndicator.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true }
  });

  await prisma.marketIndicator.upsert({
    where: { id: 'zinc-market' },
    update: { label: 'Zinc', group: 'METAUX1' },
    create: {
      id: 'zinc-market',
      label: 'Zinc',
      group: 'METAUX1',
      value: 'N/A',
      trend: 'FLAT',
      dateLabel: new Date().toLocaleDateString('fr-FR'),
      order: (maxOrder?.order || 0) + 1
    }
  });

  console.log('Base de données mise à jour : Or renommé et Zinc ajouté.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
