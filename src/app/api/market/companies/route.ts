import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'world'; // 'world' or 'africa'

  const worldCompanies = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'BRK-B', name: 'Berkshire Hathaway' },
    { symbol: 'LLY', name: 'Eli Lilly' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'MC.PA', name: 'LVMH Moët Hennessy' },
    { symbol: 'TSM', name: 'TSMC' },
    { symbol: 'AVGO', name: 'Broadcom Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'MA', name: 'Mastercard' },
    { symbol: 'UNH', name: 'UnitedHealth' },
    { symbol: 'ASML', name: 'ASML Holding' },
    { symbol: 'OR.PA', name: 'L\'Oréal' },
    { symbol: 'SAP', name: 'SAP SE' },
    { symbol: 'RMS.PA', name: 'Hermès' },
    { symbol: 'NVO', name: 'Novo Nordisk' },
    { symbol: 'COST', name: 'Costco Wholesale' },
    { symbol: 'ORCL', name: 'Oracle Corp.' },
    { symbol: 'HD', name: 'Home Depot' },
    { symbol: 'TMO', name: 'Thermo Fisher' },
    { symbol: 'ABBV', name: 'AbbVie Inc.' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'CVX', name: 'Chevron Corp.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    // ... nous générerons le reste dynamiquement pour atteindre 100
  ];

  const africaCompanies = [
    { symbol: 'NPN.JO', name: 'Naspers (Afrique du Sud)' },
    { symbol: 'MTN.JO', name: 'MTN Group' },
    { symbol: 'DANGCEM.LG', name: 'Dangote Cement (Nigeria)' },
    { symbol: 'FSR.JO', name: 'FirstRand' },
    { symbol: 'SNTS.BRVM', name: 'Sonatel (Sénégal/BRVM)' },
    { symbol: 'SCOM.NR', name: 'Safaricom (Kenya)' },
    { symbol: 'SBK.JO', name: 'Standard Bank' },
    { symbol: 'MCB.MU', name: 'MCB Group (Maurice)' },
    { symbol: 'ATW.CAS', name: 'Attijariwafa Bank (Maroc)' },
    { symbol: 'SOL.JO', name: 'Sasol' },
    { symbol: 'CIB.EG', name: 'CIB Egypt' },
    { symbol: 'ZENITH.LG', name: 'Zenith Bank (Nigeria)' },
    { symbol: 'IAM.CAS', name: 'Maroc Telecom' },
    { symbol: 'GRT.JO', name: 'Growthpoint' },
    { symbol: 'EQUITY.NR', name: 'Equity Group' },
    { symbol: 'BCP.CAS', name: 'BCP (Maroc)' },
    { symbol: 'AIRTEL.LG', name: 'Airtel Africa' },
    { symbol: 'BUACEM.LG', name: 'BUA Cement' },
    { symbol: 'ORGT.BRVM', name: 'Orange Côte d\'Ivoire' },
    { symbol: 'ETIT.BRVM', name: 'Ecobank Transnational' },
    // ... nous générerons le reste dynamiquement pour atteindre 100
  ];

  const targetList = type === 'world' ? worldCompanies : africaCompanies;
  const basePriceRange = type === 'world' ? [100, 1000] : [10, 500];

  // Compléter à 100 pour la démo avec des noms génériques si nécessaire
  const finalData = Array.from({ length: 100 }, (_, i) => {
    const existing = targetList[i];
    const name = existing ? existing.name : `${type === 'world' ? 'Global' : 'African'} Corp ${i + 1}`;
    const symbol = existing ? existing.symbol : `${type === 'world' ? 'GLB' : 'AFR'}${i + 1}`;
    
    const basePrice = (Math.random() * (basePriceRange[1] - basePriceRange[0])) + basePriceRange[0];
    const variation = (Math.random() - 0.48) * 2; // Variation entre -1% et +1%
    const change = (basePrice * variation) / 100;
    
    return {
      id: symbol,
      symbol,
      name,
      price: basePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      change: change.toFixed(2),
      changePercent: variation.toFixed(2),
      trend: variation >= 0 ? 'UP' : 'DOWN',
      volume: Math.floor(Math.random() * 1000000).toLocaleString('fr-FR')
    };
  });

  return NextResponse.json(finalData);
}
