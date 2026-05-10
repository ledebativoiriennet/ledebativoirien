import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // CinetPay webhook sends data as x-www-form-urlencoded
    const formData = await request.formData();
    const cpm_trans_id = formData.get('cpm_trans_id') as string;
    const cpm_site_id = formData.get('cpm_site_id') as string;

    if (!cpm_trans_id || !cpm_site_id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    // Verify transaction status directly with CinetPay
    const verifyRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: cpm_trans_id
      })
    });

    const verifyData = await verifyRes.json();

    if (verifyData.code === "00" && verifyData.data.status === "ACCEPTED") {
      // Transaction successful!
      const customerEmail = verifyData.data.customer_email;
      console.log(`[CINETPAY] ✅ Paiement réussi pour : ${customerEmail} (TX: ${cpm_trans_id})`);

      // Activer l'abonnement dans Prisma
      if (customerEmail) {
        const user = await prisma.user.findUnique({ where: { email: customerEmail } });
        if (user) {
           // On détermine la durée via le montant (puisque le plan n'est pas renvoyé par CinetPay Check)
           const amount = verifyData.data.amount;
           let days = 30;
           let plan = 'Mensuel';
           if (amount === 200) { days = 1; plan = 'Quotidien'; }
           if (amount === 700) { days = 7; plan = 'Hebdo'; }
           if (amount === 1000) { days = 7; plan = 'Confidentiel Hebdo'; }
           if (amount === 2000) { days = 30; plan = 'Mensuel'; }
           if (amount === 3000) { days = 30; plan = 'Confidentiel Mensuel'; }
           if (amount === 20000) { days = 365; plan = 'Annuel'; }
           if (amount === 27000) { days = 365; plan = 'Ultimate Annuel'; }
           
           const endDate = new Date();
           endDate.setDate(endDate.getDate() + days);

           await prisma.subscription.create({
             data: {
               userId: user.id,
               plan: plan,
               status: 'ACTIVE',
               endDate: endDate
             }
           });
           
           if (user.role === 'USER') {
             let roleToSet = 'PREMIUM';
             if (plan.includes('Ultimate')) roleToSet = 'ULTIMATE';
             else if (plan.includes('Confidentiel')) roleToSet = 'CONFIDENTIEL';

             await prisma.user.update({
               where: { id: user.id },
               data: { role: roleToSet }
             });
           }
        }
      }
    } else {
      console.log(`[CINETPAY] ❌ Paiement échoué ou annulé pour TX: ${cpm_trans_id}`);
    }

    // Always return 200 OK to CinetPay to acknowledge receipt
    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
