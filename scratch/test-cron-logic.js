const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fetchYahoo(ticker) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.chart?.result?.[0]) return null;
    const result = data.chart.result[0].meta;
    return {
      price: result.regularMarketPrice,
      prev: (result.previousClose || result.chartPreviousClose || result.regularMarketPrice)
    };
  } catch (e) {
    console.error("Yahoo fetch error", ticker, e.message);
    return null;
  }
}

async function fetchCurrencies() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates;
  } catch (e) {
    console.error("Currency fetch error", e.message);
    return null;
  }
}

async function upsertIndicator(label, group, value, numericValue, trend, extra) {
  const existing = await prisma.marketIndicator.findFirst({ 
    where: { 
      OR: [
        { label, group },
        { label: label.trim() }
      ]
    } 
  });
  
  const dateLabel = new Date().toLocaleDateString("fr-FR");

  if (existing) {
    console.log(`Updating ${label}...`);
    await prisma.marketIndicator.update({
      where: { id: existing.id },
      data: { value, trend, extraText: extra || existing.extraText, dateLabel, group }
    });
  } else {
    console.log(`Creating ${label}...`);
    await prisma.marketIndicator.create({
      data: { label, group, value, trend, extraText: extra || '', dateLabel, order: 0 }
    });
  }
}

async function main() {
  console.log("Starting Market Update Test...");
  const [gold, silver, cocoa, coffee, brent, wti, naturalGas, cotton, zinc, aluminium, rates] = await Promise.all([
    fetchYahoo("GC=F"), fetchYahoo("SI=F"), fetchYahoo("CC=F"), fetchYahoo("KC=F"),
    fetchYahoo("BZ=F"), fetchYahoo("CL=F"), fetchYahoo("NG=F"), fetchYahoo("CT=F"),
    fetchYahoo("ZN=F"), fetchYahoo("ALI=F"), fetchCurrencies()
  ]);

  if (gold) await upsertIndicator("Or (Once)", "METAUX1", `${gold.price.toFixed(2)} $`, gold.price, "UP", "0.00%");
  if (zinc) await upsertIndicator("Zinc", "METAUX1", `${zinc.price.toFixed(2)} $`, zinc.price, "UP", "0.00%");
  if (cocoa) await upsertIndicator("Cacao (Bourse)", "CACAO", `${cocoa.price.toFixed(0)} $`, cocoa.price, "UP", "0.00%");
  if (rates && rates.XOF) await upsertIndicator("USD / XOF", "MONNAIES", `${rates.XOF.toFixed(2)} FCFA`, rates.XOF, "FLAT");

  console.log("Test Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
