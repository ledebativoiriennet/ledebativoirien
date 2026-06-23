import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, amount, email, name } = body;

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

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
             transactionId: transactionId
           }
         });
      }
    }

    // Mock response if API keys are missing (for local testing without keys)
    if (!apiKey || !siteId) {
      console.warn("⚠️ Clés CINETPAY absentes dans le fichier .env. Redirection simulée.");
      
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
      // -- FIN MOCK ACTIVATION DB --

      return NextResponse.json({
        code: "201",
        message: "CREATED",
        data: {
          payment_url: `/abonnement?success=true&transaction_id=${transactionId}`,
        }
      });
    }

    // Appel réel à l'API CinetPay
    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
        amount: amount,
        currency: "XOF",
        channels: "ALL",
        description: `Abonnement Premium ${plan} - Le Débat Ivoirien`,
        customer_name: name || "Abonné",
        customer_surname: "LDI",
        customer_email: email || "contact@ledebativoirien.net",
        customer_phone_number: "0000000000",
        customer_address: "Abidjan",
        customer_city: "Abidjan",
        customer_country: "CI",
        customer_state: "CI",
        customer_zip_code: "00225",
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/webhook`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/abonnement?success=true`,
      })
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur d'initialisation du paiement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
