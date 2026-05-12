const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function seedVisits() {
  console.log('🌱 Début du peuplement des données de visites...');
  
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Supprimer les visites existantes pour repartir à zéro (optionnel, mais propre pour le demo)
  // await prisma.visitor.deleteMany({});

  const visitorsToCreate = [];
  const browsers = ['Chrome', 'Safari', 'Edge', 'Firefox', 'Mobile Safari'];
  const osList = ['Windows', 'MacOS', 'iOS', 'Android', 'Linux'];
  const countries = ['CI', 'FR', 'US', 'BE', 'CA', 'CH', 'SN', 'ML'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date();
    currentDate.setDate(now.getDate() - i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Entre 50 et 250 visiteurs par jour
    const dailyCount = Math.floor(Math.random() * 200) + 50;
    
    console.log(`Génération de ${dailyCount} visites pour le ${dateStr}...`);

    for (let j = 0; j < dailyCount; j++) {
      // Heure aléatoire
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const visitedAt = new Date(currentDate);
      visitedAt.setHours(hour, minute);

      const fakeIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const path = j % 5 === 0 ? '/' : `/article/slug-${Math.floor(Math.random() * 100)}`;
      const ipHash = crypto.createHash('sha256').update(`${fakeIp}-${dateStr}-${path}`).digest('hex');

      const isBot = Math.random() < 0.15; // 15% de bots
      
      visitorsToCreate.push({
        ipHash,
        country: countries[Math.floor(Math.random() * countries.length)],
        city: 'Abidjan',
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        brand: 'Apple',
        isBot: isBot,
        botName: isBot ? (Math.random() > 0.5 ? 'Googlebot' : 'Bingbot') : null,
        botCategory: isBot ? 'GOOD' : null,
        path: path,
        visitedAt: visitedAt
      });

      // Batch insert tous les 500 pour éviter de saturer la mémoire/DB
      if (visitorsToCreate.length >= 500) {
        await prisma.visitor.createMany({ data: visitorsToCreate });
        visitorsToCreate.length = 0;
      }
    }
  }

  // Insert restant
  if (visitorsToCreate.length > 0) {
    await prisma.visitor.createMany({ data: visitorsToCreate });
  }

  console.log('✅ Peuplement terminé !');
}

seedVisits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
