"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsentPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ldi_cookie_consent');
    if (!consent) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ldi_cookie_consent', 'accepted');
    setShowPopup(false);
    // Ici, vous pourriez déclencher l'initialisation de Google Analytics / AdSense
  };

  const handleDecline = () => {
    localStorage.setItem('ldi_cookie_consent', 'declined');
    setShowPopup(false);
    // Ici, vous pourriez désactiver les cookies optionnels
  };

  if (!showPopup) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      backgroundColor: '#1e293b',
      color: 'white',
      padding: '1rem',
      boxShadow: '0 -4px 10px rgba(0,0,0,0.3)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'center', maxWidth: '800px' }}>
          <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.3rem' }}>🍪 Respect de votre vie privée</strong>
          Nous utilisons des cookies pour améliorer votre expérience de navigation, diffuser des publicités ou des contenus personnalisés et analyser notre trafic. 
          En cliquant sur "Tout accepter", vous consentez à notre utilisation des cookies. 
          <Link href="/cookies" style={{ color: 'var(--primary)', marginLeft: '0.5rem', textDecoration: 'underline' }}>En savoir plus</Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <button 
            onClick={handleDecline}
            style={{ padding: '0.5rem 1.5rem', backgroundColor: 'transparent', color: 'white', border: '1px solid #64748b', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Refuser
          </button>
          <button 
            onClick={handleAccept}
            style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
