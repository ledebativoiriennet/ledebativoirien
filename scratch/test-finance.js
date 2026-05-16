async function fetchYahoo(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`);
    const data = await res.json();
    const result = data.chart.result[0].meta;
    console.log(`✓ ${ticker}: ${result.regularMarketPrice}`);
    return {
      price: result.regularMarketPrice,
      prev: (result.previousClose || result.chartPreviousClose)
    };
  } catch (e) {
    console.error(`✗ ${ticker} fetch error:`, e.message);
    return null;
  }
}

async function main() {
  const tickers = ["GC=F", "SI=F", "CC=F", "KC=F", "BZ=F", "CL=F", "NG=F", "CT=F", "ZN=F", "^BRVMC", "^BRVM30"];
  console.log("Testing Yahoo Finance Tickers...");
  for (const t of tickers) {
    await fetchYahoo(t);
  }
}

main();
