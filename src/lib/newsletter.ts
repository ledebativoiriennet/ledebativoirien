import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export async function sendNewArticleNotification(articleId: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!article) return;

    // Récupérer les abonnés
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) return;

    const emails = subscribers.map(s => s.email);

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background-color: #111111; padding: 40px 20px; text-align: center; border-bottom: 4px solid #e60000; }
          .header img { max-height: 60px; width: auto; }
          .content { padding: 40px 30px; }
          .category { font-size: 12px; font-weight: 800; color: #e60000; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em; }
          .title { font-size: 22px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 20px; line-height: 1.3; }
          .title a { color: #111111; text-decoration: none; }
          .article-image { width: 100%; height: auto; border-radius: 8px; margin-bottom: 25px; }
          .excerpt { font-size: 16px; color: #475569; line-height: 1.7; margin-bottom: 30px; }
          .btn-container { text-align: center; margin-bottom: 20px; }
          .btn { display: inline-block; background-color: #e60000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px; }
          .footer { background-color: #f8fafc; padding: 25px 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          .footer a { color: #64748b; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://ledebativoirien.net/logo.png" alt="Le Débat Ivoirien">
          </div>
          <div class="content">
            <div class="category">Flash Info - Nouvel Article</div>
            <h1 class="title">
              <a href="https://ledebativoirien.net/article/${article.slug}">${article.title}</a>
            </h1>
            
            ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" class="article-image" alt="${article.title}">` : ''}
            
            <p class="excerpt">
              ${article.excerpt || article.content.substring(0, 200) + '...'}
            </p>
            
            <div class="btn-container">
              <a href="https://ledebativoirien.net/article/${article.slug}" class="btn" style="color: #ffffff;">Lire l'article complet</a>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.<br>
            Vous recevez cet email car vous êtes inscrit aux alertes de Le Débat Ivoirien.<br>
            <a href="https://ledebativoirien.net/unsubscribe">Se désabonner</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const { error } = await sendEmail({
      bcc: emails,
      subject: `🚨 Nouveau : ${article.title}`,
      html: htmlTemplate,
    });

    if (error) {
      throw error;
    }
    
    console.log(`Notification envoyée à ${emails.length} abonnés pour l'article ${articleId}`);

  } catch (error) {
    console.error("Erreur d'envoi de notification newsletter:", error);
  }
}
