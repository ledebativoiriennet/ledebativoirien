import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'articles');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const filePath = path.join(UPLOADS_DIR, filename);
    const fileStream = fs.createWriteStream(filePath);
    
    // @ts-ignore - node-fetch / undici body to stream
    await finished(Readable.fromWeb(res.body as any).pipe(fileStream));

    return `/uploads/articles/${filename}`;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🖼️  Démarrage du rapatriement PHYSIQUE des images...');

  const articles = await prisma.article.findMany({
    where: { imageUrl: { startsWith: 'http' } }
  });

  console.log(`🔍 ${articles.length} articles à traiter.`);

  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    if (!article.imageUrl) continue;

    // Nettoyage de l'URL pour l'extension
    const cleanUrl = article.imageUrl.split('?')[0];
    const extension = cleanUrl.split('.').pop() || 'jpg';
    const filename = `${article.slug}.${extension}`;
    
    const localPath = await downloadImage(article.imageUrl, filename);

    if (localPath) {
      await prisma.article.update({
        where: { id: article.id },
        data: { imageUrl: localPath }
      });
      successCount++;
      process.stdout.write(`\r✅ Sauvegardées : ${successCount} | ❌ Indisponibles : ${failCount}`);
    } else {
      failCount++;
    }
  }

  console.log(`\n\n🎉 Opération terminée !`);
  console.log(`📈 Images rapatriées avec succès : ${successCount}`);
  console.log(`📉 Images perdues (WP hors ligne) : ${failCount}`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
