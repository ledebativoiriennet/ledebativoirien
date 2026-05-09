'use client';

import React, { useState } from 'react';

interface Newspaper {
  id: string;
  title: string;
  price: number;
}

type PaymentMethod = 'online' | 'manual';

export default function MarketplaceCheckoutClient({ newspaper }: { newspaper: Newspaper }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    if (paymentMethod === 'manual' && !transactionRef) {
      setError("Veuillez saisir la référence de votre transaction (ID reçu par SMS).");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (paymentMethod === 'online') {
        const response = await fetch('/api/marketplace/payment/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newspaperId: newspaper.id, amount: newspaper.price, email, name }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de l'initialisation du paiement.");
        if (data.data?.payment_url) {
          window.location.href = data.data.payment_url;
        } else {
          throw new Error("L'URL de paiement n'a pas été retournée.");
        }
      } else {
        // Flux Manuel
        const response = await fetch('/api/marketplace/payment/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            newspaperId: newspaper.id, 
            amount: newspaper.price, 
            email, 
            name, 
            transactionRef 
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erreur lors de l'enregistrement.");
        setSuccess(true);
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

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>Demande enregistrée !</h3>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
          Votre référence de paiement <strong>{transactionRef}</strong> est en cours de vérification.<br/>
          Dès confirmation (généralement moins de 15 min), vous recevrez le lien de téléchargement par e-mail à : <strong>{email}</strong>.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          style={{ marginTop: '1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          type="button"
          onClick={() => setPaymentMethod('online')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid', borderColor: paymentMethod === 'online' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', backgroundColor: paymentMethod === 'online' ? 'rgba(230,0,0,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
        >
          💳 CARTE / MOBILE
        </button>
        <button 
          type="button"
          onClick={() => setPaymentMethod('manual')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid', borderColor: paymentMethod === 'manual' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', backgroundColor: paymentMethod === 'manual' ? 'rgba(230,0,0,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
        >
          📲 TRANSFERT DIRECT
        </button>
      </div>

      {paymentMethod === 'manual' && (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.2)', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>Instructions de transfert :</h4>
          <ul style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Orange Money : <strong>+225 07 59 69 79 65</strong></li>
            <li>Wave : <strong>+225 07 59 69 79 65</strong></li>
            <li>Montant à transférer : <strong>{newspaper.price} FCFA</strong></li>
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="email" style={labelStyle}>Adresse e-mail *</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="jean.dupont@exemple.com"
        />
      </div>

      {paymentMethod === 'manual' && (
        <div>
          <label htmlFor="ref" style={labelStyle}>ID de Transaction (Reçu par SMS) *</label>
          <input
            type="text"
            id="ref"
            required
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            style={{ ...inputStyle, borderColor: 'var(--primary)', borderStyle: 'dashed' }}
            placeholder="Ex: PP240509.1234.A12345"
          />
        </div>
      )}

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
        }}
      >
        {loading ? (
          <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        ) : (
          <span>{paymentMethod === 'online' ? `Payer ${newspaper.price} FCFA` : 'Valider mon transfert'}</span>
        )}
      </button>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>
        {paymentMethod === 'online' ? 'Paiement sécurisé par CinetPay' : 'Traitement manuel par notre équipe'}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }` }} />
    </form>
  );
}
