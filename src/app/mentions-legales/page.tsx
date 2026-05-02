import React from 'react';

export const metadata = {
  title: "Mentions Légales - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Mentions Légales
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1.5rem' }}>Conformément aux dispositions légales en vigueur, nous portons à la connaissance des utilisateurs et visiteurs du site Le Débat Ivoirien les informations suivantes :</p>
        
        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>1. ÉDITEUR DU SITE</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le site ledebativoirien.net est édité par le groupe de presse Le Débat Ivoirien.</p>
          <p style={{ marginBottom: '0.8rem' }}>Siège social : Abidjan, Côte d'Ivoire.<br/>Email de contact : redaction@ledebativoirien.net<br/>Téléphone : +225 00 00 00 00 00</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>2. DIRECTEUR DE LA PUBLICATION</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le Directeur de la publication est le rédacteur en chef du média "Le Débat Ivoirien".</p>
          <p style={{ marginBottom: '0.8rem' }}>Pour toute demande relative au contenu éditorial, veuillez nous contacter à l'adresse email de la rédaction.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>3. HÉBERGEMENT</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le site est hébergé par Hostinger International Ltd.<br/>Siège social de l'hébergeur : 61 Lordou Vironos Street, 6023 Larnaca, Chypre.</p>
          <p style={{ marginBottom: '0.8rem' }}>Les données sont stockées dans des centres de données sécurisés garantissant un haut niveau de disponibilité et de sécurité, conformément aux standards internationaux.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>4. PROPRIÉTÉ INTELLECTUELLE</h2>
          <p style={{ marginBottom: '0.8rem' }}>L'ensemble de ce site relève de la législation ivoirienne et internationale sur le droit d'auteur et la propriété intellectuelle.</p>
          <p style={{ marginBottom: '0.8rem' }}>Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>5. SIGNALEMENT D'UN CONTENU ILLICITE</h2>
          <p style={{ marginBottom: '0.8rem' }}>Si vous constatez un contenu illicite, diffamatoire ou portant atteinte à vos droits, vous pouvez nous le signaler en envoyant un email détaillé à redaction@ledebativoirien.net.</p>
          <p style={{ marginBottom: '0.8rem' }}>Nous nous engageons à traiter votre demande dans les plus brefs délais.</p>
        </div>
      </div>
    </div>
  );
}
