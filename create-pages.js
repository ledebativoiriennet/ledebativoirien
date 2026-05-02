const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'cgu',
    title: "Conditions Générales d'Utilisation (CGU)",
    content: `Bienvenue sur Le Débat Ivoirien. L'utilisation du site ledebativoirien.net (ci-après "le Site") implique l'acceptation pleine et entière des conditions générales d'utilisation ci-après décrites. Ces conditions d'utilisation sont susceptibles d'être modifiées ou complétées à tout moment, les utilisateurs du Site sont donc invités à les consulter de manière régulière.

1. OBJET DU SITE
Le Site a pour objet de fournir une information concernant l'actualité politique, économique, sociale et culturelle, principalement en Côte d'Ivoire et dans le monde. La Rédaction s'efforce de fournir sur le Site des informations aussi précises que possible. Toutefois, elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.

2. PROPRIÉTÉ INTELLECTUELLE ET CONTREFAÇONS
Le Débat Ivoirien est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logo, icônes, sons, logiciels. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de la direction de publication.

3. LIMITATIONS DE RESPONSABILITÉ
Le Débat Ivoirien ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel inadapté, soit de l'apparition d'un bug ou d'une incompatibilité. Le Débat Ivoirien décline également toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.

4. GESTION DES COMMENTAIRES ET ESPACES INTERACTIFS
Des espaces interactifs (possibilité de poser des questions ou de commenter des articles) sont à la disposition des utilisateurs. Le Débat Ivoirien se réserve le droit de supprimer, sans mise en demeure préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en Côte d'Ivoire, en particulier aux dispositions relatives à la protection des données et au respect de la dignité humaine (propos racistes, injurieux, diffamants, etc.).

5. DROIT APPLICABLE ET ATTRIBUTION DE JURIDICTION
Tout litige en relation avec l'utilisation du site ledebativoirien.net est soumis au droit ivoirien. Il est fait attribution exclusive de juridiction aux tribunaux compétents d'Abidjan.`
  },
  {
    path: 'mentions-legales',
    title: "Mentions Légales",
    content: `Conformément aux dispositions légales en vigueur, nous portons à la connaissance des utilisateurs et visiteurs du site Le Débat Ivoirien les informations suivantes :

1. ÉDITEUR DU SITE
Le site ledebativoirien.net est édité par le groupe de presse Le Débat Ivoirien.
Siège social : Abidjan, Côte d'Ivoire.
Email de contact : redaction@ledebativoirien.net
Téléphone : +225 00 00 00 00 00

2. DIRECTEUR DE LA PUBLICATION
Le Directeur de la publication est le rédacteur en chef du média "Le Débat Ivoirien".
Pour toute demande relative au contenu éditorial, veuillez nous contacter à l'adresse email de la rédaction.

3. HÉBERGEMENT
Le site est hébergé par Hostinger International Ltd.
Siège social de l'hébergeur : 61 Lordou Vironos Street, 6023 Larnaca, Chypre.
Les données sont stockées dans des centres de données sécurisés garantissant un haut niveau de disponibilité et de sécurité, conformément aux standards internationaux.

4. PROPRIÉTÉ INTELLECTUELLE
L'ensemble de ce site relève de la législation ivoirienne et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.

5. SIGNALEMENT D'UN CONTENU ILLICITE
Si vous constatez un contenu illicite, diffamatoire ou portant atteinte à vos droits, vous pouvez nous le signaler en envoyant un email détaillé à redaction@ledebativoirien.net. Nous nous engageons à traiter votre demande dans les plus brefs délais.`
  },
  {
    path: 'confidentialite',
    title: "Politique de Confidentialité",
    content: `La protection de vos données personnelles est au cœur de nos préoccupations. Cette politique de confidentialité explique comment Le Débat Ivoirien collecte, utilise et protège vos informations.

1. COLLECTE DES DONNÉES
Nous collectons les données suivantes :
- Données d'identification : Nom, prénom, adresse email (lors de la création d'un compte ou de l'inscription à la newsletter).
- Données de navigation : Adresse IP, type de navigateur, pages visitées (via des outils d'analyse d'audience).
- Données de transaction : Informations nécessaires à la facturation de l'abonnement Premium (traitées de manière sécurisée par notre prestataire de paiement).

2. UTILISATION DES DONNÉES
Vos données sont utilisées pour :
- Vous fournir l'accès à nos articles et services Premium.
- Vous envoyer notre newsletter (si vous y avez consenti).
- Analyser le trafic de notre site afin d'améliorer la qualité de nos contenus.
- Assurer la sécurité de notre plateforme et prévenir les fraudes.

3. PARTAGE DES DONNÉES
Nous ne vendons, ne louons, ni ne cédons vos données personnelles à des tiers à des fins de prospection commerciale. Vos données peuvent être partagées avec des prestataires techniques stricts (hébergement, envoi d'emails, paiement) soumis à des obligations de confidentialité.

4. CONSERVATION DES DONNÉES
Vos données sont conservées pour la durée nécessaire aux finalités pour lesquelles elles ont été collectées. Les comptes inactifs pendant plus de 3 ans seront supprimés, conformément aux recommandations de sécurité.

5. VOS DROITS
Conformément à la législation sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, vous pouvez nous contacter à l'adresse : redaction@ledebativoirien.net.`
  },
  {
    path: 'cookies',
    title: "Politique de Gestion des Cookies",
    content: `Lors de votre consultation du site Le Débat Ivoirien, des informations relatives à la navigation de votre terminal sont susceptibles d'être enregistrées dans des fichiers "Cookies" installés sur votre appareil.

1. QU'EST-CE QU'UN COOKIE ?
Un cookie est un petit fichier texte déposé sur votre disque dur par le serveur du site que vous visitez. Il contient quelques données (nom du serveur, identifiant sous forme de numéro unique, date d'expiration) qui permettent de mémoriser vos préférences de navigation.

2. LES COOKIES QUE NOUS UTILISONS
- Cookies strictement nécessaires : Indispensables au fonctionnement du site (ex: mémorisation de votre session pour l'accès Premium, enregistrement de vos choix en matière de consentement).
- Cookies de mesure d'audience (Google Analytics) : Nous permettent de connaître l'utilisation et les performances de notre site, d'établir des statistiques et des volumes de fréquentation pour améliorer nos services.
- Cookies publicitaires (Google AdSense) : Permettent de vous proposer des publicités adaptées à vos centres d'intérêt. Ils limitent également le nombre de fois où vous voyez une annonce et aident à mesurer l'efficacité d'une campagne.

3. DURÉE DE CONSERVATION
Les cookies ont une durée de vie limitée à 13 mois maximum après leur premier dépôt dans l'équipement du visiteur. À l'expiration de ce délai, votre consentement sera de nouveau recueilli via notre bannière interactive.

4. GESTION ET REFUS DES COOKIES
Vous pouvez à tout moment modifier vos préférences via le bouton "Gérer mes consentements" situé dans le pied de page du site. Vous pouvez également configurer votre navigateur internet de manière à ce que les cookies soient rejetés systématiquement ou selon leur émetteur.`
  },
  {
    path: 'accessibilite',
    title: "Déclaration d'Accessibilité",
    content: `Le Débat Ivoirien s'engage à rendre son site internet accessible à tous, y compris aux personnes en situation de handicap, conformément aux standards d'accessibilité numérique.

1. ÉTAT DE CONFORMITÉ
Le site Le Débat Ivoirien est actuellement "partiellement conforme" aux directives d'accessibilité du Web (WCAG 2.1). Nous mettons en œuvre des efforts continus pour améliorer l'expérience de tous nos utilisateurs.

2. AMÉLIORATIONS EN COURS
Nous travaillons activement sur les points suivants :
- Les contrastes de couleurs pour faciliter la lecture des malvoyants.
- La hiérarchisation stricte des balises (H1, H2, H3) pour une navigation fluide via les lecteurs d'écran.
- L'ajout d'alternatives textuelles pertinentes pour toutes les images d'illustration.
- L'optimisation de la navigation au clavier (Tabulation).

3. TECHNOLOGIES UTILISÉES
Ce site a été conçu en utilisant HTML5, CSS3, JavaScript, React et Next.js, en veillant à respecter les standards du W3C.

4. NOUS CONTACTER
Si vous n'arrivez pas à accéder à un contenu ou à un service de ce site en raison d'un handicap, nous vous invitons à nous contacter pour que nous puissions vous proposer une alternative ou corriger le problème.
Contactez-nous à l'adresse : redaction@ledebativoirien.net avec pour objet "Accessibilité".`
  }
];

const template = (title, content) => \`import React from 'react';

export const metadata = {
  title: "\${title.replace(/"/g, '\\"')} - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', color: 'var(--primary)', borderBottom: '4px solid var(--border)', paddingBottom: '1rem' }}>
        \${title}
      </h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        \${content.split('\\n\\n').map(paragraph => {
          if (paragraph.match(/^[0-9]\\./)) {
            const [subtitle, ...rest] = paragraph.split('\\n');
            return \`
            <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>\${subtitle}</h2>
              \${rest.map(line => \`<p style={{ marginBottom: '0.8rem' }}>\${line}</p>\`).join('\\n              ')}
            </div>\`;
          }
          return \`<p style={{ marginBottom: '1.5rem' }}>\${paragraph.replace(/\\n/g, '<br />')}</p>\`;
        }).join('\\n')}
      </div>
    </div>
  );
}
\`;

pages.forEach(page => {
  const dir = path.join(__dirname, 'src', 'app', page.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(page.title, page.content));
});

console.log('Comprehensive Pages created!');
