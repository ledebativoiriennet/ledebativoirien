import React from 'react';

export const metadata = {
  title: "Conditions Générales d'Utilisation - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Conditions Générales d'Utilisation (CGU)
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1.5rem' }}>Bienvenue sur Le Débat Ivoirien. L'utilisation du site ledebativoirien.net (ci-après "le Site") implique l'acceptation pleine et entière des conditions générales d'utilisation ci-après décrites. Ces conditions d'utilisation sont susceptibles d'être modifiées ou complétées à tout moment, les utilisateurs du Site sont donc invités à les consulter de manière régulière.</p>
        
        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>1. OBJET DU SITE</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le Site a pour objet de fournir une information concernant l'actualité politique, économique, sociale et culturelle, principalement en Côte d'Ivoire et dans le monde. La Rédaction s'efforce de fournir sur le Site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>2. PROPRIÉTÉ INTELLECTUELLE ET CONTREFAÇONS</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le Débat Ivoirien est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logo, icônes, sons, logiciels.</p>
          <p style={{ marginBottom: '0.8rem' }}>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de la direction de publication.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>3. LIMITATIONS DE RESPONSABILITÉ</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le Débat Ivoirien ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel inadapté, soit de l'apparition d'un bug ou d'une incompatibilité.</p>
          <p style={{ marginBottom: '0.8rem' }}>Le Débat Ivoirien décline également toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>4. GESTION DES COMMENTAIRES ET ESPACES INTERACTIFS</h2>
          <p style={{ marginBottom: '0.8rem' }}>Des espaces interactifs (possibilité de poser des questions ou de commenter des articles) sont à la disposition des utilisateurs.</p>
          <p style={{ marginBottom: '0.8rem' }}>Le Débat Ivoirien se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en Côte d'Ivoire, en particulier aux dispositions relatives à la protection des données et au respect de la dignité humaine (propos racistes, injurieux, diffamants, etc.).</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>5. DROIT APPLICABLE ET ATTRIBUTION DE JURIDICTION</h2>
          <p style={{ marginBottom: '0.8rem' }}>Tout litige en relation avec l'utilisation du site ledebativoirien.net est soumis au droit ivoirien. Il est fait attribution exclusive de juridiction aux tribunaux compétents d'Abidjan.</p>
        </div>
      </div>
    </div>
  );
}
