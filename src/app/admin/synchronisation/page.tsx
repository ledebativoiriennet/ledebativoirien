'use client';

import React, { useState } from 'react';

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [loadingRepair, setLoadingRepair] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/sync-wp', { method: 'POST' });
      const data = await response.json();
      setResult(response.ok ? data.message : `Erreur: ${data.error}`);
    } catch (error) {
      setResult('Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    setLoadingRepair(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/fix-images', { method: 'POST' });
      const data = await response.json();
      setResult(response.ok ? data.message : `Erreur: ${data.error}`);
    } catch (error) {
      setResult('Une erreur réseau est survenue.');
    } finally {
      setLoadingRepair(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Gestion des Contenus WordPress</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Synchronisation</h2>
          <p className="text-[#888] mb-6 text-sm">
            Récupère les 10 derniers articles publiés sur WordPress pour mettre à jour le site.
          </p>
          <button
            onClick={handleSync}
            disabled={loading || loadingRepair}
            className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
              loading 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-[#ec1a24] hover:bg-red-700 text-white'
            }`}
          >
            {loading ? 'Synchro en cours...' : '🚀 Lancer la synchro'}
          </button>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Réparation Images</h2>
          <p className="text-[#888] mb-6 text-sm">
            Scanne toute la base de données et reconnecte les images manquantes des anciens articles.
          </p>
          <button
            onClick={handleRepair}
            disabled={loading || loadingRepair}
            className={`w-full px-6 py-3 rounded-lg font-bold transition-all ${
              loadingRepair 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loadingRepair ? 'Réparation en cours...' : '🔧 Réparer TOUTES les images'}
          </button>
        </div>
      </div>

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
