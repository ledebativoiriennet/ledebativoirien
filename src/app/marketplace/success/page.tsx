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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-lg w-full border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Merci pour votre achat !</h1>
        
        {isPending ? (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-6">
            Votre paiement est en cours de validation. Veuillez rafraîchir cette page dans quelques instants.
          </div>
        ) : (
          <p className="text-gray-600 mb-8">
            Votre paiement pour <strong>{purchase.digitalNewspaper.title}</strong> a été validé. 
            Vous pouvez télécharger votre PDF ci-dessous.
          </p>
        )}

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Produit</span>
            <span className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{purchase.digitalNewspaper.title}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">Montant</span>
            <span className="font-bold text-gray-900 text-sm">{purchase.amount} FCFA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Transaction</span>
            <span className="text-gray-500 text-xs font-mono">{purchase.transactionId}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          {!isPending && (
            <a 
              href={`/api/marketplace/download/${purchase.downloadToken}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Télécharger le PDF</span>
            </a>
          )}
          
          <Link 
            href="/marketplace" 
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 font-medium py-4 px-6 rounded-xl transition-all duration-200"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
