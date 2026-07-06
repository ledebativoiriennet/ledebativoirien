import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GENIUSPAY_BASE_URL = 'https://geniuspay.ci/api/v1/merchant';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newspaperId, amount, email, name } = body;

    if (!newspaperId || !amount || !email) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const newspaper = await prisma.digitalNewspaper.findUnique({
      where: { id: newspaperId },
    });

    if (!newspaper) {
      return NextResponse.json({ error: 'Journal introuvable' }, { status: 404 });
    }

    const apiKey    = process.env.GENIUSPAY_API_KEY;
    const apiSecret = process.env.GENIUSPAY_API_SECRET;

    // Generate a unique transaction ID
    const transactionId = `PDF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Ensure the purchase is recorded in the database
    const purchase = await prisma.purchase.create({
      data: {
        digitalNewspaperId: newspaper.id,
        customerEmail: email,
        customerName: name || null,
        amount: newspaper.price,
        transactionId: transactionId,
        status: 'PENDING',
        paymentMethod: 'GENIUSPAY',
      },
    });

    // Si les clés GeniusPay sont absentes, on retourne une erreur.
    if (!apiKey || !apiSecret) {
      console.error('⚠️ Clés GENIUSPAY absentes.');
      return NextResponse.json(
        { error: "Le paiement en ligne n'est pas configuré. Veuillez utiliser l'option 'TRANSFERT DIRECT'." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Appel réel à l'API GeniusPay
    const response = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify({
        amount: newspaper.price,
        currency: 'XOF',
        description: `Achat PDF - ${newspaper.title}`,
        customer: {
          name: name || 'Lecteur',
          email: email,
        },
        success_url: `${baseUrl}/marketplace/success?token=${purchase.downloadToken}`,
        error_url: `${baseUrl}/marketplace?error=payment_failed`,
        metadata: {
          transaction_id: transactionId,
          newspaper_id: newspaper.id,
          customer_email: email,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[GENIUSPAY] Erreur init paiement marketplace:', data);
      return NextResponse.json(
        { error: data?.error?.message || "Erreur lors de l'initialisation du paiement." },
        { status: 500 }
      );
    }

    // Normaliser : GeniusPay retourne checkout_url ou payment_url
    const paymentUrl = data.data?.checkout_url || data.data?.payment_url;

    return NextResponse.json({
      success: true,
      data: {
        payment_url: paymentUrl,
        reference: data.data?.reference,
      },
    });
  } catch (error) {
    console.error("Erreur d'initialisation du paiement PDF:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
