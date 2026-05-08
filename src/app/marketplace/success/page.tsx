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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-3xl text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Achat introuvable</h1>
          <p className="text-zinc-500 mb-8">Nous n'avons pas pu trouver les informations de votre achat. Veuillez contacter le support si le problème persiste.</p>
          <Link href="/marketplace" className="w-full bg-white text-black px-8 py-4 rounded-2xl font-black transition-all hover:bg-zinc-200 inline-block">
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const isPending = purchase.status === 'PENDING';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center pt-24 pb-24 px-4 overflow-hidden relative">
      {/* Éléments de décorations abstraits */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-in zoom-in duration-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Excellent choix.</h1>
          <p className="text-zinc-500 font-medium text-lg">Votre édition est prête pour une lecture haute fidélité.</p>
        </div>

        {/* Reçu Ultra-Premium */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-10 transition-all hover:border-zinc-700">
          {/* Header du reçu */}
          <div className="p-10 border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Transaction ID</p>
                <p className="text-xs font-mono text-zinc-400">{purchase.transactionId}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Date d'achat</p>
                <p className="text-xs text-zinc-400 font-bold">{new Date(purchase.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">Digital Edition</span>
              <h2 className="text-3xl font-black text-white leading-none tracking-tight">{purchase.digitalNewspaper.title}</h2>
            </div>
          </div>

          {/* Corps du reçu */}
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Destinataire</p>
                <p className="text-white font-bold text-sm truncate">{purchase.customerEmail}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Format</p>
                <p className="text-white font-bold text-sm">PDF Haute Définition</p>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">Montant Total</p>
                <p className="text-zinc-400 text-xs font-medium italic">Paiement sécurisé via CinetPay</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white tracking-tighter">{purchase.amount} <span className="text-sm text-zinc-600">FCFA</span></p>
              </div>
            </div>

            {/* Bouton de téléchargement Call-to-Action */}
            <div className="pt-6">
              {isPending ? (
                <div className="bg-zinc-800/50 p-8 rounded-3xl text-center border border-dashed border-zinc-700">
                  <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-bold mb-1">Finalisation en cours...</p>
                  <p className="text-zinc-500 text-xs">Nous préparons votre fichier. Cela ne prend que quelques secondes.</p>
                </div>
              ) : (
                <a 
                  href={`/api/marketplace/download/${purchase.downloadToken}`}
                  className="group relative w-full bg-white text-black font-black py-6 px-8 rounded-3xl transition-all duration-500 flex items-center justify-between overflow-hidden hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  <div className="absolute inset-0 bg-zinc-200 translate-y-full transition-transform duration-500 group-hover:translate-y-0"></div>
                  <span className="relative z-10 text-xl tracking-tight">Télécharger le PDF</span>
                  <div className="relative z-10 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <Link 
            href="/marketplace" 
            className="group text-zinc-500 hover:text-white font-black text-xs uppercase tracking-[0.3em] flex items-center space-x-4 transition-all"
          >
            <span className="w-8 h-[1px] bg-zinc-800 group-hover:w-12 group-hover:bg-white transition-all"></span>
            <span>Continuer mes achats</span>
          </Link>
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Le Débat Ivoirien • Kiosque Numérique</p>
        </div>
      </div>
    </div>
  );
}
