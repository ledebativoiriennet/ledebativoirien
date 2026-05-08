import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function MarketplaceSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; transaction_id?: string }>;
}) {
  const { token, transaction_id } = await searchParams;

  let purchase = null;

  if (token) {
    purchase = await prisma.purchase.findUnique({
      where: { downloadToken: token },
      include: { digitalNewspaper: true }
    });
  } else if (transaction_id) {
    purchase = await prisma.purchase.findUnique({
      where: { transactionId: transaction_id },
      include: { digitalNewspaper: true }
    });
  }

  if (!purchase) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Achat introuvable</h1>
          <p className="text-gray-600 mb-6">Nous n'avons pas pu trouver les informations de votre achat.</p>
          <Link href="/marketplace" className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium inline-block">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const isPending = purchase.status === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 pb-20 px-4">
      <div className="max-w-xl w-full">
        {/* En-tête de confirmation épuré */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">C'est confirmé !</h1>
          <p className="text-gray-500 font-medium">Votre édition numérique est prête à être consultée.</p>
        </div>

        {/* Reçu de style Premium */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
          <div className="bg-gray-900 p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Détails de la transaction</p>
                <p className="text-sm font-mono text-gray-300">{purchase.transactionId}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm text-gray-300">{new Date(purchase.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <h2 className="text-xl font-bold mb-2">{purchase.digitalNewspaper.title}</h2>
              <p className="text-gray-400 text-sm">Édition numérique PDF Haute Définition</p>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Client</span>
                <span className="text-gray-900 font-bold">{purchase.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Statut du paiement</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {isPending ? 'En attente' : 'Validé'}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-900 font-extrabold text-lg">Total payé</span>
                <span className="text-gray-900 font-black text-2xl">{purchase.amount} FCFA</span>
              </div>
            </div>

            {isPending ? (
              <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl text-center">
                <div className="flex items-center justify-center space-x-2 text-yellow-800 font-bold mb-2">
                  <div className="w-4 h-4 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>Validation en cours...</span>
                </div>
                <p className="text-yellow-700 text-sm">Votre paiement est en cours de traitement. Le lien de téléchargement apparaîtra ici automatiquement d'ici quelques secondes.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-yellow-800 text-sm font-black underline decoration-2 underline-offset-4"
                >
                  Actualiser la page
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <a 
                  href={`/api/marketplace/download/${purchase.downloadToken}`}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg shadow-red-200 transform hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span className="text-lg">Télécharger mon journal</span>
                </a>
                <p className="text-center text-xs text-gray-400">
                  Un lien de secours a également été envoyé à <strong>{purchase.email}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/marketplace" 
            className="text-gray-500 hover:text-gray-900 font-bold text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Retour à la boutique</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
