"use server"

import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function submitAdInquiry(formData: FormData) {
  try {
    const company = formData.get("company") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const format = formData.get("format") as string
    const message = formData.get("message") as string

    if (!company || !name || !email) {
      return { error: "Les champs Entreprise, Nom et Email sont obligatoires." }
    }

    await prisma.adInquiry.create({
      data: {
        company,
        name,
        email,
        phone,
        format,
        message,
      }
    })

    // Configuration de l'envoi d'email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from: `"Le Débat Ivoirien" <${process.env.SMTP_USER}>`,
      to: "info@sillon-technologies.com, marius.gnampa@sillon-technologies.com",
      subject: `🚨 Demande Annonceur - ${company}`,
      html: `
        <h2>Nouvelle Demande de Devis Publicitaire</h2>
        <p>Une nouvelle entreprise a soumis une demande depuis l'Espace Annonceurs.</p>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; border-color: #ddd;">
          <tr><td style="background:#f4f4f4"><strong>Entreprise</strong></td><td>${company}</td></tr>
          <tr><td style="background:#f4f4f4"><strong>Contact</strong></td><td>${name}</td></tr>
          <tr><td style="background:#f4f4f4"><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td style="background:#f4f4f4"><strong>Téléphone</strong></td><td>${phone || "Non renseigné"}</td></tr>
          <tr><td style="background:#f4f4f4"><strong>Format Souhaité</strong></td><td>${format || "Non spécifié"}</td></tr>
        </table>
        <h3>Détails de la campagne :</h3>
        <p>${message || "Aucun détail supplémentaire."}</p>
      `,
    }

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions)
        console.log(`Email envoyé pour la demande de ${company}`)
      } else {
        console.log("Email non envoyé : Configuration SMTP manquante dans .env")
      }
    } catch (mailError) {
      console.error("Erreur SMTP :", mailError)
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la soumission de la demande annonceur :", error)
    return { error: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer plus tard." }
  }
}
