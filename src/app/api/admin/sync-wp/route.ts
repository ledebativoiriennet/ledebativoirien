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

    console.log('🚀 Starting Remote WordPress API Sync...');

    // 1. Sync Categories
    const catRes = await fetch(`${WP_API_URL}/categories?per_page=100`);
    if (catRes.ok) {
      const categories = await catRes.json();
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, wpId: cat.id },
          create: { slug: cat.slug, name: cat.name, wpId: cat.id },
        });
      }
    }

    // 2. Fetch latest posts - Réduit à 10 pour éviter les timeouts sur Hostinger
    const postRes = await fetch(`${WP_API_URL}/posts?per_page=10&_embed`);
    if (!postRes.ok) throw new Error(`Erreur API WordPress: ${postRes.status} ${postRes.statusText}`);
    const posts = await postRes.json();

    let count = 0;
    for (const post of posts) {
      const wpId = post.id;
      const title = post.title.rendered;
      const content = post.content.rendered;
      const excerpt = post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 200);
      const slug = post.slug;
      const publishedAt = new Date(post.date);
      
      let imageUrl = null;
      if (post._embedded && post._embedded['wp:featuredmedia']) {
        imageUrl = post._embedded['wp:featuredmedia'][0]?.source_url || null;
      }

      if (!imageUrl) {
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      const wpCategoryIds = post.categories || [];
      const categoriesConnect = [];
      
      for (const catId of wpCategoryIds) {
        const dbCat = await prisma.category.findFirst({ where: { wpId: catId } });
        if (dbCat) categoriesConnect.push({ id: dbCat.id });
      }

      await prisma.article.upsert({
        where: { slug },
        update: {
          title, content, excerpt, publishedAt, imageUrl,
          categories: { set: categoriesConnect }
        },
        create: {
          wpId, title, slug, content, excerpt, publishedAt, imageUrl,
          categories: { connect: categoriesConnect },
          isPremium: false
        }
      });
      count++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `${count} articles synchronisés avec succès.` 
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: `Détail technique: ${error.message || 'Erreur inconnue'}` 
    }, { status: 500 });
  }
}
