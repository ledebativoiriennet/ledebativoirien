import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MarketplaceCheckoutClient from './MarketplaceCheckoutClient';

export default async function NewspaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const newspaper = await prisma.digitalNewspaper.findUnique({
    where: { id }
  });

  if (!newspaper || !newspaper.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/marketplace" className="text-red-600 hover:text-red-800 flex items-center space-x-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Retour à la boutique</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-100 relative min-h-[400px]">
            {newspaper.coverImageUrl ? (
              <Image
                src={newspaper.coverImageUrl}
                alt={newspaper.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span className="text-lg">Aucune couverture disponible</span>
              </div>
            )}
            <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow">
              PDF Numérique
            </div>
          </div>
          
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-sm font-semibold tracking-wide text-red-600 uppercase mb-2">
              N° {newspaper.issueNumber || '-'} • Paru le {new Date(newspaper.publishedAt).toLocaleDateString('fr-FR')}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              {newspaper.title}
            </h1>
            
            <div className="prose prose-sm text-gray-600 mb-8">
              {newspaper.description ? (
                <p>{newspaper.description}</p>
              ) : (
                <p>Achetez la version numérique complète de ce numéro pour le lire sur votre ordinateur, tablette ou smartphone.</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-auto">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <span className="text-gray-600 font-medium">Prix du PDF</span>
                <span className="text-2xl font-bold text-gray-900">{newspaper.price} FCFA</span>
              </div>
              
              <MarketplaceCheckoutClient 
                newspaper={{
                  id: newspaper.id,
                  title: newspaper.title,
                  price: newspaper.price
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
