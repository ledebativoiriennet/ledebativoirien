const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.purchase.count();
  const subscriptions = await prisma.subscription.count();
  const newsletters = await prisma.newsletterSubscriber.count();

  console.log('Purchase Count:', purchases);
  console.log('Subscription Count:', subscriptions);
  console.log('Newsletter Count:', newsletters);
}

main().catch(console.error).finally(() => prisma.$disconnect());
