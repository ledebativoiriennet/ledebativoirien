"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/resend"

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

    const htmlContent = `
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
    `

    try {
      const { error } = await sendEmail({
        to: ["info@sillon-technologies.com", "marius.gnampa@sillon-technologies.com"],
        subject: `🚨 Demande Annonceur - ${company}`,
        html: htmlContent,
      })
      
      if (error) {
        console.error("Erreur lors de l'envoi de l'email annonceur :", error)
      } else {
        console.log(`Email envoyé via Resend pour la demande de ${company}`)
      }
    } catch (mailError) {
      console.error("Erreur lors de l'envoi d'email annonceur :", mailError)
    }

    return { success: true }
  } catch (error) {
    console.error("Erreur lors de la soumission de la demande annonceur :", error)
    return { error: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer plus tard." }
  }
}
