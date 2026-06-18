import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Admin - Marketplace PDF',
};

export default async function AdminMarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#111] p-6 rounded-xl border border-[#333] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">📰</span> Kiosque Numérique
          </h1>
          <p className="text-[#888] mt-2 text-sm">
            Gérez les journaux PDF en vente sur la plateforme.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/admin/marketplace/ventes" 
            className="bg-[#1a1a1a] border border-[#444] hover:bg-[#222] text-white px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <span>💰</span> Historique des ventes
          </Link>
          <Link 
            href="/admin/marketplace/nouveau" 
            className="bg-[#ec1a24] hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(236,26,36,0.3)] hover:shadow-[0_0_25px_rgba(236,26,36,0.5)] flex items-center gap-2"
          >
            <span>+</span> Ajouter un Journal
          </Link>
        </div>
      </div>

      {newspapers.length === 0 ? (
        <div className="bg-[#111] border border-[#333] rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-6xl mb-4 opacity-50">📭</span>
          <h3 className="text-xl font-bold text-white mb-2">Aucun journal disponible</h3>
          <p className="text-[#888] mb-6 max-w-md">
            Votre kiosque est vide. Commencez par uploader votre premier journal PDF pour le proposer à vos lecteurs.
          </p>
          <Link 
            href="/admin/marketplace/nouveau" 
            className="bg-[#ec1a24] hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Ajouter mon premier journal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newspapers.map((paper) => (
            <div key={paper.id} className="group bg-[#111] border border-[#333] rounded-xl overflow-hidden hover:border-[#ec1a24] transition-all duration-300 shadow-lg flex flex-col">
              
              {/* Cover Image Area */}
              <div className="relative aspect-[3/4] bg-[#1a1a1a] w-full overflow-hidden border-b border-[#333]">
                {paper.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={paper.coverImageUrl} 
                    alt={`Couverture ${paper.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#444]">
                    <span className="text-5xl mb-2">📄</span>
                    <span className="text-xs uppercase font-bold tracking-widest">Pas de couverture</span>
                  </div>
                )}
                
                {/* Status Badge Overlays */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {paper.isActive ? (
                    <span className="bg-green-600/90 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-md">
                      En ligne
                    </span>
                  ) : (
                    <span className="bg-orange-600/90 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-md">
                      Brouillon
                    </span>
                  )}
                </div>

                {/* Price Overlay */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-[#ec1a24] font-black px-3 py-1.5 rounded-lg border border-[#333] shadow-lg">
                  {paper.price} FCFA
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs text-[#888] font-medium uppercase tracking-wider">
                    {paper.issueNumber ? `N° ${paper.issueNumber}` : 'Hors-série'}
                  </div>
                  <div className="text-xs text-[#666]">
                    {new Date(paper.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2" title={paper.title}>
                  {paper.title}
                </h3>
                
                {paper.description && (
                  <p className="text-sm text-[#888] line-clamp-2 mb-4 flex-1">
                    {paper.description}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-[#333] flex gap-2">
                  <Link 
                    href={`/admin/marketplace/${paper.id}`}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#ec1a24] border border-[#333] hover:border-[#ec1a24] text-white text-center py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    ✏️ Modifier
                  </Link>
                  <a 
                    href={paper.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-[#aaa] hover:text-white rounded-lg transition-all"
                    title="Voir le PDF"
                  >
                    👁️
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
