import React from 'react';
import CronDashboardClient from './CronDashboardClient';

export const metadata = {
  title: 'Admin - Tâches Planifiées (Cron)',
};

export default function AdminCronPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#111] p-6 rounded-xl border border-[#333] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">⏱️</span> Tâches Planifiées (Cron)
          </h1>
          <p className="text-[#888] mt-2 text-sm max-w-2xl">
            Ce tableau de bord vous permet de visualiser et de déclencher manuellement les tâches automatisées en arrière-plan.
            En production, ces tâches sont exécutées automatiquement selon les fréquences définies.
          </p>
        </div>
      </div>

      <CronDashboardClient />
    </div>
  );
}
