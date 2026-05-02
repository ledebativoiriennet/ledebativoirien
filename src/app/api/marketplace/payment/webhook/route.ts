import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cpm_trans_id = formData.get('cpm_trans_id');

    if (!cpm_trans_id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    // Check with CinetPay API
    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: cpm_trans_id
      })
    });

    const data = await response.json();

    if (data.code === '00' && data.data.status === 'ACCEPTED') {
      // Payment accepted
      const purchase = await prisma.purchase.findUnique({
        where: { transactionId: cpm_trans_id as string }
      });

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'COMPLETED' }
        });
        
        console.log(`Paiement marketplace validé pour: ${cpm_trans_id}`);
      }
    } else {
      // Payment failed
      const purchase = await prisma.purchase.findUnique({
        where: { transactionId: cpm_trans_id as string }
      });

      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'FAILED' }
        });
      }
      console.log(`Paiement marketplace échoué ou en attente: ${cpm_trans_id}`);
    }

    return NextResponse.json({ message: "Webhook reçu" });
  } catch (error) {
    console.error("Erreur Webhook marketplace CinetPay:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
