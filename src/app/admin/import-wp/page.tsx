'use client';
import { useState } from 'react';

export default function ImportWPPage() {
  const [file, setFile] = useState<File | null>(null);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleImport() {
    if (!file || !secret) return alert('Fichier XML et secret requis');
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/admin/import-wp', {
        method: 'POST',
        headers: { 'x-seed-secret': secret },
        body: fd,
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>
        📥 Import WordPress XML
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
            Fichier XML WordPress
          </label>
          <input
            type="file"
            accept=".xml"
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.9rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
            Secret d'accès (SEED_SECRET)
          </label>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="Entrez le secret configuré sur le serveur"
            style={{ display: 'block', marginTop: '0.5rem', width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
          />
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !file || !secret}
          style={{
            backgroundColor: loading ? '#94a3b8' : '#ec1a24',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          {loading ? '⏳ Import en cours...' : '🚀 Lancer l\'import'}
        </button>
      </div>

      {result && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`,
        }}>
          {result.success ? (
            <>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', marginBottom: '1rem' }}>
                ✅ Import réussi !
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>{result.imported}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Importés</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626' }}>{result.errors}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Erreurs</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0369a1' }}>{result.total}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total trouvés</div>
                </div>
              </div>
              {result.log && result.log.length > 0 && (
                <pre style={{ fontSize: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', overflowX: 'auto', color: '#334155' }}>
                  {result.log.join('\n')}
                </pre>
              )}
            </>
          ) : (
            <div style={{ color: '#dc2626', fontWeight: 700 }}>
              ❌ Erreur : {result.error}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '0.8rem', color: '#9a3412' }}>
        <strong>⚠️ Prérequis :</strong> Définir la variable d'environnement <code>SEED_SECRET</code> sur Hostinger, puis utiliser cette même valeur ici.
      </div>
    </div>
  );
}
