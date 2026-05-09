'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesValidationClient({ saleId }: { saleId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleValidate = async () => {
    if (!confirm('Voulez-vous vraiment valider ce paiement ? Cela débloquera le téléchargement pour le client.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/marketplace/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la validation');
      }

      router.refresh();
      alert('Paiement validé avec succès !');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleValidate}
      disabled={loading}
      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
        loading 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
      }`}
    >
      {loading ? 'Traitement...' : 'VALIDER'}
    </button>
  );
}
