"use client";

import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AISearchResult({ query }: { query: string }) {
  const [hasStarted, setHasStarted] = useState(false);
  const { messages, sendMessage, status, error } = useChat();
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    if (query && !hasStarted) {
      setHasStarted(true);
      sendMessage({
        text: query
      });
    }
  }, [query, sendMessage, hasStarted]);

  if (error) {
    // Ne pas afficher l'erreur en plein milieu si on n'a pas de clé API, on l'affiche discrètement ou on cache le bloc.
    return (
      <div style={{ backgroundColor: '#fff1f2', color: '#be123c', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #fecdd3' }}>
        <h3 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <span>⚠️</span> Fonctionnalité IA Indisponible
        </h3>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
          {error.message.includes("GEMINI_API_KEY") 
            ? "Veuillez configurer la variable d'environnement GEMINI_API_KEY pour activer la synthèse par IA." 
            : "Une erreur est survenue lors de la communication avec l'IA."}
        </p>
      </div>
    );
  }

  // Find the last assistant message
  const assistantMessage = messages.findLast(m => m.role === 'assistant');

  return (
    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
          IA
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Synthèse Intelligente</h2>
        {isLoading && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulse 2s infinite' }}></span>
            Analyse en cours...
          </span>
        )}
      </div>

      <div className="article-content" style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6 }}>
        {assistantMessage ? (
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => <a {...props} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }} />
            }}
          >
            {(assistantMessage as any).content || (assistantMessage.parts as any[])?.filter(p => p.type === 'text').map(p => p.text).join('') || ''}
          </ReactMarkdown>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Lecture des articles et génération de la réponse...</p>
        )}
      </div>
    </div>
  );
}
