async function fetchYahoo(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`);
    if (!res.ok) {
        console.error(`Error fetching ${ticker}: ${res.status}`);
        return null;
    }
    const data = await res.json();
    if (!data.chart?.result?.[0]) return null;
    const result = data.chart.result[0].meta;
    return {
      symbol: ticker,
      price: result.regularMarketPrice,
      prev: result.previousClose || result.chartPreviousClose || result.regularMarketPrice
    };
  } catch (e) {
    console.error("Yahoo fetch error", ticker, e);
    return null;
  }
}

async function test() {
  const tickers = ["^BRVMC", "^BRVM10", "^BRVM30", "SNTS.BRVM"];
  for (const t of tickers) {
    const data = await fetchYahoo(t);
    console.log(t, data);
  }
}

test();
