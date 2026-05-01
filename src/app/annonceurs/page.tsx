"use client"

import { useState } from "react"
import { submitAdInquiry } from "@/app/actions/ad-inquiry"

export default function AnnonceursPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    setStatus("loading")
    const res = await submitAdInquiry(formData)
    if (res.error) {
      setStatus("error")
      setMessage(res.error)
    } else {
      setStatus("success")
      setMessage("Votre demande a été envoyée avec succès. Notre équipe commerciale vous contactera très prochainement.")
    }
  }

  return (
    <div className="container" style={{ marginTop: '3rem', marginBottom: '4rem' }}>
      
      {/* HERO SECTION */}
      <div style={{ backgroundColor: 'var(--foreground)', color: 'white', padding: '4rem 2rem', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: '3rem', backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://picsum.photos/seed/office/1200/400")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--primary)' }}>Espace Annonceurs</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', color: '#cbd5e1' }}>
          Associez l'image de votre entreprise au 1er portail d'investigation et d'information en continu de Côte d'Ivoire.
        </p>
      </div>

      {/* MEDIA KIT / STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>2.5M</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Visites Mensuelles</div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>850K</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Visiteurs Uniques</div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>65%</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Audience CSP+</div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>120K</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Abonnés Newsletter</div>
        </div>
      </div>

      {/* LAYOUT : Formats + Contact Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
        
        {/* FORMATS */}
        <div>
          <h2 className="portal-section-title">Nos Formats Publicitaires</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--muted)', fontSize: '0.9rem' }}>Choisissez le format qui correspond le mieux à votre campagne et à votre budget.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>1. Bannière Haut de Page (Leaderboard)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Format 970x250px ou 728x90px. Visibilité maximale sur toutes les pages du site, juste en dessous du menu principal.</p>
              <div style={{ width: '100%', height: '50px', backgroundColor: '#e2e8f0', border: '1px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b' }}>Exemple Bannière</div>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>2. Carré Latéral (Medium Rectangle)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Format 300x250px. Intégré dans la colonne de droite, parfait pour les conversions et clics.</p>
              <div style={{ width: '150px', height: '125px', backgroundColor: '#e2e8f0', border: '1px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#64748b' }}>Carré 300x250</div>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>3. Publireportage / Article Sponsorisé</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Un article complet rédigé par nos soins ou par vous, intégrant texte, images, vidéos et liens vers votre site, publié dans le flux d'actualités.</p>
            </div>
            
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: 'var(--card-bg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>4. Habillage de Site</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Format premium : votre marque prend le contrôle du fond d'écran du site pour une immersion totale.</p>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div>
          <h2 className="portal-section-title dark">Demander un Devis</h2>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            
            {status === "success" ? (
              <div style={{ padding: '2rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ fontWeight: 'bold' }}>{message}</p>
              </div>
            ) : (
              <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {status === "error" && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #ef4444' }}>
                    {message}
                  </div>
                )}
                
                <div>
                  <label htmlFor="company" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nom de l'entreprise *</label>
                  <input type="text" id="company" name="company" className="input" required placeholder="Votre entreprise ou agence" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nom du contact *</label>
                    <input type="text" id="name" name="name" className="input" required placeholder="Jean Dupont" />
                  </div>
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Téléphone</label>
                    <input type="tel" id="phone" name="phone" className="input" placeholder="+225 00 00 00 00" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Adresse Email *</label>
                  <input type="email" id="email" name="email" className="input" required placeholder="contact@entreprise.com" />
                </div>

                <div>
                  <label htmlFor="format" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Format publicitaire souhaité</label>
                  <select id="format" name="format" className="input" style={{ backgroundColor: 'white' }}>
                    <option value="">Sélectionnez un format...</option>
                    <option value="Bannière Haut de Page">Bannière Haut de Page</option>
                    <option value="Carré Latéral">Carré Latéral</option>
                    <option value="Publireportage">Publireportage</option>
                    <option value="Habillage">Habillage de site</option>
                    <option value="Autre">Autre / Conseil</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Détails de votre campagne</label>
                  <textarea id="message" name="message" className="input" rows={4} placeholder="Période souhaitée, budget estimé, cible..."></textarea>
                </div>

                <button type="submit" className="btn btn-primary" disabled={status === "loading"} style={{ width: '100%', fontSize: '1rem', padding: '1rem', opacity: status === "loading" ? 0.7 : 1 }}>
                  {status === "loading" ? "Envoi en cours..." : "Demander notre Media Kit & Devis"}
                </button>
              </form>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  )
}
