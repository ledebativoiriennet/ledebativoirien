import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 1 data...");

  // Seed Weather
  await prisma.weatherReport.create({
    data: {
      city: "Abidjan",
      temperature: 31,
      condition: "Ensoleillé",
      icon: "☀️"
    }
  });

  // Seed Job Offers
  const jobs = [
    { title: "Directeur Marketing (H/F)", company: "Orange CI", location: "Abidjan", url: "#" },
    { title: "Ingénieur Génie Civil", company: "PFO Africa", location: "San-Pédro", url: "#" },
    { title: "Développeur Fullstack React/Node", company: "Sillon Technologies", location: "Abidjan", url: "#" },
    { title: "Comptable Senior", company: "NSIA Banque", location: "Bouaké", url: "#" },
  ];

  for (const job of jobs) {
    await prisma.jobOffer.create({
      data: job
    });
  }

  console.log("Seeding done.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
