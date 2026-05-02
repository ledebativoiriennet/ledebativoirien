import React from 'react';
import NewspaperFormClient from './NewspaperFormClient';

export const metadata = {
  title: 'Admin - Ajouter un Journal PDF',
};

export default function NewMarketplacePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Ajouter un Journal Numérique</h1>
        <p className="text-[#888]">
          Remplissez les informations ci-dessous pour ajouter un nouveau journal PDF à la boutique.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        <NewspaperFormClient />
      </div>
    </div>
  );
}
