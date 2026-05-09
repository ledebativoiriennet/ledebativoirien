import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { saleId } = await request.json();

    if (!saleId) {
      return NextResponse.json({ error: 'ID de vente manquant' }, { status: 400 });
    }

    // Mettre à jour l'achat
    const purchase = await prisma.purchase.update({
      where: { id: saleId },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date(),
      },
      include: {
        digitalNewspaper: true
      }
    });

    // Note : Ici on pourrait envoyer un mail automatique au client avec son lien
    // Le lien est : [SiteURL]/marketplace/success?token=[purchase.downloadToken]
    console.log(`Paiement validé pour ${purchase.customerEmail}. Jeton : ${purchase.downloadToken}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Vente validée avec succès' 
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 });
  }
}
