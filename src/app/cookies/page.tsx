import React from 'react';

export const metadata = {
  title: "Gestion des Cookies - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>Gestion des Cookies</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1rem' }}>Notre site utilise des cookies pour améliorer votre expérience utilisateur, réaliser des statistiques d'audience (Google Analytics) et proposer des publicités pertinentes (Google AdSense).
Vous pouvez configurer votre navigateur pour refuser ces cookies.</p>
      </div>
    </div>
  );
}
