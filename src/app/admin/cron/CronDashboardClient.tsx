"use client";

import React, { useState } from 'react';
import { executeCronJob } from '@/app/actions/cron';

type CronJob = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  icon: string;
  color: string;
};

const CRON_JOBS: CronJob[] = [
  {
    id: 'weather',
    name: 'Météo (Abidjan)',
    description: 'Synchronise les données météorologiques locales depuis l\'API météo.',
    endpoint: '/api/cron/weather',
    icon: '⛅',
    color: '#38bdf8'
  },
  {
    id: 'markets',
    name: 'Marchés Boursiers',
    description: 'Met à jour les cours de la BRVM et les taux de change.',
    endpoint: '/api/cron/update-markets',
    icon: '📈',
    color: '#10b981'
  },
  {
    id: 'rss',
    name: 'Flux RSS Internationaux',
    description: 'Importe les derniers articles depuis les flux RSS partenaires.',
    endpoint: '/api/cron/sync-international-rss',
    icon: '🌐',
    color: '#8b5cf6'
  },
  {
    id: 'sports',
    name: 'Résultats Sportifs',
    description: 'Met à jour les scores et classements sportifs récents.',
    endpoint: '/api/cron/sports-sync',
    icon: '⚽',
    color: '#f97316'
  },
  {
    id: 'gsc',
    name: 'Search Console',
    description: 'Synchronise les données SEO avec Google Search Console.',
    endpoint: '/api/cron/sync-search-console',
    icon: '🔍',
    color: '#eab308'
  },
  {
    id: 'newsletter',
    name: 'Envoi Newsletter',
    description: 'Prépare et envoie la newsletter quotidienne aux abonnés.',
    endpoint: '/api/cron/newsletter',
    icon: '✉️',
    color: '#ec4899'
  },
  {
    id: 'weekly',
    name: 'Digest Hebdomadaire',
    description: 'Génère le résumé des actualités de la semaine.',
    endpoint: '/api/cron/weekly-digest',
    icon: '📅',
    color: '#64748b'
  },
  {
    id: 'monthly',
    name: 'Digest Mensuel',
    description: 'Génère le résumé des actualités du mois complet.',
    endpoint: '/api/cron/monthly-digest',
    icon: '🗓️',
    color: '#475569'
  }
];

export default function CronDashboardClient() {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string; timestamp: Date }>>({});

  const handleRun = async (job: CronJob) => {
    if (running) return;
    
    if (!confirm(`Voulez-vous vraiment forcer l'exécution de "${job.name}" maintenant ?`)) {
      return;
    }

    setRunning(job.id);
    try {
      const res = await executeCronJob(job.endpoint);
      
      setResults(prev => ({
        ...prev,
        [job.id]: {
          success: res.success,
          message: res.success ? "Exécution réussie avec succès." : `Erreur: ${res.error}`,
          timestamp: new Date()
        }
      }));
    } catch (err: any) {
      setResults(prev => ({
        ...prev,
        [job.id]: {
          success: false,
          message: err.message || "Erreur réseau inconnue",
          timestamp: new Date()
        }
      }));
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {CRON_JOBS.map((job) => {
        const isRunning = running === job.id;
        const result = results[job.id];

        return (
          <div key={job.id} className="bg-[#111] border border-[#333] rounded-xl p-5 flex flex-col hover:border-[#555] transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: job.color }}></div>
            
            <div className="flex items-center gap-3 mb-3 mt-2">
              <span className="text-3xl" aria-hidden="true">{job.icon}</span>
              <h3 className="text-lg font-bold text-white leading-tight">{job.name}</h3>
            </div>
            
            <p className="text-[#888] text-sm mb-6 flex-grow">
              {job.description}
            </p>

            <div className="mt-auto">
              {result && (
                <div className={`mb-4 p-3 rounded text-xs font-medium border ${result.success ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{result.success ? '✓ Succès' : '✗ Échec'}</span>
                    <span className="opacity-70">{result.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="break-words opacity-90">{result.message}</div>
                </div>
              )}

              <button
                onClick={() => handleRun(job)}
                disabled={isRunning || running !== null}
                className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  isRunning 
                    ? 'bg-blue-600 text-white cursor-wait' 
                    : running !== null 
                      ? 'bg-[#222] text-[#555] cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-900/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exécution en cours...
                  </>
                ) : (
                  <>▶ Exécuter maintenant</>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
