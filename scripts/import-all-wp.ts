import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WP_API_URL = 'https://www.ledebativoirien.net/wp-json/wp/v2';

async function main() {
  console.log('🚀 Démarrage de l\'importation TOTALE des articles et images...');

  let page = 1;
  let totalSynced = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`\n📦 Récupération de la page ${page}...`);
    try {
      const res = await fetch(`${WP_API_URL}/posts?per_page=50&page=${page}&_embed`);
      
      if (!res.ok) {
        if (res.status === 400) {
          console.log('🏁 Fin de l\'importation (toutes les pages ont été traitées).');
        } else {
          console.error(`❌ Erreur API WP (Status ${res.status})`);
        }
        hasMore = false;
        break;
      }

      const posts = await res.json();
      if (posts.length === 0) {
        hasMore = false;
        break;
      }

      for (const post of posts) {
        const wpId = post.id;
        const slug = post.slug;
        const title = post.title.rendered;
        const content = post.content.rendered;
        const excerpt = post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 200);
        const publishedAt = new Date(post.date);

        // Détection d'image avancée
        let imageUrl = null;
        if (post._embedded && post._embedded['wp:featuredmedia']) {
          imageUrl = post._embedded['wp:featuredmedia'][0]?.source_url || null;
        }

        if (!imageUrl && post.featured_media) {
          try {
            const mediaRes = await fetch(`${WP_API_URL}/media/${post.featured_media}`);
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json() as any;
              imageUrl = mediaData.source_url || null;
            }
          } catch (e) {}
        }

        if (!imageUrl) {
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        // Upsert dans la base de données
        await prisma.article.upsert({
          where: { slug },
          update: { title, content, excerpt, publishedAt, imageUrl },
          create: { wpId, title, slug, content, excerpt, publishedAt, imageUrl, isPremium: false }
        });

        totalSynced++;
        process.stdout.write(`\r✅ Articles synchronisés : ${totalSynced} (Dernier : ${slug})`);
      }

      page++;
      // Petite pause pour ne pas surcharger les serveurs
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error(`\n❌ Erreur critique sur la page ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n\n🎉 Mission terminée ! ${totalSynced} articles et leurs images ont été connectés.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
