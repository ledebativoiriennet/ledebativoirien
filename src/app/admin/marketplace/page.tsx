import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
  title: 'Admin - Marketplace PDF',
};

export default async function AdminMarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestion des Journaux PDF</h1>
        <div className="flex gap-4">
          <Link 
            href="/admin/marketplace/ventes" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Gérer les ventes
          </Link>
          <Link 
            href="/admin/marketplace/nouveau" 
            className="bg-[#ec1a24] hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Ajouter un PDF
          </Link>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#222] border-b border-[#333] text-[#888] text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Titre & Numéro</th>
              <th className="p-4 font-medium">Prix</th>
              <th className="p-4 font-medium">Date de parution</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {newspapers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-[#888]">
                  Aucun journal PDF trouvé. Cliquez sur "Ajouter un PDF" pour commencer.
                </td>
              </tr>
            ) : (
              newspapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-[#222] transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{paper.title}</div>
                    <div className="text-sm text-[#888]">Numéro {paper.issueNumber || '-'}</div>
                  </td>
                  <td className="p-4 text-white">
                    {paper.price} FCFA
                  </td>
                  <td className="p-4 text-[#888]">
                    {new Date(paper.publishedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    {paper.isActive ? (
                      <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full border border-green-800">
                        Actif
                      </span>
                    ) : (
                      <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full border border-red-800">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/marketplace/${paper.id}`}
                      className="text-[#ec1a24] hover:text-red-400 text-sm font-medium"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
