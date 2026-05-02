import React from 'react';

export const metadata = {
  title: "Mentions Légales - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>Mentions Légales</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1rem' }}>Editeur du site : Le Débat Ivoirien
Adresse : Abidjan, Côte d'Ivoire
Directeur de la publication : La Rédaction
Hébergement : Hostinger
Contact : redaction@ledebativoirien.net</p>
      </div>
    </div>
  );
}
