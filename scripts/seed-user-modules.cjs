const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding specific modules for user review...');

  // 1. Football Matches
  await prisma.footballMatch.deleteMany();
  await prisma.footballMatch.createMany({
    data: [
      {
        team1: "Côte d'Ivoire",
        team2: "Nigéria",
        team1Flag: "CI",
        team2Flag: "NG",
        matchDate: new Date(Date.now() + 86400000), // Demain
        phase: "Éliminatoires Mondial 2026",
        status: "UPCOMING",
        score: "VS"
      },
      {
        team1: "Sénégal",
        team2: "Cameroun",
        team1Flag: "SN",
        team2Flag: "CM",
        matchDate: new Date(),
        phase: "Amical International",
        status: "LIVE",
        score: "1 - 0"
      },
      {
        team1: "Maroc",
        team2: "Égypte",
        team1Flag: "MA",
        team2Flag: "EG",
        matchDate: new Date(Date.now() + 172800000), // Dans 2 jours
        phase: "Coupe d'Afrique",
        status: "UPCOMING",
        score: "VS"
      }
    ]
  });

  // 2. Ensure Categories have articles for Dossiers and Art & Culture
  // We'll just check if they exist, if not we'll link some existing articles to them.
  const categories = ['dossiers', 'art-culture', 'activite-gouvernementale'];
  for (const slug of categories) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat) {
      // Link some recent articles to this category if it has none
      const articleCount = await prisma.article.count({ where: { categories: { some: { slug } } } });
      if (articleCount === 0) {
        const recent = await prisma.article.findMany({ take: 5, orderBy: { publishedAt: 'desc' } });
        for (const art of recent) {
          await prisma.article.update({
            where: { id: art.id },
            data: { categories: { connect: { id: cat.id } } }
          });
        }
        console.log(`Linked 5 articles to category: ${slug}`);
      }
    } else {
      console.log(`Category ${slug} missing, creating it...`);
      await prisma.category.create({ data: { name: slug.replace('-', ' '), slug } });
    }
  }

  console.log('Specific modules seeding complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
