import React from 'react';
import { prisma } from '@/lib/prisma';
import SalesValidationClient from './SalesValidationClient';

export const metadata = {
  title: 'Admin - Validation des Ventes PDF',
};

export default async function AdminSalesPage() {
  // Récupérer les achats manuels en attente et terminés
  const purchases = await prisma.purchase.findMany({
    where: {
      paymentMethod: 'MANUAL_TRANSFER'
    },
    include: {
      digitalNewspaper: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Validation des Paiements Manuels</h1>
        <p className="text-[#888] text-sm">Vérifiez les références SMS et validez pour débloquer les PDF.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#222] border-b border-[#333] text-[#888] text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Journal</th>
              <th className="p-4 font-medium">Référence SMS</th>
              <th className="p-4 font-medium">Montant</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#888]">
                  Aucune transaction manuelle trouvée.
                </td>
              </tr>
            ) : (
              purchases.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#222] transition-colors">
                  <td className="p-4 text-sm text-[#888]">
                    {new Date(sale.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{sale.customerName}</div>
                    <div className="text-xs text-[#888]">{sale.customerEmail}</div>
                  </td>
                  <td className="p-4 text-sm text-white">
                    {sale.digitalNewspaper.title}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[#ec1a24] bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                      {sale.transactionId}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white font-bold">
                    {sale.amount} FCFA
                  </td>
                  <td className="p-4">
                    {sale.status === 'COMPLETED' ? (
                      <span className="bg-green-900 text-green-300 text-[10px] px-2 py-1 rounded-full uppercase font-bold">Validé</span>
                    ) : (
                      <span className="bg-yellow-900 text-yellow-300 text-[10px] px-2 py-1 rounded-full uppercase font-bold">En attente</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {sale.status === 'PENDING' && (
                      <SalesValidationClient saleId={sale.id} />
                    )}
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
