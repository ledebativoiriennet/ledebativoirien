import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    console.log('Fetching data...');
    const results = await Promise.all([
      prisma.visitor.count(), // simple count
      prisma.visitor.groupBy({ by: ['country'], _count: { _all: true }, take: 10 }),
      prisma.visitor.groupBy({ by: ['source'], _count: { _all: true }, orderBy: { _count: { source: 'desc' } }, take: 10 })
    ]);
    console.log('Success!', results.length);
    
    // Test the SQL queries
    console.log('Testing SQL...');
    const rawDay = await prisma.$queryRaw`SELECT strftime('%H', datetime(visitedAt / 1000, 'unixepoch')) as label, COUNT(*) as count FROM Visitor WHERE visitedAt >= ${now.getTime() - 24*3600000} AND isBot = 0 GROUP BY label ORDER BY label`;
    console.log('SQL Day:', rawDay);

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main()
