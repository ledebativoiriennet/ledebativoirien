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
  const [cocoa, coffee, brent, cotton, gas, gold, silver, aluminium, rates] = await Promise.all([
    fetchYahoo('CC=F'),   // Cacao
    fetchYahoo('KC=F'),   // Café
    fetchYahoo('BZ=F'),   // Pétrole Brent
    fetchYahoo('CT=F'),   // Coton
    fetchYahoo('NG=F'),   // Gaz Naturel
    fetchYahoo('GC=F'),   // Or
    fetchYahoo('SI=F'),   // Argent
    fetchYahoo('ALI=F'),  // Aluminium
    fetchRates(),          // Devises
  ]);

  const getTrend = (price: number, prev: number) =>
    price > prev ? 'UP' : price < prev ? 'DOWN' : 'FLAT';

  // Récupérer tous les indicateurs en DB
  const indicators = await prisma.marketIndicator.findMany();

  for (const ind of indicators) {
    if (ind.label === 'Cacao' && cocoa) {
      await updateIndicator(ind.id, `${cocoa.price.toFixed(0)} $ / MT`, getTrend(cocoa.price, cocoa.prev));
    }
    if (ind.label === 'Café' && coffee) {
      await updateIndicator(ind.id, `${coffee.price.toFixed(2)} ¢ / lb`, getTrend(coffee.price, coffee.prev));
    }
    if (ind.label === 'Pétrole Brent' && brent) {
      await updateIndicator(ind.id, `${brent.price.toFixed(2)} $ / b`, getTrend(brent.price, brent.prev));
    }
    if (ind.label === 'Coton' && cotton) {
      await updateIndicator(ind.id, `${cotton.price.toFixed(2)} ¢ / lb`, getTrend(cotton.price, cotton.prev));
    }
    if (ind.label === 'Gaz Naturel' && gas) {
      await updateIndicator(ind.id, `${gas.price.toFixed(2)} $ / MMBtu`, getTrend(gas.price, gas.prev));
    }
    if (ind.label === 'Or (Once)' && gold) {
      await updateIndicator(ind.id, `${gold.price.toFixed(2)} $`, getTrend(gold.price, gold.prev));
    }
    if (ind.label === 'Argent' && silver) {
      await updateIndicator(ind.id, `${silver.price.toFixed(2)} $`, getTrend(silver.price, silver.prev));
    }
    if (ind.label === 'Aluminium' && aluminium) {
      await updateIndicator(ind.id, `${aluminium.price.toFixed(2)} $`, getTrend(aluminium.price, aluminium.prev));
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
