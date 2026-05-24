'use client';
import { useState } from 'react';

export default function NewsletterPromo() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      color: 'var(--foreground)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid var(--border)'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'inline-block', 
          backgroundColor: '#0ea5e9', 
          color: 'white', 
          padding: '0.2rem 0.6rem', 
          borderRadius: '4px', 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          Newsletter
        </div>
        
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 900, 
          lineHeight: 1.2, 
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          L'essentiel chaque soir
        </h3>
        
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--muted)', 
          lineHeight: 1.5, 
          marginBottom: '1rem' 
        }}>
          Recevez le récapitulatif des infos clés directement dans votre boîte mail.
        </p>
        
        {status === 'success' ? (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ✅ Merci pour votre inscription !
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input 
              type="email" 
              placeholder="Votre email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              style={{ 
                width: '100%',
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)',
                padding: '0.6rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              🚀 {status === 'loading' ? 'Inscription...' : "S'abonner gratuitement"}
            </button>
            {status === 'error' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', textAlign: 'center', margin: 0 }}>
                Une erreur est survenue. Réessayez.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
