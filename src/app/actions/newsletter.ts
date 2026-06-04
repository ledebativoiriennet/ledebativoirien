"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  const honeypot = formData.get("website_url") as string;

  if (honeypot) {
    console.warn("Newsletter subscription blocked by honeypot");
    return { success: false, error: "Bot detected" };
  }

  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email }
    });

    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background-color: #111111; padding: 40px 20px; text-align: center; border-bottom: 4px solid #e60000; }
          .header img { max-height: 60px; width: auto; }
          .content { padding: 40px 30px; text-align: center; }
          .welcome-title { font-size: 24px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 15px; }
          .message { font-size: 16px; color: #475569; line-height: 1.7; text-align: left; margin-bottom: 30px; }
          .btn-container { text-align: center; margin-bottom: 40px; }
          .btn { display: inline-block; background-color: #e60000; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; }
          .features { border-top: 1px solid #e2e8f0; padding-top: 30px; text-align: left; }
          .features h3 { font-size: 14px; font-weight: 800; color: #111111; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 0.05em; }
          .feature-item { font-size: 14px; color: #475569; margin-bottom: 10px; }
          .feature-icon { color: #e60000; font-weight: bold; margin-right: 10px; }
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
            <h1 class="welcome-title">Merci pour votre inscription !</h1>
            <p class="message">
              Bonjour,<br><br>
              Nous sommes ravis de vous compter parmi les abonnés de <strong>Le Débat Ivoirien</strong>. Vous recevrez désormais les analyses, opinions et décryptages exclusifs qui font l'actualité en Côte d'Ivoire.
            </p>
            
            <div class="btn-container">
              <a href="https://ledebativoirien.net" class="btn" style="color: #ffffff;">Visiter notre site web</a>
            </div>
            
            <div class="features">
              <h3>Au programme de votre abonnement :</h3>
              <div class="feature-item">
                <span class="feature-icon">✓</span> <strong>L'essentiel du soir</strong> : un récapitulatif quotidien à 20h00 des actualités clés.
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span> <strong>L'Hebdo</strong> : la sélection des 5 sujets les plus débattus de la semaine.
              </div>
              <div class="feature-item">
                <span class="feature-icon">✓</span> <strong>Le Digest Mensuel</strong> : une analyse approfondie des thèmes majeurs du mois.
              </div>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.<br>
            Vous recevez cet email suite à votre inscription sur notre site.<br>
            <a href="https://ledebativoirien.net/unsubscribe">Se désabonner</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: "🎉 Bienvenue sur Le Débat Ivoirien !",
      html: welcomeHtml
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur d'inscription à la newsletter :", error);
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

export async function subscribeToAuthor(email: string, authorId: string) {
  if (!email || !email.includes("@")) return { success: false, error: "Email invalide" };
  if (!authorId) return { success: false, error: "Auteur introuvable" };

  try {
    // Vérifier si l'auteur existe
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return { success: false, error: "Auteur introuvable" };

    // Créer ou ignorer si déjà abonné
    await prisma.authorSubscriber.upsert({
      where: {
        email_authorId: { email, authorId }
      },
      update: {},
      create: { email, authorId }
    });
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'abonnement à l'auteur" };
  }
}
