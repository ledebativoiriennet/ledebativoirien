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

    // Helper to update and record history
    async function updateIndicator(label: string, value: string, numericValue: number, trend: string, extra?: string) {
      const indicator = await prisma.marketIndicator.findFirst({ where: { label } });
      if (indicator) {
        await prisma.marketIndicator.update({
          where: { id: indicator.id },
          data: { 
            value, 
            trend, 
            extraText: extra || indicator.extraText,
            dateLabel: new Date().toLocaleDateString("fr-FR") 
          }
        });

        // Record history (max one per day per indicator to avoid bloat)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingHistory = await prisma.marketHistory.findFirst({
          where: {
            indicatorId: indicator.id,
            date: { gte: today }
          }
        });

        if (!existingHistory) {
          await prisma.marketHistory.create({
            data: {
              indicatorId: indicator.id,
              value: numericValue,
              date: new Date()
            }
          });
        }
      }
    }

    // METAUX 1: OR
    if (gold) {
      const trend = gold.price > gold.prev ? "UP" : gold.price < gold.prev ? "DOWN" : "FLAT";
      const varPct = ((gold.price - gold.prev) / gold.prev * 100).toFixed(2);
      await updateIndicator("Or (Once)", `${gold.price.toFixed(2)} $`, gold.price, trend, `${varPct}%`);
    }

    // METAUX 1: ARGENT
    if (silver) {
      const trend = silver.price > silver.prev ? "UP" : silver.price < silver.prev ? "DOWN" : "FLAT";
      const varPct = ((silver.price - silver.prev) / silver.prev * 100).toFixed(2);
      await updateIndicator("Argent", `${silver.price.toFixed(2)} $`, silver.price, trend, `${varPct}%`);
    }

    // CACAO
    if (cocoa) {
      const trend = cocoa.price > cocoa.prev ? "UP" : cocoa.price < cocoa.prev ? "DOWN" : "FLAT";
      const varPct = ((cocoa.price - cocoa.prev) / cocoa.prev * 100).toFixed(2);
      await updateIndicator("Cacao (Bourse)", `${cocoa.price.toFixed(0)} $`, cocoa.price, trend, `${varPct}%`);
    }

    // MONNAIES
    if (rates && rates.XOF) {
      const usdXof = rates.XOF;
      await updateIndicator("USD / XOF", `${usdXof.toFixed(2)} FCFA`, usdXof, "FLAT");
      await updateIndicator("EUR / XOF", `655.957 FCFA`, 655.957, "FLAT");
    }

    return NextResponse.json({ success: true, message: "Marchés mis à jour" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
