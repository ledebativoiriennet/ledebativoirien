import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sécurité : token optionnel
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toLocaleDateString('fr-FR');
  const results: string[] = [];

  // --- Helper : fetch Yahoo Finance ---
  async function fetchYahoo(ticker: string) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`,
        { cache: 'no-store' }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const meta = data.chart.result[0].meta;
      return {
        price: meta.regularMarketPrice as number,
        prev: (meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice) as number,
      };
    } catch {
      return null;
    }
  }

  // --- Helper : fetch devises ---
  async function fetchRates() {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.rates as Record<string, number>;
    } catch {
      return null;
    }
  }

  // --- Helper : update DB ---
  async function updateIndicator(id: string, value: string, trend: string) {
    await prisma.marketIndicator.updateMany({
      where: { id },
      data: { value, trend, dateLabel: today },
    });
    results.push(`✓ ${id} → ${value}`);
  }

  // Fetch toutes les données en parallèle
  const [cocoa, coffee, brent, cotton, gas, gold, silver, aluminium, zinc, rates] = await Promise.all([
    fetchYahoo('CC=F'),   // Cacao
    fetchYahoo('KC=F'),   // Café
    fetchYahoo('BZ=F'),   // Pétrole Brent
    fetchYahoo('CT=F'),   // Coton
    fetchYahoo('NG=F'),   // Gaz Naturel
    fetchYahoo('GC=F'),   // Or
    fetchYahoo('SI=F'),   // Argent
    fetchYahoo('ALI=F'),  // Aluminium
    fetchYahoo('ZN=F'),   // Zinc
    fetchRates(),          // Devises
  ]);

  const getTrend = (price: number, prev: number) =>
    price > prev ? 'UP' : price < prev ? 'DOWN' : 'FLAT';

  // Taux de change USD/XOF
  const xofRate = rates?.XOF || 600; // Fallback à 600 si l'API échoue

  // Récupérer tous les indicateurs en DB
  const indicators = await prisma.marketIndicator.findMany();

  for (const ind of indicators) {
    if (ind.label === 'Cacao' && cocoa) {
      const priceCFA = cocoa.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / MT`, getTrend(cocoa.price, cocoa.prev));
    }
    if (ind.label === 'Café' && coffee) {
      const priceCFA = (coffee.price / 100) * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / lb`, getTrend(coffee.price, coffee.prev));
    }
    if (ind.label === 'Pétrole Brent' && brent) {
      const priceCFA = brent.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / b`, getTrend(brent.price, brent.prev));
    }
    if (ind.label === 'Coton' && cotton) {
      const priceCFA = (cotton.price / 100) * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / lb`, getTrend(cotton.price, cotton.prev));
    }
    if (ind.label === 'Gaz Naturel' && gas) {
      const priceCFA = gas.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / MMBtu`, getTrend(gas.price, gas.prev));
    }
    if (ind.label === 'Or' && gold) {
      const priceCFA = gold.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA / once`, getTrend(gold.price, gold.prev));
    }
    if (ind.label === 'Zinc' && zinc) {
      const priceCFA = zinc.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`, getTrend(zinc.price, zinc.prev));
    }
    if (ind.label === 'Argent' && silver) {
      const priceCFA = silver.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} FCFA`, getTrend(silver.price, silver.prev));
    }
    if (ind.label === 'Aluminium' && aluminium) {
      const priceCFA = aluminium.price * xofRate;
      await updateIndicator(ind.id, `${priceCFA.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`, getTrend(aluminium.price, aluminium.prev));
    }
    if (ind.label === 'USD / XOF' && rates?.XOF) {
      await updateIndicator(ind.id, `${rates.XOF.toFixed(2)} FCFA`, 'FLAT');
    }
    if (ind.label === 'EUR / XOF') {
      await updateIndicator(ind.id, '655.957 FCFA', 'FLAT');
    }
  }

  return NextResponse.json({
    success: true,
    updatedAt: new Date().toISOString(),
    updates: results,
  });
}
