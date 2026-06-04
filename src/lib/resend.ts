import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("⚠️ RESEND_API_KEY non configurée dans le fichier .env. L'envoi d'email tournera en mode simulation.");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM = process.env.RESEND_FROM || "Le Débat Ivoirien <redaction@ledebativoirien.net>";

interface SendEmailOptions {
  to?: string | string[];
  bcc?: string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envoie un email via l'API Resend. 
 * Supporte le mode simulation si RESEND_API_KEY est absent.
 * Gère automatiquement le découpage en lots (chunking) pour les listes BCC volumineuses (limite de 100 par appel Resend).
 */
export async function sendEmail(options: SendEmailOptions) {
  const from = options.from || DEFAULT_FROM;
  const { to, bcc, subject, html } = options;

  if (!resend) {
    console.log(`[SIMULATION EMAIL]
De : ${from}
Pour : ${to || 'non spécifié'}
BCC : ${bcc ? `${bcc.length} abonnés` : 'aucun'}
Sujet : ${subject}
`);
    return { data: { id: "simulation-id" }, error: null };
  }

  try {
    // Si nous avons une liste bcc à envoyer en masse
    if (bcc && bcc.length > 0) {
      // Chunk la liste bcc en paquets de 90 pour respecter la limite Resend de 100 destinataires par appel
      const chunkSize = 90;
      const results = [];
      
      for (let i = 0; i < bcc.length; i += chunkSize) {
        const chunk = bcc.slice(i, i + chunkSize);
        
        // Destinataire principal (To) : si 'to' n'est pas fourni, on s'envoie le mail à nous-mêmes
        const toField = to || from;
        
        const response = await resend.emails.send({
          from,
          to: toField,
          bcc: chunk,
          subject,
          html,
        });
        results.push(response);
      }
      
      const error = results.find(r => r.error)?.error || null;
      const data = results.map(r => r.data).filter(Boolean);
      
      return { data, error };
    } else {
      // Envoi standard (ex: demande de devis)
      const toField = to || DEFAULT_FROM;
      const response = await resend.emails.send({
        from,
        to: toField,
        subject,
        html,
      });
      return response;
    }
  } catch (error: any) {
    console.error("Erreur lors de l'envoi d'email via Resend:", error);
    return { data: null, error };
  }
}
