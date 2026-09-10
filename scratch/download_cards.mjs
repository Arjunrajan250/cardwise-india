import fs from 'fs';
import path from 'path';

const cardTargets = [
  { id: "idfc-first-wow", name: "IDFC FIRST WOW", url: "https://cardinsider.com/idfc-first-bank/idfc-first-wow-black-credit-card/" },
  { id: "onecard-metal", name: "OneCard Metal", url: "https://cardinsider.com/fintech-cards/onecard-credit-card/" },
  { id: "kotak-811-dream", name: "Kotak 811 Dream", url: "https://cardinsider.com/kotak/kotak-811-credit-card/" },
  { id: "icici-amazon-pay", name: "Amazon Pay ICICI", url: "https://cardinsider.com/icici-bank/amazon-pay-icici-bank-credit-card/" },
  { id: "axis-myzone", name: "Axis Bank My Zone", url: "https://cardinsider.com/axis-bank/axis-bank-my-zone-credit-card/" },
  { id: "indusind-legend", name: "IndusInd Legend", url: "https://cardinsider.com/indusind-bank/indusind-legend-credit-card/" },
  { id: "sbi-simplyclick", name: "SBI SimplyCLICK", url: "https://cardinsider.com/sbi-card/sbi-simplyclick-credit-card/" },
  { id: "sbi-simplysave", name: "SBI SimplySAVE", url: "https://cardinsider.com/sbi-card/sbi-simplysave-credit-card/" },
  { id: "axis-neo", name: "Axis Bank Neo", url: "https://cardinsider.com/axis-bank/axis-bank-neo-credit-card/" },
  { id: "icici-coral", name: "ICICI Coral", url: "https://cardinsider.com/icici-bank/icici-bank-coral-credit-card/" },
  { id: "icici-platinum-chip", name: "ICICI Platinum Chip", url: "https://cardinsider.com/icici-bank/icici-bank-platinum-chip-credit-card/" },
  { id: "indusind-aura-edge", name: "IndusInd Platinum Aura Edge", url: "https://cardinsider.com/indusind-bank/indusind-platinum-aura-edge-credit-card/" },
  { id: "bob-easy", name: "BOB Easy", url: "https://cardinsider.com/bank-of-baroda/bank-of-baroda-easy-credit-card/" },
  { id: "au-altura", name: "AU Bank Altura", url: "https://cardinsider.com/au-bank/altura-credit-card/" },
  { id: "hsbc-platinum", name: "HSBC Platinum", url: "https://cardinsider.com/hsbc-bank/hsbc-visa-platinum-credit-card/" },
  { id: "hdfc-moneyback", name: "HDFC MoneyBack+", url: "https://cardinsider.com/hdfc-bank/hdfc-bank-moneyback-plus-credit-card/" },
  { id: "rbl-shoprite", name: "RBL Bank ShopRite", url: "https://cardinsider.com/rbl-bank/rbl-bank-shoprite-credit-card/" },
  { id: "sbi-cashback", name: "SBI Cashback", url: "https://cardinsider.com/sbi-card/cashback-sbi-credit-card/" },
  { id: "hdfc-millennia", name: "HDFC Millennia", url: "https://cardinsider.com/hdfc-bank/hdfc-bank-millennia-credit-card/" },
  { id: "axis-airtel", name: "Airtel Axis Bank", url: "https://cardinsider.com/axis-bank/airtel-axis-bank-credit-card/" },
  { id: "axis-flipkart", name: "Flipkart Axis Bank", url: "https://cardinsider.com/axis-bank/flipkart-axis-bank-credit-card/" },
  { id: "swiggy-hdfc", name: "Swiggy HDFC Bank", url: "https://cardinsider.com/hdfc-bank/swiggy-blck-hdfc-bank-credit-card/" },
  { id: "tata-neu-infinity", name: "Tata Neu Infinity HDFC", url: "https://cardinsider.com/hdfc-bank/tata-neu-infinity-hdfc-credit-card/" },
  { id: "scapia-federal", name: "Scapia Federal", url: "https://cardinsider.com/fintech-cards/scapia-credit-card/" },
  { id: "au-lit", name: "AU LIT", url: "https://cardinsider.com/au-bank/lit-credit-card/" },
  { id: "sbi-bpcl-octane", name: "BPCL SBI Octane", url: "https://cardinsider.com/sbi-card/bpcl-sbi-card-octane/" },
  { id: "hsbc-cashback", name: "HSBC Live+", url: "https://cardinsider.com/hsbc-bank/hsbc-cashback-credit-card/" },
  { id: "axis-atlas", name: "Axis Bank Atlas", url: "https://cardinsider.com/axis-bank/axis-bank-atlas-credit-card/" },
  { id: "hdfc-regalia-gold", name: "HDFC Regalia Gold", url: "https://cardinsider.com/hdfc-bank/hdfc-bank-regalia-gold-credit-card/" },
  { id: "amex-platinum-travel", name: "Amex Platinum Travel", url: "https://cardinsider.com/american-express/american-express-platinum-travel-credit-card/" },
  { id: "idfc-first-wealth", name: "IDFC FIRST Wealth", url: "https://cardinsider.com/idfc-first-bank/idfc-first-wealth-credit-card/" },
  { id: "hdfc-infinia-metal", name: "HDFC Infinia Metal", url: "https://cardinsider.com/hdfc-bank/hdfc-bank-infinia-credit-card/" },
  { id: "kiwi-axis-rupay", name: "Kiwi Axis RuPay", url: "https://cardinsider.com/punjab-national-bank/pnb-kiwi-credit-card/" },
  { id: "yes-bank-pop-club", name: "Yes Bank POP-Club", url: "https://cardinsider.com/fintech-cards/yes-bank-pop-club-credit-card/" },
  { id: "novio-secured-card", name: "Novio Secured", url: "https://cardinsider.com/rbl-bank/rbl-bank-novio-credit-card/" }
];

