import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac, timingSafeEqual } from 'crypto';

const GENIUSPAY_BASE_URL = 'https://geniuspay.ci/api/v1/merchant';

/**
 * Vérifie la signature HMAC-SHA256 du webhook GeniusPay.
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
    // GeniusPay webhooks envoient du JSON
    const rawBody = await request.text();
    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const webhookSecret = process.env.GENIUSPAY_WEBHOOK_SECRET;
    const signature = request.headers.get('X-Webhook-Signature') || '';
    const timestamp = request.headers.get('X-Webhook-Timestamp') || '';
    const event     = request.headers.get('X-Webhook-Event') || payload?.event || '';

    // Vérification de la signature (si le secret est configuré)
    if (webhookSecret && signature && timestamp) {
      if (!verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret)) {
        console.warn('[GENIUSPAY] ⚠️ Signature webhook marketplace invalide');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      // Protection replay attacks
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
        console.log(`[GENIUSPAY] ❌ Vérification marketplace échouée pour ref: ${reference}`);
        return NextResponse.json({ received: true });
      }
    }

    // Récupérer le transaction_id stocké dans les metadata
    const transactionId = (metadata.transaction_id || reference) as string;

    const purchase = await prisma.purchase.findUnique({
      where: { transactionId: transactionId },
    });

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' },
      });
      console.log(`[GENIUSPAY] ✅ Paiement marketplace validé — ref: ${reference}, tx: ${transactionId}`);
    } else {
      console.warn(`[GENIUSPAY] ⚠️ Achat introuvable pour transaction_id: ${transactionId}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[GENIUSPAY] Erreur webhook marketplace:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
