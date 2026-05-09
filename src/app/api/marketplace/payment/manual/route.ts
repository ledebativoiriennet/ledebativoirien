import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newspaperId, amount, email, name, transactionRef } = body;

    if (!newspaperId || !email || !transactionRef) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // 1. Créer un enregistrement de achat en attente
    const purchase = await prisma.purchase.create({
      data: {
        digitalNewspaperId: newspaperId,
        amount: parseFloat(amount),
        customerEmail: email,
        customerName: name || 'Client Anonyme',
        status: 'PENDING', // Statut initial en attente de validation
        paymentMethod: 'MANUAL_TRANSFER',
        transactionId: transactionRef, // On stocke la référence SMS ici
      },
    });

    // 2. Ici, on pourrait envoyer un mail à l'admin pour le prévenir
    // Pour la démo opérationnelle, on peut imaginer un système de validation rapide
    
    return NextResponse.json({ 
      success: true, 
      purchaseId: purchase.id,
      message: 'Demande de paiement manuel enregistrée avec succès' 
    });

  } catch (error: any) {
    console.error('Manual payment error:', error);
    return NextResponse.json({ error: 'Erreur lors du traitement du paiement manuel' }, { status: 500 });
  }
}
