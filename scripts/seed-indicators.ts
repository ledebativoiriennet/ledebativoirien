import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.marketIndicator.deleteMany();

  const indicators = [
    // Bloc Cacao
    { group: 'CACAO', label: 'CACAO', value: '1500 FCFA', trend: 'UP', extraText: '/Kg', dateLabel: '30 AVRIL 2026', order: 1 },
    
    // Bloc Anacarde
    { group: 'ANACARDE', label: 'ANACARDE', value: '275 FCFA', trend: 'DOWN', extraText: '/Kg', dateLabel: '30 AVRIL 2026', order: 2 },

    // Bloc Métaux 1 (Or, Zinc)
    { group: 'METAUX1', label: 'Or', value: '2 340 $', trend: 'UP', extraText: '/once', dateLabel: '30 AVRIL 2026', order: 3 },
    { group: 'METAUX1', label: 'Zinc', value: '2 900 $', trend: 'UP', extraText: '/tonne', dateLabel: '30 AVRIL 2026', order: 4 },

    // Bloc Métaux 2 (Aluminium)
    { group: 'METAUX2', label: 'Aluminium', value: '2 550 $', trend: 'DOWN', extraText: '/tonne', dateLabel: '30 AVRIL 2026', order: 5 },

    // Bloc Monnaies
    { group: 'MONNAIES', label: 'Euro €', value: '655.95 FCFA', trend: 'FLAT', extraText: null, dateLabel: '30 AVRIL 2026', order: 6 },
    { group: 'MONNAIES', label: 'Dollar $', value: '605.12 FCFA', trend: 'UP', extraText: null, dateLabel: '30 AVRIL 2026', order: 7 },
    
    // Bloc BRVM
    { group: 'BRVM', label: 'BRVM Composite', value: '214.56', trend: 'UP', extraText: '+0.45%', dateLabel: '30 AVRIL 2026', order: 8 },
    { group: 'BRVM', label: 'BRVM 30', value: '107.82', trend: 'DOWN', extraText: '-0.12%', dateLabel: '30 AVRIL 2026', order: 9 },
  ];

  for (const data of indicators) {
    await prisma.marketIndicator.create({ data });
  }

  console.log("Market indicators seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
