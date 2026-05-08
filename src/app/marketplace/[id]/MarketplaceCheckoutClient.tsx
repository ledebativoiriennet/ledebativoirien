'use client';

import React, { useState } from 'react';

interface Newspaper {
  id: string;
  title: string;
  price: number;
}

export default function MarketplaceCheckoutClient({ newspaper }: { newspaper: Newspaper }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez renseigner votre adresse e-mail pour recevoir le lien de téléchargement.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/payment/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newspaperId: newspaper.id,
          amount: newspaper.price,
          email,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'initialisation du paiement.");
      }

      if (data.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        throw new Error("L'URL de paiement n'a pas été retournée.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    padding: '1rem 1.25rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" style={labelStyle}>
          Nom complet (Optionnel)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder="Jean Dupont"
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        />
      </div>

      <div>
        <label htmlFor="email" style={labelStyle}>
          Adresse e-mail <span style={{ color: 'var(--primary)' }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="jean.dupont@exemple.com"
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        />
        <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
          Nous utiliserons cette adresse pour vous envoyer le lien de téléchargement après votre achat.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          backgroundColor: loading ? 'rgba(230, 0, 0, 0.5)' : 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          padding: '1.25rem',
          fontSize: '1.125rem',
          fontWeight: 900,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          transition: 'all 0.3s',
          boxShadow: '0 10px 20px -5px rgba(230, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {loading ? (
          <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        ) : (
          <>
            <span>Payer {newspaper.price} FCFA avec CinetPay</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </>
        )}
      </button>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Paiement sécurisé par CinetPay</span>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </form>
  );
}
