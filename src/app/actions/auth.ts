"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return { error: "Cet email est déjà utilisé." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER"
      }
    });

    return { success: true };
  } catch (e) {
    console.error("Erreur d'inscription:", e);
    return { error: "Erreur serveur lors de la création du compte." };
  }
}

export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Adresse email invalide." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Pour des raisons de sécurité, on ne divulgue pas si l'email existe ou non,
    // mais on renvoie un message de succès générique.
    if (!user) {
      return { success: true };
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 heure d'expiration

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      }
    });

    const { sendEmail } = require("@/lib/resend");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ledebativoirien.net";
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    const resetHtml = `
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
          .title { font-size: 22px; font-weight: 800; color: #111111; margin-top: 0; margin-bottom: 15px; }
          .message { font-size: 16px; color: #475569; line-height: 1.7; text-align: left; margin-bottom: 30px; }
          .btn-container { text-align: center; margin-bottom: 30px; }
          .btn { display: inline-block; background-color: #e60000; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; }
          .warning { font-size: 13px; color: #94a3b8; text-align: left; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.5; }
          .footer { background-color: #f8fafc; padding: 25px 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://ledebativoirien.net/logo.png" alt="Le Débat Ivoirien">
          </div>
          <div class="content">
            <h1 class="title">Demande de réinitialisation</h1>
            <p class="message">
              Bonjour,<br><br>
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte sur <strong>Le Débat Ivoirien</strong>. Cliquez sur le bouton ci-dessous pour en définir un nouveau. Ce lien expire dans 1 heure.
            </p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" style="color: #ffffff;">Réinitialiser mon mot de passe</a>
            </div>
            
            <p class="warning">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe restera inchangé.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.<br>
            Cet e-mail automatique est envoyé par no_reply@ledebativoirien.net.
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      from: "Le Débat Ivoirien <no_reply@ledebativoirien.net>",
      to: email,
      subject: "🔑 Réinitialisation de votre mot de passe - Le Débat Ivoirien",
      html: resetHtml
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur de demande de réinitialisation :", error);
    return { error: "Une erreur est survenue lors de la demande." };
  }
}

export async function resetPassword(token: string, password: string) {
  if (!token) {
    return { error: "Jeton de réinitialisation manquant." };
  }
  if (!password || password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return { error: "Jeton invalide ou expiré." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur de réinitialisation du mot de passe :", error);
    return { error: "Erreur lors de la mise à jour du mot de passe." };
  }
}
