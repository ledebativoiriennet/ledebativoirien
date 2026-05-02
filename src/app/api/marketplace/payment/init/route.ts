import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { newspaperId, amount, email, name } = body;

    if (!newspaperId || !amount || !email) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const newspaper = await prisma.digitalNewspaper.findUnique({
      where: { id: newspaperId }
    });

    if (!newspaper) {
      return NextResponse.json({ error: "Journal introuvable" }, { status: 404 });
    }

    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

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
        paymentMethod: 'CINETPAY',
      }
    });

    // Mock response if API keys are missing (for local testing without keys)
    if (!apiKey || !siteId) {
      console.warn("⚠️ Clés CINETPAY absentes. Redirection simulée pour achat PDF.");
      
      // Simulate success update
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' }
      });

      return NextResponse.json({
        code: "201",
        message: "CREATED",
        data: {
          payment_url: `/marketplace/success?token=${purchase.downloadToken}`,
        }
      });
    }

    // Appel réel à l'API CinetPay
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
        amount: newspaper.price,
        currency: "XOF",
        channels: "ALL",
        description: `Achat PDF - ${newspaper.title}`,
        customer_name: name || "Lecteur",
        customer_surname: "LDI",
        customer_email: email,
        customer_phone_number: "0000000000",
        customer_address: "Abidjan",
        customer_city: "Abidjan",
        customer_country: "CI",
        customer_state: "CI",
        customer_zip_code: "00225",
        notify_url: `${baseUrl}/api/marketplace/payment/webhook`,
        return_url: `${baseUrl}/marketplace/success?token=${purchase.downloadToken}`,
      })
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erreur d'initialisation du paiement PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
