import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function fetchYahoo(ticker: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`, { next: { revalidate: 0 } });
    const data = await res.json();
    const result = data.chart.result[0].meta;
    return {
      price: result.regularMarketPrice as number,
      prev: (result.previousClose || result.chartPreviousClose) as number
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
    return data.rates as Record<string, number>;
  } catch (e) {
    console.error("Currency fetch error", e);
    return null;
  }
}

async function upsertIndicator(label: string, group: string, value: string, numericValue: number, trend: string, extra?: string) {
  const existing = await prisma.marketIndicator.findFirst({ where: { label } });
  const dateLabel = new Date().toLocaleDateString("fr-FR");

  if (existing) {
    await prisma.marketIndicator.update({
      where: { id: existing.id },
      data: { value, trend, extraText: extra || existing.extraText, dateLabel }
    });

    // Record history (max one per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingHistory = await prisma.marketHistory.findFirst({
      where: { indicatorId: existing.id, date: { gte: today } }
    });
    if (!existingHistory) {
      await prisma.marketHistory.create({
        data: { indicatorId: existing.id, value: numericValue, date: new Date() }
      });
    }
  } else {
    // Auto-create indicator if missing
    await prisma.marketIndicator.create({
      data: { label, group, value, trend, extraText: extra || '', dateLabel, order: 0 }
    });
    console.log(`[CRON] Created new indicator: ${label} (${group})`);
  }
}

export async function GET(request: Request) {
  try {
    // 1. Vérification de la clé secrète pour la sécurité
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }

    const [gold, silver, cocoa, coffee, brent, wti, naturalGas, cotton, zinc, rates] = await Promise.all([
      fetchYahoo("GC=F"),  // Or
      fetchYahoo("SI=F"),  // Argent
      fetchYahoo("CC=F"),  // Cacao Bourse
      fetchYahoo("KC=F"),  // Café Bourse
      fetchYahoo("BZ=F"),  // Pétrole Brent
      fetchYahoo("CL=F"),  // Pétrole WTI
      fetchYahoo("NG=F"),  // Gaz Naturel
      fetchYahoo("CT=F"),  // Coton
      fetchYahoo("ZN=F"),  // Zinc
      fetchCurrencies()
    ]);

    // MÉTAUX: OR
    if (gold) {
      const trend = gold.price > gold.prev ? "UP" : gold.price < gold.prev ? "DOWN" : "FLAT";
      const varPct = ((gold.price - gold.prev) / gold.prev * 100).toFixed(2);
      await upsertIndicator("Or (Once)", "METAUX1", `${gold.price.toFixed(2)} $`, gold.price, trend, `${varPct}%`);
    }

    // MÉTAUX: ARGENT
    if (silver) {
      const trend = silver.price > silver.prev ? "UP" : silver.price < silver.prev ? "DOWN" : "FLAT";
      const varPct = ((silver.price - silver.prev) / silver.prev * 100).toFixed(2);
      await upsertIndicator("Argent", "METAUX1", `${silver.price.toFixed(2)} $`, silver.price, trend, `${varPct}%`);
    }

    // MÉTAUX: ZINC
    if (zinc) {
      const trend = zinc.price > zinc.prev ? "UP" : zinc.price < zinc.prev ? "DOWN" : "FLAT";
      const varPct = ((zinc.price - zinc.prev) / zinc.prev * 100).toFixed(2);
      await upsertIndicator("Zinc", "METAUX1", `${zinc.price.toFixed(2)} $`, zinc.price, trend, `${varPct}%`);
    }

    // CACAO
    if (cocoa) {
      const trend = cocoa.price > cocoa.prev ? "UP" : cocoa.price < cocoa.prev ? "DOWN" : "FLAT";
      const varPct = ((cocoa.price - cocoa.prev) / cocoa.prev * 100).toFixed(2);
      await upsertIndicator("Cacao (Bourse)", "CACAO", `${cocoa.price.toFixed(0)} $`, cocoa.price, trend, `${varPct}%`);
    }

    // CAFÉ
    if (coffee) {
      const trend = coffee.price > coffee.prev ? "UP" : coffee.price < coffee.prev ? "DOWN" : "FLAT";
      const varPct = ((coffee.price - coffee.prev) / coffee.prev * 100).toFixed(2);
      await upsertIndicator("Café (Bourse)", "CACAO", `${coffee.price.toFixed(2)} $`, coffee.price, trend, `${varPct}%`);
    }

    // COTON (Groupe ANACARDE/COTON par convention du projet)
    if (cotton) {
      const trend = cotton.price > cotton.prev ? "UP" : cotton.price < cotton.prev ? "DOWN" : "FLAT";
      const varPct = ((cotton.price - cotton.prev) / cotton.prev * 100).toFixed(2);
      await upsertIndicator("Coton", "ANACARDE", `${cotton.price.toFixed(2)} $`, cotton.price, trend, `${varPct}%`);
    }

    // ÉNERGIE: Pétrole Brent
    if (brent) {
      const trend = brent.price > brent.prev ? "UP" : brent.price < brent.prev ? "DOWN" : "FLAT";
      const varPct = ((brent.price - brent.prev) / brent.prev * 100).toFixed(2);
      await upsertIndicator("Pétrole Brent", "ENERGIE", `${brent.price.toFixed(2)} $`, brent.price, trend, `${varPct}%`);
    }

    // ÉNERGIE: Pétrole WTI
    if (wti) {
      const trend = wti.price > wti.prev ? "UP" : wti.price < wti.prev ? "DOWN" : "FLAT";
      const varPct = ((wti.price - wti.prev) / wti.prev * 100).toFixed(2);
      await upsertIndicator("Pétrole WTI", "ENERGIE", `${wti.price.toFixed(2)} $`, wti.price, trend, `${varPct}%`);
    }

    // ÉNERGIE: Gaz Naturel
    if (naturalGas) {
      const trend = naturalGas.price > naturalGas.prev ? "UP" : naturalGas.price < naturalGas.prev ? "DOWN" : "FLAT";
      const varPct = ((naturalGas.price - naturalGas.prev) / naturalGas.prev * 100).toFixed(2);
      await upsertIndicator("Gaz Naturel", "ENERGIE", `${naturalGas.price.toFixed(3)} $`, naturalGas.price, trend, `${varPct}%`);
    }

    // MONNAIES
    if (rates && rates.XOF) {
      const usdXof = rates.XOF;
      await upsertIndicator("USD / XOF", "MONNAIES", `${usdXof.toFixed(2)} FCFA`, usdXof, "FLAT");
      await upsertIndicator("EUR / XOF", "MONNAIES", `655.957 FCFA`, 655.957, "FLAT");
    }

    return NextResponse.json({
      success: true,
      message: "Marchés mis à jour : Or, Argent, Zinc, Cacao, Café, Coton, Énergie, Devises"
    });
  } catch (error: any) {
    console.error("[CRON ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
