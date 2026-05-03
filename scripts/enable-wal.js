const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Enabling WAL mode for SQLite...');
  try {
    const walResult = await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
    console.log('WAL mode result:', walResult);
    
    const syncResult = await prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL;');
    console.log('Synchronous mode result:', syncResult);
  } catch (error) {
    console.error('Failed to enable WAL mode:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
