import React from 'react';

export const metadata = {
  title: "Accessibilité : partiellement conforme - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>Accessibilité : partiellement conforme</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1rem' }}>Le Débat Ivoirien s'efforce de rendre son site accessible à tous, y compris aux personnes en situation de handicap. 
Actuellement, notre site est partiellement conforme aux directives d'accessibilité du Web. Nous travaillons continuellement à l'amélioration de nos interfaces.</p>
      </div>
    </div>
  );
}
