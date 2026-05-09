import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from 'fs/promises';
import { UPLOAD_DIR } from '@/lib/upload';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔍 Scanning UPLOAD_DIR:', UPLOAD_DIR);
    const files = await fs.readdir(UPLOAD_DIR);
    console.log(`Found ${files.length} files in storage.`);

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: { startsWith: 'http' } } // On cible aussi ceux qui pointent encore vers WP
        ]
      }
    });

    let count = 0;
    for (const article of articles) {
      // On cherche un fichier qui contient une partie du titre ou du slug de l'article
      const slugBase = article.slug.substring(0, 30);
      const matchingFile = files.find(f => f.toLowerCase().includes(slugBase.toLowerCase()));

      if (matchingFile) {
        await prisma.article.update({
          where: { id: article.id },
          data: { imageUrl: `/api/media/${matchingFile}` }
        });
        count++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${count} articles ont été reconnectés aux images locales du serveur.` 
    });

  } catch (error: any) {
    console.error('Reconnect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
