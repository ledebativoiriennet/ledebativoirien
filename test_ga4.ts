import { getGA4Stats } from './src/lib/ga4';

async function test() {
  console.log("Testing GA4...");
  const stats = await getGA4Stats();
  console.log("Stats:", stats);
}

test();
