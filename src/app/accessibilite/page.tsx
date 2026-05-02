import React from 'react';

export const metadata = {
  title: "Déclaration d'Accessibilité - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Déclaration d'Accessibilité
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1.5rem' }}>Le Débat Ivoirien s'engage à rendre son site internet accessible à tous, y compris aux personnes en situation de handicap, conformément aux standards d'accessibilité numérique.</p>
        
        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>1. ÉTAT DE CONFORMITÉ</h2>
          <p style={{ marginBottom: '0.8rem' }}>Le site Le Débat Ivoirien est actuellement <strong>"partiellement conforme"</strong> aux directives d'accessibilité du Web (WCAG 2.1). Nous mettons en œuvre des efforts continus pour améliorer l'expérience de tous nos utilisateurs.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>2. AMÉLIORATIONS EN COURS</h2>
          <p style={{ marginBottom: '0.8rem' }}>Nous travaillons activement sur les points suivants :</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Les contrastes de couleurs pour faciliter la lecture des malvoyants.</li>
            <li>La hiérarchisation stricte des balises (H1, H2, H3) pour une navigation fluide via les lecteurs d'écran.</li>
            <li>L'ajout d'alternatives textuelles pertinentes pour toutes les images d'illustration.</li>
            <li>L'optimisation de la navigation au clavier (Tabulation).</li>
          </ul>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>3. TECHNOLOGIES UTILISÉES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Ce site a été conçu en utilisant les technologies web modernes HTML5, CSS3, JavaScript, et React, en veillant à respecter les standards du W3C.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>4. NOUS CONTACTER</h2>
          <p style={{ marginBottom: '0.8rem' }}>Si vous n'arrivez pas à accéder à un contenu ou à un service de ce site en raison d'un handicap, nous vous invitons à nous contacter pour que nous puissions vous proposer une alternative ou corriger le problème.</p>
          <p style={{ marginBottom: '0.8rem' }}>Contactez-nous à l'adresse : <strong>redaction@ledebativoirien.net</strong> avec pour objet "Accessibilité".</p>
        </div>
      </div>
    </div>
  );
}
