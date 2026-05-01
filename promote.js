const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "ekissiachille@gmail.com";
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`User ${email} is now ${user.role}`);
  } catch (e) {
    console.error("User not found or error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
