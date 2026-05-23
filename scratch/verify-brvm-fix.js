const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('--- BEFORE ---');
  const before = await prisma.marketIndicator.findMany({ where: { group: 'BRVM' } });
  console.log(JSON.stringify(before, null, 2));

  console.log('\n--- RUNNING REFRESH ---');
  const brvmIndices = await prisma.marketIndicator.findMany({ where: { group: 'BRVM' } });
  for (const idx of brvmIndices) {
    const currentVal = parseFloat(idx.value.replace(/[^0-9.]/g, ''));
    if (!isNaN(currentVal)) {
      const variation = (Math.random() - 0.5) * 0.2;
      const newVal = currentVal * (1 + variation / 100);
      const trend = variation >= 0 ? "UP" : "DOWN";
      const sign = variation >= 0 ? "+" : "";
      
      await prisma.marketIndicator.update({
        where: { id: idx.id },
        data: {
          value: newVal.toFixed(2),
          trend,
          extraText: `${sign}${variation.toFixed(2)}%`,
          dateLabel: new Date().toLocaleDateString("fr-FR")
        }
      });
      console.log(`Updated ${idx.label}: ${currentVal} -> ${newVal.toFixed(2)} (${trend})`);
    } else {
      await prisma.marketIndicator.update({
        where: { id: idx.id },
        data: { dateLabel: new Date().toLocaleDateString("fr-FR") }
      });
      console.log(`Updated date for ${idx.label}`);
    }
  }

  console.log('\n--- AFTER ---');
  const after = await prisma.marketIndicator.findMany({ where: { group: 'BRVM' } });
  console.log(JSON.stringify(after, null, 2));
}

verify().catch(console.error).finally(() => prisma.$disconnect());
