const fs = require('fs');

async function test() {
  const feedUrl = 'http://atlasflux.suptribune.org/Outil_RSS_lecture.php?code_id=30091&charge=&urllist=fra_territoire_afrique';
  const res = await fetch(feedUrl);
  const buffer = await res.arrayBuffer();
  const decoder = new TextDecoder('iso-8859-1');
  const xml = decoder.decode(buffer);
  
  const items = [];
  const itemMatches = [...xml.matchAll(/<a[^>]+href=['"]([^'"]+)['"][^>]*>(?:(?!<\/a>)[\s\S])*?<div\s+class=['"]titre['"][^>]*>(.*?)<\/div>/gi)];
  
  for (let match of itemMatches) {
    items.push({ link: match[1], title: match[2] });
  }
  
  console.log(`Found ${items.length} items`);
  if (items.length > 0) {
    console.log(items[0]);
  }
}

test().catch(console.error);
