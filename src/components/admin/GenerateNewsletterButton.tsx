"use client";

import { useState } from "react";

export default function GenerateNewsletterButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; usedAi?: boolean } | null>(null);

  const handleGenerate = async () => {
    if (!confirm("Voulez-vous vraiment générer et envoyer une newsletter express à tous vos abonnés maintenant ?")) {
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/generate-newsletter', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');

      setResult({ success: true, message: data.message, usedAi: data.usedAi });
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>⚡</span> Génération Express (IA)
      </h3>
      <p style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
        Cette action va récupérer les 5 derniers articles, utiliser l'IA pour écrire une introduction engageante, et envoyer immédiatement une édition spéciale à tous vos abonnés actifs.
      </p>
      
      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          backgroundColor: isGenerating ? '#fbbf24' : '#f59e0b',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: isGenerating ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {isGenerating ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            Génération et Envoi en cours...
          </>
        ) : (
          <>
            <span>🚀</span>
            Générer & Envoyer Maintenant
          </>
        )}
      </button>

      {result && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          borderRadius: '8px', 
          backgroundColor: result.success ? '#dcfce7' : '#fee2e2',
          color: result.success ? '#166534' : '#991b1b',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {result.message}
          {result.success && !result.usedAi && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#854d0e', fontWeight: 'normal' }}>
              Note: L'envoi a réussi, mais l'introduction n'a pas été générée par l'IA car la clé API (GEMINI_API_KEY) n'est pas configurée.
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
