import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  // Optionnel : vérifier un header ou token pour la sécurité du CRON
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Récupérer les articles du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: today,
        }
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    if (articles.length === 0) {
      return NextResponse.json({ message: 'Aucun article publié aujourd\'hui. Newsletter non envoyée.' });
    }

    // 2. Récupérer les abonnés actifs
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'Aucun abonné actif.' });
    }

    // 3. Préparer le template HTML
    const articlesHtml = articles.map(article => `
      <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #eeeeee;">
        ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="Image">` : ''}
        <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #111111;">
          <a href="https://ledebativoirien.net/article/${article.slug}" style="color: #111111; text-decoration: none;">${article.title}</a>
        </h2>
        <p style="font-size: 15px; color: #555555; line-height: 1.5; margin: 0 0 15px 0;">
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
        <style>
          body { font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #111111; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px; }
          .header h1 span { color: #e60000; font-family: Impact, sans-serif; }
          .content { padding: 30px 20px; }
          .date { color: #888888; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LeDébat<span>IVOIRIEN</span></h1>
          </div>
          <div class="content">
            <div class="date">L'essentiel du ${new Date().toLocaleDateString('fr-FR')}</div>
            <h2 style="font-size: 24px; color: #111111; margin-top: 0;">Bonsoir, voici les actualités de la journée :</h2>
            ${articlesHtml}
          </div>
          <div class="footer">
            Vous recevez cet email car vous êtes inscrit à la newsletter de Le Débat Ivoirien.<br>
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Configurer le transporteur d'emails
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ Configuration SMTP manquante, simulation de l'envoi.");
      return NextResponse.json({ message: 'Succès (Mode simulation : SMTP non configuré)', count: subscribers.length });
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

    // Envoyer via BCC pour ne pas exposer les emails
    const emails = subscribers.map(s => s.email);

    await transporter.sendMail({
      from: `"Le Débat Ivoirien" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      bcc: emails,
      subject: `L'essentiel de l'actualité - ${new Date().toLocaleDateString('fr-FR')}`,
      html: htmlTemplate,
    });

    return NextResponse.json({ message: 'Newsletter envoyée avec succès !', count: emails.length });
  } catch (error) {
    console.error('Erreur CRON Newsletter:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la newsletter' }, { status: 500 });
  }
}
