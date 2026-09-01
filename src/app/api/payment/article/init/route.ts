import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GENIUSPAY_BASE_URL = 'https://geniuspay.ci/api/v1/merchant';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, email, name } = body;

    if (!articleId || !email) {
      return NextResponse.json({ error: "Données manquantes (articleId et email requis)." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    }

    // Génère un identifiant de transaction unique (préfixe ART- pour être reconnu par le webhook)
    const transactionId = `ART-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Crée ou remet en attente l'achat
    await prisma.articlePurchase.upsert({
      where: { userId_articleId: { userId: user.id, articleId: article.id } },
      create: {
        userId: user.id,
        articleId: article.id,
        amount: 250,
        status: 'PENDING',
        transactionId: transactionId,
      },
      update: {
        status: 'PENDING',
        transactionId: transactionId,
        amount: 250,
      },
    });

    const apiKey = process.env.GENIUSPAY_API_KEY;
    const apiSecret = process.env.GENIUSPAY_API_SECRET;

    // Simulation si clés absentes (développement)
    if (!apiKey || !apiSecret) {
      console.warn('⚠️ Clés GENIUSPAY absentes — simulation achat article.');
      await prisma.articlePurchase.update({
        where: { transactionId },
        data: { status: 'COMPLETED' },
      });
      return NextResponse.json({
        success: true,
        data: { payment_url: `/article/${article.slug}?success=purchase` },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${GENIUSPAY_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify({
        amount: 250,
        currency: 'XOF',
        description: `Achat article — ${article.title}`,
        customer: {
          name: name || user.name || 'Lecteur',
          email: email,
        },
        success_url: `${baseUrl}/article/${article.slug}?success=purchase`,
        error_url: `${baseUrl}/article/${article.slug}?error=purchase_failed`,
        metadata: {
          transaction_id: transactionId,
          type: 'article_purchase',
          article_id: article.id,
          user_id: user.id,
          customer_email: email,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[GENIUSPAY] Erreur init paiement article:', data);
      return NextResponse.json(
        { error: data?.error?.message || "Erreur lors de l'initialisation du paiement." },
        { status: 500 }
      );
    }

    const paymentUrl = data.data?.checkout_url || data.data?.payment_url;

    return NextResponse.json({
      success: true,
      data: { payment_url: paymentUrl, reference: data.data?.reference },
    });

  } catch (error) {
    console.error("Erreur initialisation paiement article:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
