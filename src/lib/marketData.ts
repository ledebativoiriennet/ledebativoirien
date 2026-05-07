export async function fetchYahoo(ticker: string) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart.result[0].meta;
    return {
      price: result.regularMarketPrice,
      prev: result.previousClose || result.chartPreviousClose || result.regularMarketPrice
    };
  } catch (e) {
    return null;
  }
}

export async function fetchCurrencies() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates;
  } catch (e) {
    return null;
  }
}

export async function getLiveMarketData() {
  const [gold, silver, aluminium, cocoa, coffee, brent, cotton, gas, zinc, rates] = await Promise.all([
    fetchYahoo("GC=F"),   // Or
    fetchYahoo("SI=F"),   // Argent
    fetchYahoo("ALI=F"),  // Aluminium
    fetchYahoo("CC=F"),   // Cacao
    fetchYahoo("KC=F"),   // Café
    fetchYahoo("BZ=F"),   // Pétrole Brent
    fetchYahoo("CT=F"),   // Coton
    fetchYahoo("NG=F"),   // Gaz Naturel
    fetchYahoo("ZN=F"),   // Zinc
    fetchCurrencies()
  ]);

  return { gold, silver, aluminium, cocoa, coffee, brent, cotton, gas, zinc, rates };
}
