const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding economic data...');

  // 1. Ensure BRVM indicators exist
  const brvmGroup = [
    { label: 'BRVM Composite', value: '214.56', trend: 'UP', extraText: '+0.45%', order: 10 },
    { label: 'BRVM 30', value: '107.82', trend: 'DOWN', extraText: '-0.12%', order: 11 },
    { label: 'BRVM Prestige', value: '102.45', trend: 'UP', extraText: '+0.08%', order: 12 },
  ];

  for (const item of brvmGroup) {
    const indicator = await prisma.marketIndicator.upsert({
      where: { id: `brvm-${item.label.toLowerCase().replace(/ /g, '-')}` },
      update: { ...item, group: 'BRVM', dateLabel: new Date().toLocaleDateString('fr-FR') },
      create: { id: `brvm-${item.label.toLowerCase().replace(/ /g, '-')}`, ...item, group: 'BRVM', dateLabel: new Date().toLocaleDateString('fr-FR') }
    });

    // Add some history
    await prisma.marketHistory.createMany({
      data: [
        { indicatorId: indicator.id, value: parseFloat(item.value) - 2, date: new Date(Date.now() - 86400000 * 3) },
        { indicatorId: indicator.id, value: parseFloat(item.value) - 1, date: new Date(Date.now() - 86400000 * 2) },
        { indicatorId: indicator.id, value: parseFloat(item.value) - 0.5, date: new Date(Date.now() - 86400000 * 1) },
        { indicatorId: indicator.id, value: parseFloat(item.value), date: new Date() },
      ]
    }).catch(() => {}); // Ignore if already exists for the day
  }

  // 2. Macro Indicators
  const macroData = [
    { country: 'Côte d\'Ivoire', category: 'PIB', value: '7.2', unit: '%', year: 2026, trend: 'UP' },
    { country: 'Sénégal', category: 'PIB', value: '8.1', unit: '%', year: 2026, trend: 'UP' },
    { country: 'UEMOA', category: 'Inflation', value: '3.4', unit: '%', year: 2026, trend: 'DOWN' },
    { country: 'BCEAO', category: 'Taux Directeur', value: '3.50', unit: '%', year: 2026, trend: 'FLAT' },
  ];

  for (const item of macroData) {
    await prisma.economicalIndicator.upsert({
      where: { id: `macro-${item.country}-${item.category}`.toLowerCase().replace(/ /g, '-') },
      update: item,
      create: { id: `macro-${item.country}-${item.category}`.toLowerCase().replace(/ /g, '-'), ...item }
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