const outDir = path.resolve('public/images/cards');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function findCardImageUrl(item) {
  try {
    const res = await fetch(item.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) {
      console.warn(`[HTTP ${res.status}] for ${item.id} at ${item.url}`);
      return null;
    }
    const html = await res.text();

    // 1. Look for RankMath schema or Featured Image
    const schemaMatch = html.match(/"primaryImageOfPage":\{"@id":"([^"]+)"\}/);
    if (schemaMatch && schemaMatch[1]) {
      return schemaMatch[1];
    }

    // 2. Look for card image uploaded to CDN
    const cdnMatches = [...html.matchAll(/https:\/\/cardinside\.b-cdn\.net\/wp-content\/uploads\/[0-9/]+\/[a-zA-Z0-9_\-\.]+\.(?:png|webp|jpg)/gi)]
      .map(m => m[0])
      .filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes("logo") && !lower.includes("avatar") && !lower.includes("300x") && !lower.includes("150x");
      });

    if (cdnMatches.length > 0) {
      // Find the one most likely to be the card front
      const best = cdnMatches.find(u => u.toLowerCase().includes("card") || u.toLowerCase().includes("feature")) || cdnMatches[0];
      return best;
    }

    // 3. Look for og:image
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1] && !ogMatch[1].includes('rank_math_overlay_thumb')) {
      return ogMatch[1];
    }

    return null;
  } catch (err) {
    console.error(`Error finding image for ${item.id}:`, err.message);
    return null;
  }
}

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

async function run() {
  console.log(`Starting download for ${cardTargets.length} cards...`);
  const results = [];

  for (const item of cardTargets) {
    console.log(`Processing [${item.id}]...`);
    let imgUrl = await findCardImageUrl(item);
    
    // Fallback for special cards if not found
    if (!imgUrl && item.id === 'kiwi-axis-rupay') {
      imgUrl = 'https://cardinside.b-cdn.net/wp-content/uploads/2023/06/Kiwi-Credit-Card.png';
    }

    if (imgUrl) {
      const ext = path.extname(new URL(imgUrl).pathname) || '.webp';
      const destName = `${item.id}${ext}`;
      const destPath = path.join(outDir, destName);
      try {
        await downloadFile(imgUrl, destPath);
        const stats = fs.statSync(destPath);
        console.log(`  -> SUCCESS [${item.id}]: saved ${destName} (${(stats.size / 1024).toFixed(1)} KB) from ${imgUrl}`);
        results.push({ id: item.id, file: destName, size: stats.size, status: 'OK' });
      } catch (e) {
        console.error(`  -> FAILED to download ${imgUrl}:`, e.message);
        results.push({ id: item.id, status: 'DOWNLOAD_ERROR', error: e.message });
      }
    } else {
      console.warn(`  -> NO IMAGE FOUND for ${item.id}`);
      results.push({ id: item.id, status: 'NOT_FOUND' });
    }
  }

  console.log("\n================ SUMMARY ================");
  const ok = results.filter(r => r.status === 'OK');
  console.log(`Successfully downloaded: ${ok.length} / ${cardTargets.length}`);
  const missing = results.filter(r => r.status !== 'OK');
  if (missing.length > 0) {
    console.log("Missing / Failed cards:", missing);
  }
}

run();
