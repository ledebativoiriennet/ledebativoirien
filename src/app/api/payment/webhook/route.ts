import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac, timingSafeEqual } from 'crypto';

const GENIUSPAY_BASE_URL = 'https://geniuspay.ci/api/v1/merchant';

/**
 * Vérifie la signature HMAC-SHA256 du webhook GeniusPay.
 * Format : HMAC-SHA256(timestamp + "." + raw_body, webhook_secret)
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  try {
    const data = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret).update(data).digest('hex');
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // GeniusPay webhooks envoient du JSON (application/json)
    const rawBody = await request.text();
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET;
    const signature  = request.headers.get('X-Webhook-Signature') || '';
    const timestamp  = request.headers.get('X-Webhook-Timestamp') || '';
    const event      = request.headers.get('X-Webhook-Event') || payload?.event || '';

    // Vérification de la signature (si le secret est configuré)
    if (webhookSecret && signature && timestamp) {
      if (!verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret)) {
        console.warn('[GENIUSPAY] ⚠️ Signature webhook invalide');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      // Protection contre les replay attacks (5 minutes)
      if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
        return NextResponse.json({ error: 'Timestamp too old' }, { status: 400 });
      }
    }

    // On ne traite que l'événement payment.success
    if (event !== 'payment.success') {
      return NextResponse.json({ received: true, event });
    }

    const txData    = payload?.data;
    const reference = txData?.reference as string | undefined;
    const status    = txData?.status as string | undefined;
    const metadata  = txData?.metadata || {};

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // Double-vérification via l'API GeniusPay
    const apiKey    = process.env.GENIUSPAY_API_KEY;
    const apiSecret = process.env.GENIUSPAY_API_SECRET;

    if (apiKey && apiSecret) {
      const verifyRes = await fetch(`${GENIUSPAY_BASE_URL}/payments/${reference}`, {
        headers: {
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success || verifyData.data?.status !== 'completed') {
        console.log(`[GENIUSPAY] ❌ Vérification échouée pour ref: ${reference}`);
        return NextResponse.json({ received: true });
      }
    }

    // Récupérer le transaction_id stocké dans les metadata
    const transactionId = (metadata.transaction_id || reference) as string;
    const customerEmail = (metadata.customer_email || txData?.customer_email || '') as string;

    console.log(`[GENIUSPAY] ✅ Paiement réussi — ref: ${reference}, email: ${customerEmail}`);

    // Si c'est un achat d'article d'archive individuel
    if (transactionId.startsWith('ART-') || metadata.type === 'archive_purchase') {
      const pendingArtPurchase = await prisma.articlePurchase.findUnique({
        where: { transactionId: transactionId }
      });
      if (pendingArtPurchase) {
        await prisma.articlePurchase.update({
          where: { id: pendingArtPurchase.id },
          data: { status: 'COMPLETED' }
        });
        console.log(`[GENIUSPAY] ✅ Achat d'article d'archive validé — ref: ${reference}, tx: ${transactionId}`);
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Activer l'abonnement dans Prisma
    const pendingSub = await prisma.subscription.findUnique({
      where: { transactionId: transactionId },
    });

    if (pendingSub) {
      if (pendingSub.status === 'PENDING') {
        let days = 30;
        const plan = pendingSub.plan;
        if (plan.includes('Quotidien')) days = 1;
        if (plan.includes('Hebdo') || plan.includes('Hebdomadaire')) days = 7;
        if (plan.includes('Annuel')) days = 365;

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        await prisma.subscription.update({
          where: { id: pendingSub.id },
          data: { status: 'ACTIVE', endDate: endDate },
        });

        const user = await prisma.user.findUnique({ where: { id: pendingSub.userId } });
        if (user && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          let roleToSet = 'PREMIUM';
          if (plan.includes('Ultimate') || plan.includes('Annuel')) roleToSet = 'ULTIMATE';
          else if (plan.includes('Confidentiel')) roleToSet = 'CONFIDENTIEL';

          await prisma.user.update({
            where: { id: user.id },
            data: { role: roleToSet },
          });
        }
      } else {
        console.log(`[GENIUSPAY] ⚠️ Transaction déjà traitée (ref: ${reference})`);
      }
    } else if (customerEmail) {
      // Rétrocompatibilité : pas de pendingSub trouvé → on cherche via email
      const user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (user) {
        const amount = txData?.amount as number;
        let days = 30;
        let plan = 'Mensuel';
        
        const metadataPlan = metadata.plan || '';

        if (amount === 2000) {
          days = 7;
          plan = 'Hebdomadaire';
        } else if (amount === 5000) {
          days = 30;
          plan = metadataPlan.includes('Confidentiel') ? 'Confidentiel' : 'Mensuel';
        } else if (amount === 25000) {
          days = 365;
          plan = 'Annuel';
        } else {
          // Fallback anciens montants
          if (amount === 200)   { days = 1;   plan = 'Quotidien'; }
          if (amount === 700)   { days = 7;   plan = 'Hebdo'; }
          if (amount === 1000)  { days = 7;   plan = 'Confidentiel Hebdo'; }
          if (amount === 3000)  { days = 30;  plan = 'Confidentiel Mensuel'; }
          if (amount === 20000) { days = 365; plan = 'Annuel'; }
          if (amount === 27000) { days = 365; plan = 'Ultimate Annuel'; }
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: plan,
            status: 'ACTIVE',
            endDate: endDate,
            transactionId: transactionId,
          },
        });

        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          let roleToSet = 'PREMIUM';
          if (plan.includes('Ultimate') || plan.includes('Annuel')) roleToSet = 'ULTIMATE';
          else if (plan.includes('Confidentiel')) roleToSet = 'CONFIDENTIEL';

          await prisma.user.update({
            where: { id: user.id },
            data: { role: roleToSet },
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[GENIUSPAY] Erreur webhook abonnement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
