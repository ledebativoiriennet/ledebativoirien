import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.obituary.deleteMany();
  await prisma.pressRelease.deleteMany();
  await prisma.video.deleteMany();

  // Add 1 Poll
  await prisma.poll.create({
    data: {
      question: "Que pensez-vous des récentes réformes économiques ?",
      options: {
        create: [
          { text: "Très favorables", votes: 120 },
          { text: "Plutôt favorables", votes: 85 },
          { text: "Défavorables", votes: 340 },
          { text: "Sans opinion", votes: 12 }
        ]
      }
    }
  });

  // Add Obituaries
  await prisma.obituary.createMany({
    data: [
      { name: "Mme KOUASSI N'Guessan Amoin", details: "Rappelée à Dieu le 12 Mai à Abidjan." },
      { name: "El Hadj DIABATE Seydou", details: "Les condoléances sont reçues tous les jours au domicile." },
      { name: "Veuve TOURE Fatoumata", details: "Levée du corps le vendredi à IVOSEP." },
      { name: "Dr BEUGRÉ Jean-Paul", details: "Inhumation prévue ce samedi au cimetière de Williamsville." }
    ]
  });

  // Add Press Releases
  await prisma.pressRelease.createMany({
    data: [
      { title: "Lancement du nouveau réseau 5G à Abidjan", company: "Orange CI" },
      { title: "Communiqué relatif au concours direct 2026", company: "Ministère de la Fonction Publique" },
      { title: "Inauguration de la nouvelle succursale régionale", company: "Ecobank CI" },
      { title: "Rapport d'activités trimestriel - Q1 2026", company: "SODEFOR" }
    ]
  });

  // Add Videos
  await prisma.video.createMany({
    data: [
      { title: "Le journal télévisé de 20h - Édition Spéciale", youtubeId: "dQw4w9WgXcQ" },
      { title: "Grand Débat: La Côte d'Ivoire face aux défis climatiques", youtubeId: "dQw4w9WgXcQ" },
      { title: "Micro-Trottoir: Les abidjanais et la cherté de la vie", youtubeId: "dQw4w9WgXcQ" },
      { title: "Résumé: Les Éléphants remportent le match décisif", youtubeId: "dQw4w9WgXcQ" }
    ]
  });

  console.log("Modules seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
