import React from 'react';

/**
 * Extrait automatiquement les points clés d'un contenu HTML.
 * Utilise une heuristique simple basée sur la structure des paragraphes.
 */
function extractKeyPoints(htmlContent: string): string[] {
  if (!htmlContent) return [];

  // 1. Extraire le texte des paragraphes pour éviter les titres, scripts, etc.
  const paragraphMatches = htmlContent.match(/<p[^>]*>(.*?)<\/p>/gi);
  if (!paragraphMatches) {
    // Fallback si pas de <p> : on nettoie tout le HTML
    const text = htmlContent.replace(/<[^>]*>?/gm, ' ');
    const sentences = text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
    const validSentences = sentences.filter(s => s.length > 50 && s.length < 200);
    return Array.from(new Set(validSentences)).slice(0, 3);
  }

  // 2. Nettoyer les paragraphes et extraire les premières phrases significatives
  const points: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < paragraphMatches.length; i++) {
    const pText = paragraphMatches[i].replace(/<[^>]*>?/gm, ' ').trim();
    if (pText.length < 50) continue; // Ignorer les paragraphes trop courts

    // Prendre la première phrase du paragraphe
    const firstSentenceMatch = pText.match(/^[^.!?]+[.!?]+/);
    if (firstSentenceMatch) {
      const sentence = firstSentenceMatch[0].trim();
      if (sentence.length > 40 && !seen.has(sentence)) {
        points.push(sentence);
        seen.add(sentence);
      }
    }

    if (points.length >= 3) break; // 3 points clés maximum
  }

  return points;
}

export default function ArticleSummary({ content }: { content: string }) {
  const points = extractKeyPoints(content);

  // S'il n'y a pas assez de contenu pour faire un résumé pertinent
  if (points.length < 2) return null;

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid var(--primary)',
      padding: '1.5rem',
      borderRadius: '0 8px 8px 0',
      marginBottom: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 800,
        color: '#1e293b',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textTransform: 'uppercase'
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚡</span> Les points clés
      </h3>
      <ul style={{
        margin: 0,
        paddingLeft: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        color: '#334155'
      }}>
        {points.map((point, idx) => (
          <li key={idx} style={{ lineHeight: 1.5, fontSize: '0.95rem', fontWeight: 500 }}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
