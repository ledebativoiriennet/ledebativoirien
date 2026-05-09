import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WP_API_URL = 'https://www.ledebativoirien.net/wp-json/wp/v2';

async function syncCategories() {
  console.log('🔄 Syncing categories...');
  try {
    const res = await fetch(`${WP_API_URL}/categories?per_page=100`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const categories = await res.json();
    
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, wpId: cat.id },
        create: { slug: cat.slug, name: cat.name, wpId: cat.id },
      });
    }
    console.log(`✅ ${categories.length} categories synced.`);
  } catch (error: any) {
    console.error('❌ Error syncing categories:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting WordPress API Sync...');

  await syncCategories();

  console.log('📬 Fetching latest posts...');
  try {
    const res = await fetch(`${WP_API_URL}/posts?per_page=20&_embed`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const posts = await res.json();

    console.log(`Found ${posts.length} posts. Processing...`);

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

      try {
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
        process.stdout.write(`\rSynced: ${count}/${posts.length} - ${slug}`);
      } catch (e: any) {
        console.error(`\n❌ Error with ${slug}:`, e.message);
      }
    }

    console.log(`\n\n✅ Sync completed! ${count} articles updated/created.`);
  } catch (error: any) {
    console.error('❌ Global sync error:', error.message);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
