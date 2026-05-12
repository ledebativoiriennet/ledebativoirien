const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const visitorCount = await prisma.visitor.count();
  const articleViewCount = await prisma.articleView.count();
  const firstVisitor = await prisma.visitor.findFirst({ orderBy: { visitedAt: 'asc' } });
  const firstArticleView = await prisma.articleView.findFirst({ orderBy: { viewedAt: 'asc' } });

  console.log('Visitor Count:', visitorCount);
  console.log('ArticleView Count:', articleViewCount);
  console.log('First Visitor:', firstVisitor?.visitedAt);
  console.log('First ArticleView:', firstArticleView?.viewedAt);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
