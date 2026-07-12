"use client";

import React, { useState } from 'react';

export default function BulkPriceUpdateClient() {
  const [price, setPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price))) return;

    if (!confirm(`Êtes-vous sûr de vouloir mettre à jour le prix de tous les journaux PDF à ${price} F ?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/marketplace/bulk-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(price) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setMessage({ text: `${data.count} journal(s) mis à jour avec succès.`, type: 'success' });
      setPrice('');
      
      // Rafraîchir la page pour afficher les nouveaux prix
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1.25rem',
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🏷️</span> Mettre à jour tous les prix
      </h3>
      <p style={{ margin: 0, color: '#aaa', fontSize: '0.85rem' }}>
        Modifiez le prix de tous les journaux PDF en une seule fois.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Nouveau prix (F)"
          required
          min="0"
          style={{
            flex: 1,
            background: '#0a0a0a',
            border: '1px solid #333',
            color: 'white',
            padding: '0.65rem',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="submit"
          disabled={loading || !price}
          style={{
            background: loading ? '#444' : '#ec1a24',
            color: 'white',
            border: 'none',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: loading || !price ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '...' : 'Appliquer'}
        </button>
      </form>

      {message && (
        <div style={{
          padding: '0.5rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}
