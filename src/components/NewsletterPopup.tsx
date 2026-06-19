"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import Honeypot from "./Honeypot";

export default function NewsletterPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Vérifier si l'utilisateur doit voir la popup
  useEffect(() => {
    // Ne rien faire sur le serveur
    if (typeof window === "undefined") return;

    // Vérifier si déjà inscrit
    const isSubscribed = localStorage.getItem("ldi_newsletter_subscribed");
    if (isSubscribed === "true") {
      setShow(false);
      return;
    }

    // Afficher uniquement sur la page d'accueil ou la lecture d'un article
    const isTargetPage = pathname === "/" || pathname.startsWith("/article/");
    
    if (isTargetPage) {
      // Masquer au changement de page, puis afficher avec un délai
      setShow(false);
      setSuccess(false);
      setError("");
      
      const timer = setTimeout(() => {
        // Double vérification au cas où l'utilisateur se serait inscrit entre temps
        if (localStorage.getItem("ldi_newsletter_subscribed") !== "true") {
          setShow(true);
        }
      }, 3000); // Délai de 3 secondes avant l'apparition
      
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [pathname]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);
    
    if (result.success) {
      setSuccess(true);
      setEmail("");
      localStorage.setItem("ldi_newsletter_subscribed", "true");
      
      // Fermer la modale après 3 secondes de succès
      setTimeout(() => {
        setShow(false);
      }, 3000);
    } else {
      setError(result.error || "Erreur lors de l'inscription");
    }
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
        border: '1px solid #333',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Bouton de fermeture */}
        <button 
          onClick={() => setShow(false)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            transition: 'background 0.2s',
            zIndex: 10
          }}
          aria-label="Fermer"
        >
          &times;
        </button>

        {/* En-tête avec image/logo */}
        <div style={{ 
          padding: '2rem 2rem 1.5rem', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'radial-gradient(circle at top, rgba(204, 0, 0, 0.15), transparent 70%)'
        }}>
          <img 
            src="/logo.png" 
            alt="Logo Le Débat Ivoirien" 
            style={{ height: '50px', width: 'auto', margin: '0 auto 1rem', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} 
          />
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            Ne manquez rien de l'actualité !
          </h2>
        </div>

        {/* Contenu */}
        <div style={{ padding: '1.5rem 2rem 2rem' }}>
          <p style={{ color: '#a3a3a3', fontSize: '0.95rem', lineHeight: 1.5, textAlign: 'center', marginBottom: '1.5rem' }}>
            Inscrivez-vous à notre newsletter pour recevoir chaque jour l'essentiel de l'actualité ivoirienne et internationale.
          </p>

          {success ? (
            <div style={{ 
              backgroundColor: 'rgba(22, 101, 52, 0.2)', 
              border: '1px solid #166534',
              color: '#4ade80', 
              padding: '1rem', 
              borderRadius: '8px', 
              fontWeight: 'bold',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              ✅ Merci pour votre inscription !
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Honeypot />
              <div>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Votre adresse email..." 
                  style={{ 
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }} 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {error && <div style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>{error}</div>}
              
              <button type="submit" disabled={loading} style={{ 
                width: "100%", 
                backgroundColor: "#cc0000", 
                color: "white", 
                border: 'none', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(204, 0, 0, 0.2)'
              }}>
                {loading ? "Inscription en cours..." : "Je m'abonne gratuitement"}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <span 
                  onClick={() => setShow(false)} 
                  style={{ color: '#737373', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Non merci, je souhaite continuer ma lecture
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
