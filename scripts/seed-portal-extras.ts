import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // --- ACTIVITÉS ---
  await prisma.activity.deleteMany();
  
  const activities = [
    {
      title: "Forum de l'Investissement en Côte d'Ivoire (ICI 2026)",
      date: "Du 12 au 15 Mai 2026",
      location: "Sofitel Abidjan Hôtel Ivoire",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=200&auto=format&fit=crop",
      link: "#"
    },
    {
      title: "Salon de l'Agriculture et des Ressources Animales (SARA)",
      date: "20 Novembre - 01 Décembre 2026",
      location: "Parc des Expositions d'Abidjan",
      imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a5023?q=80&w=200&auto=format&fit=crop",
      link: "#"
    },
    {
      title: "Dîner Gala de la Fondation Children of Africa",
      date: "Vendredi 05 Juin 2026",
      location: "Palais des Congrès",
      imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=200&auto=format&fit=crop",
      link: "#"
    }
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  // --- DÉPÊCHES ---
  await prisma.flashNews.deleteMany();

  const flashes = [
    { time: "15:05", content: "L'assemblée nationale vote le nouveau budget de l'éducation en hausse de 15%.", source: "AIP" },
    { time: "14:30", content: "Trafic dense signalé sur le 3ème pont Henri Konan Bédié suite à un accrochage.", source: "Rédaction" },
    { time: "12:15", content: "Léger repli du cacao à la bourse de Londres, les exportateurs ivoiriens confiants.", source: "Reuters" },
    { time: "11:00", content: "Le ministre des sports annonce la rénovation de 3 nouveaux stades.", source: "AIP" },
    { time: "09:45", content: "Ouverture des inscriptions pour le concours d'entrée à l'ENA 2026.", source: "Gouv" },
    { time: "08:30", content: "Météo : Fortes précipitations attendues dans le District d'Abidjan ce week-end.", source: "SODEXAM" }
  ];

  for (const flash of flashes) {
    await prisma.flashNews.create({ data: flash });
  }

  // Ensure "Culture" category exists for "Tendances culturelles"
  const cultureCat = await prisma.category.findUnique({ where: { slug: "culture" } });
  if (!cultureCat) {
    await prisma.category.create({
      data: { name: "Culture & Arts", slug: "culture" }
    });
  }

  console.log("Portal extras seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
