import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

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

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP non configuré. Simulation d'envoi pour le nouvel article :", article.title);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #111111; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px; }
          .header h1 span { color: #e60000; font-family: Impact, sans-serif; }
          .content { padding: 30px 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LeDébat<span>IVOIRIEN</span></h1>
          </div>
          <div class="content">
            <h2 style="font-size: 16px; color: #e60000; text-transform: uppercase; margin-bottom: 5px;">Nouvel Article Publié</h2>
            <h1 style="font-size: 24px; color: #111111; margin-top: 0; margin-bottom: 20px;">
              <a href="https://ledebativoirien.net/article/${article.slug}" style="color: #111111; text-decoration: none;">${article.title}</a>
            </h1>
            
            ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" alt="Image">` : ''}
            
            <p style="font-size: 16px; color: #444444; line-height: 1.6; margin-bottom: 30px;">
              ${article.excerpt || article.content.substring(0, 200) + '...'}
            </p>
            
            <div style="text-align: center;">
              <a href="https://ledebativoirien.net/article/${article.slug}" style="display: inline-block; background-color: #e60000; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 16px;">
                Lire l'article complet
              </a>
            </div>
          </div>
          <div class="footer">
            Vous recevez cet email car vous êtes inscrit aux alertes de Le Débat Ivoirien.<br>
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Le Débat Ivoirien" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      bcc: emails,
      subject: `🚨 Nouveau : ${article.title}`,
      html: htmlTemplate,
    });
    
    console.log(`Notification envoyée à ${emails.length} abonnés pour l'article ${articleId}`);

  } catch (error) {
    console.error("Erreur d'envoi de notification newsletter:", error);
  }
}
