import { NextResponse } from 'next/server';

export async function GET() {
  const symbols = [
    '^GSPC', '^IXIC', '^FCHI', '^GDAXI', '^N225', '^FTSE', // Global
    '^J200.JO', '^EGX30', 'NGXASI.LG', 'MASI.CAS', 'NSE20.NR' // Africa
  ];
  const names: Record<string, string> = {
    '^GSPC': 'S&P 500',
    '^IXIC': 'Nasdaq',
    '^FCHI': 'CAC 40',
    '^GDAXI': 'DAX 40',
    '^N225': 'Nikkei 225',
    '^FTSE': 'FTSE 100',
    '^J200.JO': 'JSE Top 40 (SA)',
    '^EGX30': 'EGX 30 (Egypte)',
    'NGXASI.LG': 'NGX ASI (Nigeria)',
    'MASI.CAS': 'MASI (Maroc)',
    'NSE20.NR': 'NSE 20 (Kenya)'
  };

  try {
    const data = symbols.map(symbol => {
      const baseValues: Record<string, number> = {
        '^GSPC': 5200, '^IXIC': 16400, '^FCHI': 8100, '^GDAXI': 18200, '^N225': 39500, '^FTSE': 7900,
        '^J200.JO': 74000, '^EGX30': 28500, 'NGXASI.LG': 104000, 'MASI.CAS': 13200, 'NSE20.NR': 1750
      };

      const base = baseValues[symbol];
      const randomVariation = (Math.random() - 0.45) * 0.01; // Variation entre -0.45% et +0.55%
      const value = base * (1 + randomVariation);
      const change = value - base;
      const changePercent = (change / base) * 100;

      return {
        symbol,
        name: names[symbol],
        value: value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
        trend: change >= 0 ? 'UP' : 'DOWN',
        // Générer quelques points pour la sparkline
        history: Array.from({ length: 10 }, (_, i) => base * (1 + (Math.random() - 0.5) * 0.005))
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
