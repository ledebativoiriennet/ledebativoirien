import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

/**
 * Finds the top article for a specific date range based on view count.
 */
async function getTopArticleInRange(start: Date, end: Date) {
  // Aggregate views by articleId within the range
  const topViewed = await prisma.articleView.groupBy({
    by: ['articleId'],
    where: {
      viewedAt: {
        gte: start,
        lt: end,
      }
    },
    _count: {
      articleId: true,
    },
    orderBy: {
      _count: {
        articleId: 'desc',
      },
    },
    take: 1,
  });

  if (topViewed.length === 0) return null;

  return await prisma.article.findUnique({
    where: { id: topViewed[0].articleId },
    include: { categories: true },
  });
}

/**
 * Compiles the weekly digest by getting the top 5 articles of the last 7 days based on views.
 */
export async function getWeeklyDigestData() {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 7);

  // Group by articleId within the last 7 days to get view counts
  const topViewed = await prisma.articleView.groupBy({
    by: ['articleId'],
    where: {
      viewedAt: {
        gte: start,
        lt: now,
      }
    },
    _count: {
      articleId: true,
    },
    orderBy: {
      _count: {
        articleId: 'desc',
      },
    },
    take: 5,
  });

  if (topViewed.length === 0) {
    // Si pas de vues enregistrées, on prend simplement les 5 derniers articles publiés cette semaine
    return await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: start,
          lt: now,
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
  }

  const articleIds = topViewed.map(item => item.articleId);
  const articles = await prisma.article.findMany({
    where: {
      id: { in: articleIds }
    },
    include: { categories: true },
  });

  // Conserver l'ordre décroissant du nombre de vues
  return articleIds
    .map(id => articles.find(article => article.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);
}

/**
 * Sends the weekly digest email to all active subscribers.
 */
