const xml2js = require('xml2js');

async function test() {
  const RSS_FEEDS = [
    'https://www.lemonde.fr/international/rss_full.xml',
    'http://atlasflux.suptribune.org/Outil_RSS_lecture.php?code_id=816&charge=&urllist=fra_presse_monde'
  ];

  for (const feedUrl of RSS_FEEDS) {
    console.log(`Fetching ${feedUrl}...`);
    const res = await fetch(feedUrl);
    const xml = await res.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });

    let items = [];
    if (parsed?.rss?.channel?.item) {
      items = Array.isArray(parsed.rss.channel.item) 
        ? parsed.rss.channel.item 
        : [parsed.rss.channel.item];
    }
    
    console.log(`Found ${items.length} items.`);
    if (items.length > 0) {
      const first = items[0];
      const title = typeof first.title === 'string' ? first.title : first.title._ || 'Sans titre';
      console.log(`First item title: ${title}`);
    }
  }
}

test().catch(console.error);
