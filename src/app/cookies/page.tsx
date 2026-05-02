import React from 'react';

export const metadata = {
  title: "Politique de Gestion des Cookies - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        Politique de Gestion des Cookies
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        <p style={{ marginBottom: '1.5rem' }}>Lors de votre consultation du site Le Débat Ivoirien, des informations relatives à la navigation de votre terminal sont susceptibles d'être enregistrées dans des fichiers "Cookies" installés sur votre appareil.</p>
        
        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>1. QU'EST-CE QU'UN COOKIE ?</h2>
          <p style={{ marginBottom: '0.8rem' }}>Un cookie est un petit fichier texte déposé sur votre disque dur par le serveur du site que vous visitez. Il contient quelques données (nom du serveur, identifiant sous forme de numéro unique, date d'expiration) qui permettent de mémoriser vos préférences de navigation.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>2. LES COOKIES QUE NOUS UTILISONS</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cookies strictement nécessaires :</strong> Indispensables au fonctionnement du site (ex: mémorisation de votre session pour l'accès Premium, enregistrement de vos choix en matière de consentement).</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cookies de mesure d'audience (Google Analytics) :</strong> Nous permettent de connaître l'utilisation et les performances de notre site, d'établir des statistiques et des volumes de fréquentation pour améliorer nos services.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cookies publicitaires (Google AdSense) :</strong> Permettent de vous proposer des publicités adaptées à vos centres d'intérêt. Ils limitent également le nombre de fois où vous voyez une annonce et aident à mesurer l'efficacité d'une campagne.</li>
          </ul>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>3. DURÉE DE CONSERVATION</h2>
          <p style={{ marginBottom: '0.8rem' }}>Les cookies ont une durée de vie limitée à 13 mois maximum après leur premier dépôt dans l'équipement du visiteur. À l'expiration de ce délai, votre consentement sera de nouveau recueilli via notre bannière interactive.</p>
        </div>

        <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>4. GESTION ET REFUS DES COOKIES</h2>
          <p style={{ marginBottom: '0.8rem' }}>Vous pouvez à tout moment modifier vos préférences via le bouton <strong>"Gérer mes consentements"</strong> situé dans le pied de page du site.</p>
          <p style={{ marginBottom: '0.8rem' }}>Vous pouvez également configurer votre navigateur internet de manière à ce que les cookies soient rejetés systématiquement ou selon leur émetteur.</p>
        </div>
      </div>
    </div>
  );
}
