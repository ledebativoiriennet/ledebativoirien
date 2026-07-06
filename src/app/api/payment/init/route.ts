import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GENIUSPAY_BASE_URL = 'https://geniuspay.ci/api/v1/merchant';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, amount, email, name } = body;

    const apiKey    = process.env.GENIUSPAY_API_KEY;
    const apiSecret = process.env.GENIUSPAY_API_SECRET;

    // Generate a unique transaction ID
    const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: plan || 'Mensuel',
            status: 'PENDING',
            transactionId: transactionId,
          },
        });
      }
    }

    // Mock response if API keys are missing (for local testing without keys)
    if (!apiKey || !apiSecret) {
      console.warn('⚠️ Clés GENIUSPAY absentes dans le fichier .env. Redirection simulée.');

      // -- DEBUT MOCK ACTIVATION DB --
      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          let days = 30; // Mensuel
          if (plan.includes('Quotidien')) days = 1;
          if (plan.includes('Hebdo')) days = 7;
          if (plan.includes('Annuel')) days = 365;

          const endDate = new Date();
          endDate.setDate(endDate.getDate() + days);

          await prisma.subscription.update({
            where: { transactionId: transactionId },
            data: {
              status: 'ACTIVE',
              endDate: endDate,
            },
          });

          if (user.role === 'USER') {
            let roleToSet = 'PREMIUM';
            if (plan.includes('Ultimate')) roleToSet = 'ULTIMATE';
            else if (plan.includes('Confidentiel')) roleToSet = 'CONFIDENTIEL';

            await prisma.user.update({
              where: { id: user.id },
              data: { role: roleToSet },
            });
          }
        }
      }
      // -- FIN MOCK ACTIVATION DB --

      return NextResponse.json({
        success: true,
        data: {
          payment_url: `/abonnement?success=true&transaction_id=${transactionId}`,
        },
      });
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
        amount: amount,
        currency: 'XOF',
        description: `Abonnement ${plan} - Le Débat Ivoirien`,
        customer: {
          name: name || 'Abonné',
          email: email || 'contact@ledebativoirien.net',
        },
        success_url: `${baseUrl}/abonnement?success=true`,
        error_url: `${baseUrl}/abonnement?error=true`,
        metadata: {
          transaction_id: transactionId,
          plan: plan,
          customer_email: email,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[GENIUSPAY] Erreur init paiement:', data);
      return NextResponse.json(
        { error: data?.error?.message || "Erreur lors de l'initialisation du paiement." },
        { status: 500 }
      );
    }

    // Normaliser la réponse : GeniusPay retourne checkout_url ou payment_url
    const paymentUrl = data.data?.checkout_url || data.data?.payment_url;

    return NextResponse.json({
      success: true,
      data: {
        payment_url: paymentUrl,
        reference: data.data?.reference,
      },
    });
  } catch (error) {
    console.error("Erreur d'initialisation du paiement:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
