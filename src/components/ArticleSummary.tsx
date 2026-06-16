import React from 'react';

/**
 * Nettoie le HTML et gère les entités basiques pour une bonne extraction.
 */
function cleanHtmlText(html: string) {
  // 1. Enlever les scripts et styles
  let text = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');
  // 2. Remplacer les balises par un espace
  text = text.replace(/<[^>]*>?/gm, ' ');
  // 3. Remplacer les multiples espaces par un seul
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Extrait automatiquement les points clés d'un contenu HTML.
 */
function extractKeyPoints(htmlContent: string): string[] {
  if (!htmlContent) return [];

  // Match des paragraphes avec [\s\S]*? pour inclure les sauts de ligne
  const paragraphMatches = htmlContent.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (!paragraphMatches) {
    const text = cleanHtmlText(htmlContent);
    const sentences = text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
    const validSentences = sentences.filter(s => s.length > 50 && s.length < 300);
    return Array.from(new Set(validSentences)).slice(0, 3);
  }

  const points: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < paragraphMatches.length; i++) {
    const pText = cleanHtmlText(paragraphMatches[i]);
    if (pText.length < 50) continue;

    const firstSentenceMatch = pText.match(/^[^.!?]+[.!?]+/);
    if (firstSentenceMatch) {
      const sentence = firstSentenceMatch[0].trim();
      if (sentence.length > 40 && !seen.has(sentence)) {
        points.push(sentence);
        seen.add(sentence);
      }
    }

    if (points.length >= 3) break;
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
      marginBottom: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      wordBreak: 'normal'
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
          <li 
            key={idx}
            style={{ 
              lineHeight: 1.5, 
              fontSize: '0.95rem', 
              fontWeight: 500,
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              WebkitHyphens: 'none',
              hyphens: 'none'
            }}
            dangerouslySetInnerHTML={{ __html: point }}
          />
        ))}
      </ul>
    </div>
  );
}
