async function test() {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/ALI=F?interval=1d&range=1d");
    const data = await res.json();
    console.log("Aluminium:", data.chart.result[0].meta.regularMarketPrice);
  } catch(e) {
    console.error(e);
  }
}
test();
