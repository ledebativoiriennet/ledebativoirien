import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Récupérer les 5 derniers articles
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: { not: null, lte: new Date() }
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });

    if (articles.length === 0) {
      return NextResponse.json({ error: 'Aucun article disponible pour la newsletter.' }, { status: 400 });
    }

    // 2. Génération IA de l'introduction
    let aiIntro = "L'équipe de la rédaction a sélectionné pour vous les actualités les plus marquantes du moment.";
    let usedAi = false;
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const articleTitles = articles.map(a => a.title).join(" | ");
        const { text } = await generateText({
          model: google('gemini-1.5-flash'),
          prompt: `Tu es le rédacteur en chef du site d'actualité ivoirien "Le Débat Ivoirien". Rédige une très courte introduction (2 phrases percutantes) pour une newsletter qui met en avant ces articles : ${articleTitles}. Sois professionnel mais engageant. Ne commence pas par des salutations car c'est géré par le template HTML. Ne mets pas de guillemets autour de ta réponse.`
        });
        aiIntro = text.trim();
        usedAi = true;
      } catch (e) {
        console.error("AI Generation failed, using default intro.", e);
      }
    }

    // 3. Récupérer les abonnés
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      select: { email: true }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'Aucun abonné actif pour recevoir la newsletter.' }, { status: 400 });
    }

    // 4. Assemblage HTML
    const articlesHtml = articles.map(article => `
      <div style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #eeeeee;">
        ${article.imageUrl ? `<img src="https://ledebativoirien.net${article.imageUrl}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="Image">` : ''}
        <h2 style="font-size: 20px; margin: 0 0 10px 0; color: #111111;">
          <a href="https://ledebativoirien.net/article/${article.slug}" style="color: #111111; text-decoration: none;">${article.title}</a>
        </h2>
        <p style="font-size: 15px; color: #555555; line-height: 1.5; margin: 0 0 15px 0;">
          ${article.excerpt || article.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
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
            <div class="date">Édition Spéciale - ${new Date().toLocaleDateString('fr-FR')}</div>
            <h2 style="font-size: 22px; color: #111111; margin-top: 0; line-height: 1.4;">${aiIntro}</h2>
            ${usedAi ? '<div style="font-size: 12px; color: #e60000; font-weight: bold; margin-bottom: 25px;">✨ Rédigé avec l\'IA</div>' : '<br>'}
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

    // 5. Envoi
    const emails = subscribers.map(s => s.email);
    const subjectText = `Édition Spéciale - Les titres à ne pas manquer`;

    const { error } = await sendEmail({
      bcc: emails,
      subject: subjectText,
      html: htmlTemplate,
    });

    if (error) {
      throw error;
    }

    // 6. Log DB
    // @ts-ignore
    await prisma.newsletterLog.create({
      data: {
        campaignType: "EXPRESS_AI",
        subject: subjectText,
        recipientCount: emails.length,
        status: "SUCCESS"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Newsletter envoyée avec succès à ${emails.length} abonnés !`,
      usedAi
    });
  } catch (error: any) {
    console.error('Erreur Génération Newsletter:', error);
    return NextResponse.json({ error: error.message || 'Erreur lors de l\'envoi' }, { status: 500 });
  }
}
