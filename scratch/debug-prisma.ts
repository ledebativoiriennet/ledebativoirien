import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const visitor = await prisma.visitor.findFirst()
    console.log('First visitor:', visitor)
    const sourceStats = await prisma.visitor.groupBy({ 
      by: ['source'], 
      _count: { ipHash: true }
    })
    console.log('Source stats:', sourceStats)
    if (sourceStats.length > 0) {
      console.log('Type of _all:', typeof sourceStats[0]._count._all)
    }
  } catch (e) {
    console.error('Error querying visitor:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
