import React from 'react';

export const metadata = {
  title: "Conditions Générales d'Utilisation (CGU) - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>Conditions Générales d'Utilisation (CGU)</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1rem' }}>Bienvenue sur Le Débat Ivoirien. En accédant à ce site, vous acceptez les présentes CGU. 
Le contenu publié sur ce site est la propriété intellectuelle de Le Débat Ivoirien et ne peut être reproduit sans autorisation préalable.
Les utilisateurs s'engagent à respecter les lois en vigueur lors de l'utilisation de nos espaces de commentaires.</p>
      </div>
    </div>
  );
}
