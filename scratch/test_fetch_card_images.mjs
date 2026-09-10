import fs from 'fs';
import path from 'path';

const candidateCards = [
  { id: "idfc-first-wow", name: "IDFC FIRST WOW", search: "https://www.paisabazaar.com/idfc-bank/wow-credit-card/" },
  { id: "kotak-811-dream", name: "Kotak 811 Dream Different", search: "https://www.paisabazaar.com/kotak-bank/811-dream-different-credit-card/" },
  { id: "axis-myzone", name: "Axis Bank My Zone", search: "https://www.paisabazaar.com/axis-bank/my-zone-credit-card/" },
  { id: "indusind-legend", name: "IndusInd Legend", search: "https://www.paisabazaar.com/indusind-bank/legend-credit-card/" },
  { id: "sbi-simplyclick", name: "SBI SimplyCLICK", search: "https://www.paisabazaar.com/sbi-bank/simplyclick-credit-card/" },
  { id: "sbi-simplysave", name: "SBI SimplySAVE", search: "https://www.paisabazaar.com/sbi-bank/simplysave-credit-card/" },
  { id: "axis-neo", name: "Axis Bank Neo", search: "https://www.paisabazaar.com/axis-bank/neo-credit-card/" },
  { id: "indusind-aura-edge", name: "IndusInd Platinum Aura Edge", search: "https://www.paisabazaar.com/indusind-bank/platinum-aura-edge-credit-card/" },
  { id: "bob-easy", name: "BOB Easy", search: "https://www.paisabazaar.com/bob-bank/easy-credit-card/" },
  { id: "au-altura", name: "AU Bank Altura", search: "https://www.paisabazaar.com/au-bank/altura-credit-card/" },
  { id: "hdfc-moneyback", name: "HDFC MoneyBack+", search: "https://www.paisabazaar.com/hdfc-bank/moneyback-plus-credit-card/" },
  { id: "sbi-cashback", name: "SBI Cashback", search: "https://www.paisabazaar.com/sbi-bank/cashback-sbi-card/" },
  { id: "axis-airtel", name: "Airtel Axis Bank", search: "https://www.paisabazaar.com/axis-bank/airtel-axis-bank-credit-card/" },
  { id: "axis-flipkart", name: "Flipkart Axis Bank", search: "https://www.paisabazaar.com/axis-bank/flipkart-credit-card/" },
  { id: "swiggy-hdfc", name: "Swiggy HDFC Bank", search: "https://www.paisabazaar.com/hdfc-bank/swiggy-credit-card/" },
  { id: "tata-neu-infinity", name: "Tata Neu Infinity HDFC", search: "https://www.paisabazaar.com/hdfc-bank/tata-neu-infinity-credit-card/" },
  { id: "scapia-federal", name: "Scapia Federal", search: "https://www.paisabazaar.com/federal-bank/scapia-credit-card/" },
  { id: "au-lit", name: "AU LIT", search: "https://www.paisabazaar.com/au-bank/lit-credit-card/" },
  { id: "sbi-bpcl-octane", name: "BPCL SBI Octane", search: "https://www.paisabazaar.com/sbi-bank/bpcl-octane-credit-card/" },
  { id: "axis-atlas", name: "Axis Bank Atlas", search: "https://www.paisabazaar.com/axis-bank/atlas-credit-card/" },
  { id: "hdfc-regalia-gold", name: "HDFC Regalia Gold", search: "https://www.paisabazaar.com/hdfc-bank/regalia-gold-credit-card/" },
  { id: "idfc-first-wealth", name: "IDFC FIRST Wealth", search: "https://www.paisabazaar.com/idfc-bank/wealth-credit-card/" },
  { id: "hdfc-infinia-metal", name: "HDFC Infinia Metal", search: "https://www.paisabazaar.com/hdfc-bank/infinia-credit-card/" },
  { id: "kiwi-axis-rupay", name: "Kiwi Axis RuPay", search: "https://www.paisabazaar.com/axis-bank/kiwi-axis-bank-credit-card/" },
  { id: "yes-bank-pop-club", name: "Yes Bank POP Club", search: "https://www.paisabazaar.com/yes-bank/pop-club-credit-card/" },
  { id: "novio-secured-card", name: "Novio Secured", search: "https://www.paisabazaar.com/credit-card/novio-credit-card/" }
];

async function check() {
  for (const item of candidateCards) {
    try {
      const res = await fetch(item.search, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!res.ok) {
        console.log(`[${res.status}] ${item.id} -> ${item.search}`);
        continue;
      }
      const html = await res.text();
      const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (match && match[1]) {
        console.log(`FOUND ${item.id}: ${match[1]}`);
      } else {
        console.log(`NO OG:IMAGE ${item.id}`);
      }
    } catch (e) {
      console.log(`ERR ${item.id}: ${e.message}`);
    }
  }
}

check();
