import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const WP_API_URL = 'https://www.ledebativoirien.net/wp-json/wp/v2';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les articles qui n'ont pas d'image
    const articlesToFix = await prisma.article.findMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ],
        wpId: { not: null }
      },
      take: 50 // On traite par lot de 50 pour éviter le timeout
    });

    console.log(`🔧 Fixing images for ${articlesToFix.length} articles...`);

    let count = 0;
    for (const article of articlesToFix) {
      if (!article.wpId) continue;

      try {
        const res = await fetch(`${WP_API_URL}/posts/${article.wpId}?_embed`);
        if (!res.ok) continue;
        const post = await res.json();

        let imageUrl = null;
        if (post._embedded && post._embedded['wp:featuredmedia']) {
          imageUrl = post._embedded['wp:featuredmedia'][0]?.source_url || null;
        }

        if (!imageUrl) {
          const content = post.content.rendered;
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        if (imageUrl) {
          await prisma.article.update({
            where: { id: article.id },
            data: { imageUrl }
          });
          count++;
        }
      } catch (e) {
        console.error(`Error fixing article ${article.wpId}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${count} images ont été reconnectées avec succès.` 
    });

  } catch (error: any) {
    console.error('Repair error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
