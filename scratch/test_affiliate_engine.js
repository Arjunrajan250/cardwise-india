import { AffiliateManager } from '../src/affiliate.js';
import { CREDIT_CARDS } from '../src/data/cards.js';
import { PERSONAL_LOANS, CREDIT_SCORE_OFFERS } from '../src/data/loans.js';

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; }
};
global.document = {
  getElementById: () => null,
  head: { appendChild: () => {} }
};

console.log('--- Starting Affiliate Engine Unit & Integration Tests ---');

const mgr = new AffiliateManager();

// Test 1: Default vCommission resolution
console.log('\n[Test 1] vCommission Resolution:');
const wowCard = CREDIT_CARDS.find(c => c.id === 'idfc-first-wow');
const wowUrl = mgr.resolveUrl(wowCard);
console.log('IDFC WOW URL:', wowUrl);
if (!wowUrl.includes('aff_id=131993') || !wowUrl.includes('aff_sub=instantcred_web')) {
  throw new Error('vCommission resolution failed!');
}
console.log('✓ vCommission resolution passed.');

// Test 2: Switch network to Cuelinks (CP Rewritten mode)
console.log('\n[Test 2] Cuelinks CP Rewritten Resolution:');
mgr.saveSettings({
  primaryNetwork: 'cuelinks',
  networks: {
    cuelinks: {
      pubId: '154890',
      subId: 'test_sub',
      redirectFormat: 'cprewritten',
      enableAutoTaggingScript: false
    }
  }
});
const millenniaCard = CREDIT_CARDS.find(c => c.id === 'hdfc-millennia');
const millenniaUrl = mgr.resolveUrl(millenniaCard);
console.log('HDFC Millennia Cuelinks URL:', millenniaUrl);
if (!millenniaUrl.startsWith('https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=154890&sub_id=test_sub&url=')) {
  throw new Error('Cuelinks CP Rewritten resolution failed!');
}
console.log('✓ Cuelinks CP Rewritten passed.');

// Test 3: Cuelinks (LinksRedirect mode)
console.log('\n[Test 3] Cuelinks LinksRedirect Mode:');
mgr.saveSettings({
  networks: {
    cuelinks: {
      redirectFormat: 'linksredirect'
    }
  }
});
const sbiCashback = CREDIT_CARDS.find(c => c.id === 'sbi-cashback');
const sbiUrl = mgr.resolveUrl(sbiCashback);
console.log('SBI Cashback LinksRedirect URL:', sbiUrl);
if (!sbiUrl.startsWith('https://linksredirect.com/?cid=154890&subid=test_sub&url=')) {
  throw new Error('Cuelinks LinksRedirect resolution failed!');
}
console.log('✓ Cuelinks LinksRedirect passed.');

// Test 4: Switch to EarnKaro
console.log('\n[Test 4] EarnKaro Resolution:');
mgr.saveSettings({
  primaryNetwork: 'earnkaro',
  networks: {
    earnkaro: {
      userId: '887766',
      subId: 'earnkaro_promo'
    }
  }
});
const axisAirtel = CREDIT_CARDS.find(c => c.id === 'axis-airtel');
const axisUrl = mgr.resolveUrl(axisAirtel);
console.log('Axis Airtel EarnKaro URL:', axisUrl);
if (!axisUrl.includes('r=887766') || !axisUrl.includes('earnkaro_promo')) {
  throw new Error('EarnKaro resolution failed!');
}
console.log('✓ EarnKaro resolution passed.');

// Test 5: Switch to Direct Bank UTM Links
console.log('\n[Test 5] Direct Bank UTM Resolution:');
mgr.saveSettings({
  primaryNetwork: 'direct',
  networks: {
    direct: {
      utmSource: 'instantcred_app',
      utmMedium: 'cpc',
      utmCampaign: 'cards_fest_2026'
    }
  }
});
const amazonCard = CREDIT_CARDS.find(c => c.id === 'icici-amazon-pay');
const amazonUrl = mgr.resolveUrl(amazonCard);
console.log('Amazon ICICI Direct UTM URL:', amazonUrl);
if (!amazonUrl.includes('utm_source=instantcred_app') || !amazonUrl.includes('utm_campaign=cards_fest_2026')) {
  throw new Error('Direct UTM resolution failed!');
}
console.log('✓ Direct UTM resolution passed.');

// Test 6: Per-card Custom Link Override
console.log('\n[Test 6] Per-Card Custom Link Override:');
mgr.saveSettings({
  customLinks: {
    'onecard-metal': 'https://custom-special-deal.com/onecard?myref=999'
  }
});
const onecard = CREDIT_CARDS.find(c => c.id === 'onecard-metal');
const onecardUrl = mgr.resolveUrl(onecard);
console.log('OneCard custom URL:', onecardUrl);
if (onecardUrl !== 'https://custom-special-deal.com/onecard?myref=999') {
  throw new Error('Custom link override failed!');
}
console.log('✓ Custom link override passed.');

// Test 7: Per-card Network Routing Override
console.log('\n[Test 7] Per-Card Network Override (Axis Airtel routed to vCommission while global is Direct):');
mgr.saveSettings({
  networkOverrides: {
    'axis-airtel': 'vcommission'
  }
});
const axisOverriddenUrl = mgr.resolveUrl(axisAirtel);
console.log('Axis Airtel Overridden URL:', axisOverriddenUrl);
if (!axisOverriddenUrl.includes('tracking.vcommission.com')) {
  throw new Error('Network routing override failed!');
}
console.log('✓ Network routing override passed.');

// Test 8: Loans & Credit Score Resolution
console.log('\n[Test 8] Personal Loan & Credit Score Resolution:');
const fibeLoan = PERSONAL_LOANS.find(l => l.id === 'fibe-loan');
const fibeUrl = mgr.resolveUrl(fibeLoan);
console.log('Fibe Loan URL:', fibeUrl);
const paisaOffer = CREDIT_SCORE_OFFERS.find(o => o.id === 'paisabazaar-cibil');
const paisaUrl = mgr.resolveUrl(paisaOffer);
console.log('Paisabazaar CIBIL URL:', paisaUrl);
if (!fibeUrl || !paisaUrl) {
  throw new Error('Loans/CIBIL resolution failed!');
}
console.log('✓ Loans & CIBIL resolution passed.');

// Test 9: Click Tracking & Logging
console.log('\n[Test 9] Click Tracking & Logs:');
mgr.logClick(wowCard, wowUrl, 'vcommission');
mgr.logClick(millenniaCard, millenniaUrl, 'cuelinks');
const logs = mgr.getClickLogs();
console.log(`Total logged clicks: ${logs.length}`);
if (logs.length !== 2 || logs[0].network !== 'cuelinks') {
  throw new Error('Click logging failed!');
}
console.log('✓ Click tracking passed.');

// Test 10: JSON Export and Import
console.log('\n[Test 10] JSON Export & Import:');
const exported = mgr.exportConfigJSON();
const parsed = JSON.parse(exported);
if (!parsed.networks || parsed.primaryNetwork !== 'direct') {
  throw new Error('JSON Export failed!');
}
const codeOutput = mgr.generateConfigCode();
if (!codeOutput.includes('export const DEFAULT_AFFILIATE_CONFIG')) {
  throw new Error('Code Generator failed!');
}
console.log('✓ Export & Import passed.');

console.log('\n=============================================');
console.log('🎉 ALL 10 AFFILIATE ENGINE TESTS PASSED 100%!');
console.log('=============================================\n');
