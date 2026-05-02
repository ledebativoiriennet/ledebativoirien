import React from 'react';

export const metadata = {
  title: "Politique de Confidentialité - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Politique de Confidentialité
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1.5rem' }}>La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique de confidentialité explique comment Le Débat Ivoirien collecte, utilise et protège vos informations.</p>
        
        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>1. COLLECTE DES DONNÉES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Nous collectons les données suivantes :</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Données d'identification :</strong> Nom, prénom, adresse email (lors de la création d'un compte ou de l'inscription à la newsletter).</li>
            <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées (via des outils d'analyse d'audience).</li>
            <li><strong>Données de transaction :</strong> Informations nécessaires à la facturation de l'abonnement Premium (traitées de manière sécurisée par notre prestataire de paiement).</li>
          </ul>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>2. UTILISATION DES DONNÉES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Vos données sont utilisées pour :</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Vous fournir l'accès à nos articles et services Premium.</li>
            <li>Vous envoyer notre newsletter (si vous y avez consenti).</li>
            <li>Analyser le trafic de notre site afin d'améliorer la qualité de nos contenus.</li>
            <li>Assurer la sécurité de notre plateforme et prévenir les fraudes.</li>
          </ul>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>3. PARTAGE DES DONNÉES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Nous ne vendons, ne louons, ni ne cédons vos données personnelles à des tiers à des fins de prospection commerciale.</p>
          <p style={{ marginBottom: '0.8rem' }}>Vos données peuvent être partagées avec des prestataires techniques stricts (hébergement, envoi d'emails, paiement) soumis à des obligations de confidentialité.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>4. CONSERVATION DES DONNÉES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Vos données sont conservées pour la durée nécessaire aux finalités pour lesquelles elles ont été collectées. Les comptes inactifs pendant plus de 3 ans seront supprimés, conformément aux recommandations de sécurité.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>5. VOS DROITS</h2>
          <p style={{ marginBottom: '0.8rem' }}>Conformément à la législation sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.</p>
          <p style={{ marginBottom: '0.8rem' }}>Pour exercer ces droits, vous pouvez nous contacter à l'adresse : <strong>redaction@ledebativoirien.net</strong>.</p>
        </div>
      </div>
    </div>
  );
}
