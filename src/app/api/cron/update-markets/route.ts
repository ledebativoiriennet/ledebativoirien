import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function fetchYahoo(ticker: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`, { next: { revalidate: 0 } });
    const data = await res.json();
    const result = data.chart.result[0].meta;
    return {
      price: result.regularMarketPrice,
      prev: result.previousClose || result.chartPreviousClose
    };
  } catch (e) {
    console.error("Yahoo fetch error", ticker, e);
    return null;
  }
}

async function fetchCurrencies() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { next: { revalidate: 0 } });
    const data = await res.json();
    return data.rates;
  } catch (e) {
    console.error("Currency fetch error", e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const [gold, silver, cocoa, coffee, rates] = await Promise.all([
      fetchYahoo("GC=F"), // Or
      fetchYahoo("SI=F"), // Argent
      fetchYahoo("CC=F"), // Cacao Bourse
      fetchYahoo("KC=F"), // Café Bourse
      fetchCurrencies()
    ]);

    const updates = [];

    // METAUX 1: OR
    if (gold) {
      const trend = gold.price > gold.prev ? "UP" : gold.price < gold.prev ? "DOWN" : "FLAT";
      updates.push(prisma.marketIndicator.updateMany({
        where: { label: "Or (Once)" },
        data: { value: `${gold.price.toFixed(2)} $`, trend, dateLabel: new Date().toLocaleDateString("fr-FR") }
      }));
    }

    // METAUX 1: ARGENT
    if (silver) {
      const trend = silver.price > silver.prev ? "UP" : silver.price < silver.prev ? "DOWN" : "FLAT";
      updates.push(prisma.marketIndicator.updateMany({
        where: { label: "Argent" },
        data: { value: `${silver.price.toFixed(2)} $`, trend, dateLabel: new Date().toLocaleDateString("fr-FR") }
      }));
    }

    // MONNAIES
    if (rates && rates.XOF) {
      // USD to XOF
      const usdXof = rates.XOF;
      updates.push(prisma.marketIndicator.updateMany({
        where: { label: "USD / XOF" },
        data: { value: `${usdXof.toFixed(2)} FCFA`, dateLabel: new Date().toLocaleDateString("fr-FR") }
      }));

      // EUR is fixed
      updates.push(prisma.marketIndicator.updateMany({
        where: { label: "EUR / XOF" },
        data: { value: `655.957 FCFA`, trend: "FLAT", dateLabel: new Date().toLocaleDateString("fr-FR") }
      }));
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Marchés mis à jour" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
