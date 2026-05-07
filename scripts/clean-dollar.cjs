const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const indicators = await prisma.marketIndicator.findMany();
  const rate = 610; // Taux approximatif pour le nettoyage immédiat

  for (const ind of indicators) {
    if (ind.value.includes('$') || ind.value.includes('¢')) {
      let numeric = parseFloat(ind.value.replace(/[^0-9.]/g, ''));
      if (isNaN(numeric)) continue;

      let cfa;
      if (ind.value.includes('¢')) {
         cfa = (numeric / 100) * rate;
      } else {
         cfa = numeric * rate;
      }

      const newValue = `${Math.round(cfa).toLocaleString('fr-FR')} FCFA`;
      
      await prisma.marketIndicator.update({
        where: { id: ind.id },
        data: { value: newValue }
      });
      console.log(`Updated ${ind.label}: ${ind.value} -> ${newValue}`);
    }
  }
  
  // Supprimer les doublons (garder ceux avec les IDs lisibles si possible)
  const allZinc = await prisma.marketIndicator.findMany({ where: { label: 'Zinc' } });
  if (allZinc.length > 1) {
    // Supprimer le plus vieux (ID aléatoire)
    const oldZinc = allZinc.find(z => z.id.startsWith('cmon'));
    if (oldZinc) {
      await prisma.marketIndicator.delete({ where: { id: oldZinc.id } });
      console.log('Deleted old Zinc duplicate');
    }
  }

  const allGold = await prisma.marketIndicator.findMany({ where: { label: 'Or' } });
  if (allGold.length > 1) {
    const oldGold = allGold.find(g => g.id.startsWith('cmon'));
    if (oldGold) {
      await prisma.marketIndicator.delete({ where: { id: oldGold.id } });
      console.log('Deleted old Gold duplicate');
    }
  }

  // Normaliser les labels pour le cron
  await prisma.marketIndicator.updateMany({ where: { label: 'CACAO' }, data: { label: 'Cacao' } });
  await prisma.marketIndicator.updateMany({ where: { label: 'ANACARDE' }, data: { label: 'Anacarde' } });
  
  console.log('Nettoyage terminé.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
