'use client';

import React, { useState } from 'react';

interface Newspaper {
  id: string;
  title: string;
  price: number;
}

export default function MarketplaceCheckoutClient({ newspaper }: { newspaper: Newspaper }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez renseigner votre adresse e-mail pour recevoir le lien de téléchargement.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/marketplace/payment/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newspaperId: newspaper.id,
          amount: newspaper.price,
          email,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'initialisation du paiement.");
      }

      if (data.data?.payment_url) {
        window.location.href = data.data.payment_url;
      } else {
        throw new Error("L'URL de paiement n'a pas été retournée.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-4 mt-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet (Optionnel)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
          placeholder="Jean Dupont"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Adresse e-mail <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
          placeholder="jean.dupont@exemple.com"
        />
        <p className="mt-2 text-xs text-gray-500">
          Nous utiliserons cette adresse pour vous envoyer le lien de téléchargement après votre achat.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Payer {newspaper.price} FCFA avec CinetPay</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </>
        )}
      </button>
      
      <div className="text-center mt-4 text-xs text-gray-500 flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Paiement sécurisé</span>
      </div>
    </form>
  );
}
