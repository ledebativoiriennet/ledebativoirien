'use client';
import { useState } from 'react';
import { subscribeNewsletter } from '@/app/actions/newsletter';
import Honeypot from '../Honeypot';

export default function NewsletterPromo() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setErrorMsg('');
    try {
      const formData = new FormData(e.currentTarget);
      const res = await subscribeNewsletter(formData);
      
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(res.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Une erreur est survenue.');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(rgba(17, 17, 17, 0.8), rgba(17, 17, 17, 0.95)), url("/promo-newsletter-square.png") center/cover no-repeat',
      borderRadius: 'var(--radius)',
      padding: '2rem 1.5rem',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '280px'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'inline-block', 
          backgroundColor: '#e60000', 
          color: 'white', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '4px', 
          fontSize: '0.7rem', 
          fontWeight: 800, 
          textTransform: 'uppercase',
          marginBottom: '1rem',
          letterSpacing: '0.05em'
        }}>
          Newsletter
        </div>
        
        <h3 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 900, 
          lineHeight: 1.3, 
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
          color: '#ffffff'
        }}>
          Restez connecté à l'essentiel
        </h3>
        
        <p style={{ 
          fontSize: '0.85rem', 
          color: '#94a3b8', 
          lineHeight: 1.6, 
          marginBottom: '1.5rem' 
        }}>
          Recevez nos décryptages et actualités directement dans votre boîte mail.
        </p>
        
        {status === 'success' ? (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(22, 101, 52, 0.2)', 
            border: '1px solid #166534',
            color: '#4ade80', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ✅ Merci pour votre inscription !
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Honeypot />
            <input 
              type="email" 
              name="email"
              placeholder="Votre adresse email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            {status === 'error' && (
              <p style={{ fontSize: '0.75rem', color: '#f87171', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>
                {errorMsg}
              </p>
            )}
            <button 
              type="submit"
              disabled={status === 'loading'}
              style={{ 
                width: '100%',
                backgroundColor: '#e60000',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                opacity: status === 'loading' ? 0.7 : 1
              }}
            >
              {status === 'loading' ? 'Inscription...' : "S'abonner gratuitement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
