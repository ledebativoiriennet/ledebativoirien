import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const newspapers = await prisma.digitalNewspaper.findMany();
  console.log(JSON.stringify(newspapers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
