const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'cgu',
    title: 'Conditions Générales d\'Utilisation (CGU)',
    content: `Bienvenue sur Le Débat Ivoirien. En accédant à ce site, vous acceptez les présentes CGU. 
Le contenu publié sur ce site est la propriété intellectuelle de Le Débat Ivoirien et ne peut être reproduit sans autorisation préalable.
Les utilisateurs s'engagent à respecter les lois en vigueur lors de l'utilisation de nos espaces de commentaires.`
  },
  {
    path: 'mentions-legales',
    title: 'Mentions Légales',
    content: `Editeur du site : Le Débat Ivoirien
Adresse : Abidjan, Côte d'Ivoire
Directeur de la publication : La Rédaction
Hébergement : Hostinger
Contact : redaction@ledebativoirien.net`
  },
  {
    path: 'confidentialite',
    title: 'Politique de Confidentialité',
    content: `Le Débat Ivoirien s'engage à protéger vos données personnelles. 
Les informations recueillies (comme votre adresse email pour la newsletter) ne sont jamais revendues à des tiers.
Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de modification et de suppression de vos données.`
  },
  {
    path: 'cookies',
    title: 'Gestion des Cookies',
    content: `Notre site utilise des cookies pour améliorer votre expérience utilisateur, réaliser des statistiques d'audience (Google Analytics) et proposer des publicités pertinentes (Google AdSense).
Vous pouvez configurer votre navigateur pour refuser ces cookies.`
  },
  {
    path: 'accessibilite',
    title: 'Accessibilité : partiellement conforme',
    content: `Le Débat Ivoirien s'efforce de rendre son site accessible à tous, y compris aux personnes en situation de handicap. 
Actuellement, notre site est partiellement conforme aux directives d'accessibilité du Web. Nous travaillons continuellement à l'amélioration de nos interfaces.`
  }
];

const template = (title, content) => `import React from 'react';

export const metadata = {
  title: "${title} - Le Débat Ivoirien"
};

export default function Page() {
  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: 'var(--primary)' }}>${title}</h1>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
        ${content.split('\\n').map(line => `<p style={{ marginBottom: '1rem' }}>${line}</p>`).join('\\n        ')}
      </div>
    </div>
  );
}
`;

pages.forEach(page => {
  const dir = path.join(__dirname, 'src', 'app', page.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(page.title, page.content));
});

console.log('Pages created!');
