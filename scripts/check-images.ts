import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const total = await prisma.article.count({ where: { imageUrl: { not: null } } });
  const apiMedia = await prisma.article.count({ where: { imageUrl: { startsWith: '/api/media/' } } });
  const uploads = await prisma.article.count({ where: { imageUrl: { startsWith: '/uploads/' } } });
  const external = await prisma.article.count({ where: { imageUrl: { startsWith: 'http' } } });
  const other = total - apiMedia - uploads - external;
  const samples = await prisma.article.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true }, take: 8 });
  console.log('--- Analyse des chemins images ---');
  console.log('Total avec image :', total);
  console.log('/api/media/      :', apiMedia);
  console.log('/uploads/        :', uploads);
  console.log('http(s) externe  :', external);
  console.log('autre            :', other);
  console.log('\nExemples :');
  samples.forEach(a => console.log(' -', a.imageUrl));
}
main().catch(console.error).finally(() => prisma.$disconnect());
