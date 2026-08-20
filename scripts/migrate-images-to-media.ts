/**
 * Migration : Basculer les anciennes URLs d'images vers l'API media permanente
 *
 * À exécuter avec :
 *   npx tsx scripts/migrate-images-to-media.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Démarrage de la migration des URLs d\'images...');

  // 1. Trouver tous les articles qui utilisent le dossier temporaire public/uploads/articles/
  const articlesToUpdate = await prisma.article.findMany({
    where: {
      imageUrl: {
        startsWith: '/uploads/articles/'
      }
    }
  });

  console.log(`🔍 ${articlesToUpdate.length} articles trouvés avec des images temporaires.`);

  let successCount = 0;

  for (const article of articlesToUpdate) {
    if (!article.imageUrl) continue;

    // Remplacer "/uploads/articles/" par "/api/media/"
    const newImageUrl = article.imageUrl.replace('/uploads/articles/', '/api/media/');

    await prisma.article.update({
      where: { id: article.id },
      data: { imageUrl: newImageUrl }
    });

    successCount++;
  }

  console.log(`\n✅ ${successCount} articles ont été mis à jour pour utiliser /api/media/ !`);
  
  console.log(`
=====================================================
⚠️ ACTION MANUELLE REQUISE SUR LE SERVEUR :
=====================================================
La base de données est à jour, mais les fichiers physiques
doivent être copiés dans le bon dossier permanent.

1. Connectez-vous à votre serveur Hostinger.
2. Trouvez l'ancien dossier où étaient les images :
   .../public/uploads/articles/
3. Déplacez TOUT le contenu de ce dossier vers votre dossier 
   partagé (qui survit aux déploiements) :
   .../shared_uploads/

Une fois les fichiers déplacés, toutes les illustrations
s'afficheront correctement sur le site !
=====================================================
  `);
}

main()
  .catch((err) => {
    console.error('Erreur:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
