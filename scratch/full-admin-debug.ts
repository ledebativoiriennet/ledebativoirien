import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(startOfMonth.getDate() - 30);

  try {
    console.log('Fetching ALL data...');
    const results = await Promise.all([
      prisma.article.count(),
      prisma.user.count(),
      prisma.subscription.findMany(),
      prisma.adInquiry.count(),
      prisma.articleLike.count(),
      prisma.articleView.findMany({ where: { viewedAt: { gte: sevenDaysAgo } }, select: { viewedAt: true } }),
      prisma.visitor.count(),
      prisma.visitor.count({ where: { visitedAt: { gte: startOfDay } } }),
      prisma.visitor.count({ where: { visitedAt: { gte: sevenDaysAgo } } }),
      prisma.visitor.count({ where: { visitedAt: { gte: startOfMonth } } }),
      prisma.visitor.groupBy({ by: ['country'], _count: { _all: true }, orderBy: { _count: { country: 'desc' } }, take: 10 }),
      prisma.visitor.groupBy({ by: ['browser'], _count: { _all: true }, orderBy: { _count: { browser: 'desc' } }, take: 10 }),
      prisma.visitor.groupBy({ by: ['device'], _count: { _all: true }, orderBy: { _count: { device: 'desc' } }, take: 10 }),
      prisma.visitor.groupBy({ by: ['brand'], _count: { _all: true }, orderBy: { _count: { brand: 'desc' } }, take: 10 }),
      prisma.purchase.findMany({ where: { status: 'COMPLETED' } }),
      prisma.purchase.count({ where: { status: 'PENDING', paymentMethod: 'MANUAL_TRANSFER' } }),
      prisma.visitor.count({ where: { isBot: true } }),
      prisma.visitor.count({ where: { isBot: true, botCategory: 'GOOD' } }),
      prisma.visitor.count({ where: { isBot: true, botCategory: 'BAD' } }),
      prisma.visitor.groupBy({ by: ['botName'], where: { isBot: true }, _count: { _all: true }, orderBy: { _count: { botName: 'desc' } }, take: 5 }),
      prisma.$queryRaw`SELECT strftime('%H', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 24*3600000} AND isBot = 0 GROUP BY label ORDER BY label`,
      prisma.$queryRaw`SELECT strftime('%Y-%m-%d', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 7*86400000} AND isBot = 0 GROUP BY label ORDER BY label`,
      prisma.$queryRaw`SELECT strftime('%Y-%m-%d', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 30*86400000} AND isBot = 0 GROUP BY label ORDER BY label`,
      prisma.$queryRaw`SELECT strftime('%Y-%m', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 365*86400000} AND isBot = 0 GROUP BY label ORDER BY label`,
      prisma.visitor.groupBy({ by: ['source'], _count: { _all: true }, take: 10 })
    ]);
    console.log('Success! Count:', results.length);
  } catch (e) {
    console.error('CRASH:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
