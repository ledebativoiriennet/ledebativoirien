const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const visitorCount = await prisma.visitor.count();
  const visitors = await prisma.visitor.findMany({ take: 10 });
  const activityLogs = await prisma.activityLog.count();
  const users = await prisma.user.count();
  const articles = await prisma.article.count();

  console.log('Visitor Count:', visitorCount);
  console.log('Visitors:', JSON.stringify(visitors, null, 2));
  console.log('ActivityLog Count:', activityLogs);
  console.log('User Count:', users);
  console.log('Article Count:', articles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
