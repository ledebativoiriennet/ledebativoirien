const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.advertisement.findMany().then(console.log).finally(() => prisma.$disconnect());
