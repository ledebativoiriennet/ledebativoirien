import React from 'react';

export const metadata = {
  title: "Politique de Confidentialité - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>Politique de Confidentialité</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1rem' }}>Le Débat Ivoirien s'engage à protéger vos données personnelles. 
Les informations recueillies (comme votre adresse email pour la newsletter) ne sont jamais revendues à des tiers.
Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de modification et de suppression de vos données.</p>
      </div>
    </div>
  );
}
