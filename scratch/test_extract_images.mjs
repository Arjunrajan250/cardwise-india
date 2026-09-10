import fs from 'fs';
import path from 'path';

const testCards = [
  { id: "sbi-cashback", url: "https://cardinsider.com/sbi-card/cashback-sbi-credit-card/" },
  { id: "axis-airtel", url: "https://cardinsider.com/axis-bank/airtel-axis-bank-credit-card/" },
  { id: "hdfc-millennia", url: "https://cardinsider.com/hdfc-bank/hdfc-bank-millennia-credit-card/" }
];

async function testFetch() {
  for (const c of testCards) {
    console.log(`Fetching ${c.id} from ${c.url}...`);
    const res = await fetch(c.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    // CardInsider has rank-math-schema-pro or og:image or <div class="card-img"> <img src="..." />
    // Let's search for card inside image
    const imgMatches = [...html.matchAll(/https:\/\/cardinside\.b-cdn\.net\/wp-content\/uploads\/[0-9/]+\/[a-zA-Z0-9_-]+(?:Feature|Card|card)?[a-zA-Z0-9_-]*\.(?:png|webp|jpg)/gi)];
    console.log(`Found ${imgMatches.length} CDN image matches for ${c.id}:`);
    const urls = [...new Set(imgMatches.map(m => m[0]))];
    urls.slice(0, 3).forEach(u => console.log("  ", u));
    
    // Check og:image too
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch) console.log("   OG:IMAGE:", ogMatch[1]);
  }
}

testFetch();
