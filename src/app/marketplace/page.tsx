import React from 'react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Boutique PDF - Le Débat Ivoirien',
  description: 'Téléchargez la version numérique du journal physique Le Débat Ivoirien.',
};

export default async function MarketplacePage() {
  const newspapers = await prisma.digitalNewspaper.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Boutique Numérique
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Achetez et téléchargez la version PDF de notre journal papier.
          </p>
        </div>

        {newspapers.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-lg">Aucun journal numérique n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {newspapers.map((paper) => (
              <Link href={`/marketplace/${paper.id}`} key={paper.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col cursor-pointer hover:-translate-y-1">
                <div className="relative h-80 w-full bg-gray-200 overflow-hidden">
                  {paper.coverImageUrl ? (
                    <img
                      src={paper.coverImageUrl}
                      alt={paper.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                      <span className="text-sm">Pas de couverture</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {paper.price} FCFA
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-xs font-semibold tracking-wide text-red-600 uppercase mb-2">
                    N° {paper.issueNumber || '-'} • {new Date(paper.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {paper.title}
                  </h3>
                  {paper.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {paper.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="w-full block text-center bg-red-600 group-hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200">
                      Acheter le PDF
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
