'use client';

import React, { useState } from 'react';

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/sync-wp', {
        method: 'POST',
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.message);
      } else {
        setResult(`Erreur: ${data.error}`);
      }
    } catch (error) {
      setResult('Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Synchronisation WordPress</h1>
      
      <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-lg max-w-2xl">
        <p className="text-[#888] mb-6">
          Utilisez cet outil pour récupérer les derniers articles publiés sur <strong>ledebativoirien.net</strong>. 
          Cela mettra à jour la base de données du serveur Hostinger.
        </p>

        <button
          onClick={handleSync}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-[#ec1a24] hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
          }`}
        >
          {loading ? 'Synchronisation en cours...' : '🚀 Lancer la synchronisation maintenant'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded border ${
            result.startsWith('Erreur') 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-green-900/20 border-green-800 text-green-400'
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-[#555]">
        <p>Note : Cette opération peut prendre quelques secondes selon le nombre d'images à récupérer.</p>
      </div>
    </div>
  );
}