export async function sendWeeklyDigest() {
  try {
    const articles = await getWeeklyDigestData();
    if (articles.length === 0) return { message: "Aucun article trouvé pour le digest hebdomadaire." };

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) return { message: "Aucun abonné actif." };

    const emails = subscribers.map(s => s.email);

    const articlesHtml = articles.map((article, index) => `
      <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #eeeeee;">
        <div style="font-size: 11px; font-weight: 800; color: #e60000; text-transform: uppercase; margin-bottom: 5px;">TOP ${index + 1} DE LA SEMAINE</div>
        <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #111111;">
          <a href="https://ledebativoirien.net/article/${article.slug}" style="color: #111111; text-decoration: none;">${article.title}</a>
        </h2>
        ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="Image">` : ''}
        <p style="font-size: 15px; color: #475569; line-height: 1.5; margin: 0 0 15px 0;">
          ${article.excerpt || article.content.substring(0, 150) + '...'}
        </p>
        <a href="https://ledebativoirien.net/article/${article.slug}" style="display: inline-block; background-color: #e60000; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; font-size: 14px;">Lire la suite</a>
      </div>
    `).join('');

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #111111; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -1px;">LeDébat<span style="color: #e60000; font-family: Impact, sans-serif;">IVOIRIEN</span></h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; text-transform: uppercase; font-weight: bold; font-size: 14px; letter-spacing: 0.1em;">L'Hebdo de l'Actualité</p>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #444444; line-height: 1.6; margin-bottom: 30px;">
              Bonjour, voici votre sélection hebdomadaire des articles les plus marquants et les plus lus de la semaine passée sur Le Débat Ivoirien.
            </p>
            ${articlesHtml}
          </div>
          <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.<br>
            Vous recevez cet email car vous êtes inscrit à la newsletter.<br>
            <a href="https://ledebativoirien.net/unsubscribe" style="color: #888888; text-decoration: underline;">Se désabonner</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const subjectText = `🗞️ Votre Digest Hebdomadaire : Le meilleur de la semaine`;

    const { error } = await sendEmail({
      bcc: emails,
      subject: subjectText,
      html: htmlTemplate,
    });

    if (error) {
      throw error;
    }

    // Log successful weekly digest
    // @ts-ignore
    await prisma.newsletterLog.create({
      data: {
        campaignType: "WEEKLY",
        subject: subjectText,
        recipientCount: emails.length,
        status: "SUCCESS"
      }
    });

    return { message: "Digest hebdomadaire envoyé avec succès", count: emails.length };
  } catch (error: any) {
    console.error("Erreur Digest Hebdomadaire:", error);
    
    // Log failed weekly digest
    try {
      const subCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } }).catch(() => 0);
      // @ts-ignore
      await prisma.newsletterLog.create({
        data: {
          campaignType: "WEEKLY",
          subject: `🗞️ Votre Digest Hebdomadaire : Le meilleur de la semaine`,
          recipientCount: subCount,
          status: "FAILED",
          errorMessage: error?.message || String(error)
        }
      });
    } catch (logErr) {
      console.error("Failed to write weekly digest log:", logErr);
    }
    
    throw error;
  }
}

/**
 * Compiles the monthly digest by picking the best article of each of the last 4 weeks.
 */
export async function getMonthlyDigestData() {
  const digestArticles = [];
  const now = new Date();

  // Iterate back 4 weeks
  for (let i = 0; i < 4; i++) {
    const end = new Date(now);
    end.setDate(now.getDate() - (i * 7));
    const start = new Date(now);
    start.setDate(now.getDate() - ((i + 1) * 7));

    const top = await getTopArticleInRange(start, end);
    if (top) {
      digestArticles.push({
        weekLabel: `Semaine ${4 - i}`,
        article: top,
      });
    }
  }

  return digestArticles.reverse(); // OrderSemaine 1 -> Semaine 4
}

/**
 * Sends the monthly digest email to all active subscribers.
 */
export async function sendMonthlyDigest() {
  try {
    const digestData = await getMonthlyDigestData();
    if (digestData.length === 0) return { message: "Aucun article trouvé pour le digest." };

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) return { message: "Aucun abonné." };

    const emails = subscribers.map(s => s.email);

    const articlesHtml = digestData.map(({ weekLabel, article }) => `
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <div style="font-size: 12px; font-weight: 800; color: #e60000; text-transform: uppercase; margin-bottom: 5px;">${weekLabel}</div>
        <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #111111;">
          <a href="https://ledebativoirien.net/article/${article.slug}" style="color: #111111; text-decoration: none;">${article.title}</a>
        </h2>
        ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="Image">` : ''}
        <p style="font-size: 15px; color: #475569; line-height: 1.5; margin: 0 0 15px 0;">
          ${article.excerpt || article.content.substring(0, 150) + '...'}
        </p>
        <a href="https://ledebativoirien.net/article/${article.slug}" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">Lire l'analyse complète</a>
      </div>
    `).join('');

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #111111; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: -1px;">LeDébat<span style="color: #e60000; font-family: Impact, sans-serif;">IVOIRIEN</span></h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; text-transform: uppercase; font-weight: bold; font-size: 14px; letter-spacing: 0.1em;">Le Best-Of du Mois</p>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 16px; color: #444444; line-height: 1.6; margin-bottom: 30px;">
              Bonjour, voici votre compilation mensuelle des articles qui ont marqué l'actualité et suscité le plus de débats cette semaine après semaine.
            </p>
            ${articlesHtml}
            <div style="text-align: center; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #e60000 0%, #8b0000 100%); border-radius: 12px; color: white;">
              <h3 style="margin: 0 0 10px 0; font-size: 20px;">Envie d'aller plus loin ?</h3>
              <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.9;">Accédez à nos archives complètes pour approfondir tous les sujets.</p>
              <a href="https://ledebativoirien.net/archives" style="display: inline-block; background-color: white; color: #8b0000; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 16px;">Consulter les Archives</a>
            </div>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.<br>
            <a href="https://ledebativoirien.net/unsubscribe" style="color: #888888; text-decoration: underline;">Se désabonner</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const subjectText = `🗞️ Votre Digest Mensuel : Le meilleur du Débat Ivoirien`;

    const { error } = await sendEmail({
      bcc: emails,
      subject: subjectText,
      html: htmlTemplate,
    });

    if (error) {
      throw error;
    }

    // Log successful monthly digest
    // @ts-ignore
    await prisma.newsletterLog.create({
      data: {
        campaignType: "MONTHLY",
        subject: subjectText,
        recipientCount: emails.length,
        status: "SUCCESS"
      }
    });

    return { message: "Digest envoyé avec succès", count: emails.length };
  } catch (error: any) {
    console.error("Erreur Digest Mensuel:", error);
    
    // Log failed monthly digest
    try {
      const subCount = await prisma.newsletterSubscriber.count({ where: { isActive: true } }).catch(() => 0);
      // @ts-ignore
      await prisma.newsletterLog.create({
        data: {
          campaignType: "MONTHLY",
          subject: `🗞️ Votre Digest Mensuel : Le meilleur du Débat Ivoirien`,
          recipientCount: subCount,
          status: "FAILED",
          errorMessage: error?.message || String(error)
        }
      });
    } catch (logErr) {
      console.error("Failed to write monthly digest log:", logErr);
    }
    
    throw error;
  }
}
