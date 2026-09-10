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

console.log('--- Starting Cuelinks Exclusive Affiliate Engine Tests ---');

const mgr = new AffiliateManager();

// Test 1: Verified Default Cuelinks resolution (Channel ID 317055)
console.log('\n[Test 1] Verified Cuelinks LinksRedirect Resolution:');
const wowCard = CREDIT_CARDS.find(c => c.id === 'idfc-first-wow');
const wowUrl = mgr.resolveUrl(wowCard);
console.log('IDFC FIRST WOW Cuelinks URL:', wowUrl);
if (!wowUrl.startsWith('https://linksredirect.com/?cid=317055&subid=instantcred_web&url=')) {
  throw new Error('Default Cuelinks resolution failed!');
}
console.log('✓ Default Cuelinks LinksRedirect resolution passed.');

// Test 2: HDFC MoneyBack+ verification (User query case)
console.log('\n[Test 2] HDFC MoneyBack+ Cuelinks Resolution:');
const moneyback = CREDIT_CARDS.find(c => c.id === 'hdfc-moneyback');
const moneybackUrl = mgr.resolveUrl(moneyback);
console.log('HDFC MoneyBack+ Resolved URL:', moneybackUrl);
if (!moneybackUrl.includes('cid=317055') || !moneybackUrl.includes('moneyback-plus')) {
  throw new Error('HDFC MoneyBack+ Cuelinks resolution failed!');
}
console.log('✓ HDFC MoneyBack+ Cuelinks resolution passed.');

// Test 3: Every single Credit Card (35 cards) resolves via Cuelinks
console.log('\n[Test 3] Batch Verification: All 35 Credit Cards resolve via Cuelinks:');
let validCards = 0;
for (const card of CREDIT_CARDS) {
  const url = mgr.resolveUrl(card);
  if (!url.startsWith('https://linksredirect.com/?cid=317055&subid=instantcred_web&url=http')) {
    throw new Error(`Card ${card.id} failed Cuelinks resolution: ${url}`);
  }
  if (!card.affiliateUrl.startsWith('https://linksredirect.com/?cid=317055&subid=instantcred_web&url=http')) {
    throw new Error(`Card ${card.id} affiliateUrl in data is not Cuelinks: ${card.affiliateUrl}`);
  }
  validCards++;
}
console.log(`✓ All ${validCards}/35 credit cards successfully verified for Cuelinks Channel 317055.`);

// Test 4: All Personal Loans and Credit Score Offers resolve via Cuelinks
console.log('\n[Test 4] Loans & Credit Score Cuelinks Verification:');
for (const loan of PERSONAL_LOANS) {
  const url = mgr.resolveUrl(loan);
  if (!url.startsWith('https://linksredirect.com/?cid=317055&subid=instantcred_web&url=http')) {
    throw new Error(`Loan ${loan.id} failed Cuelinks resolution: ${url}`);
  }
}
for (const offer of CREDIT_SCORE_OFFERS) {
  const url = mgr.resolveUrl(offer);
  if (!url.startsWith('https://linksredirect.com/?cid=317055&subid=instantcred_web&url=http')) {
    throw new Error(`Credit score offer ${offer.id} failed Cuelinks resolution: ${url}`);
  }
}
console.log(`✓ All ${PERSONAL_LOANS.length} loans & ${CREDIT_SCORE_OFFERS.length} credit score offers successfully verified for Cuelinks.`);

// Test 5: Optional CP Rewritten mode
console.log('\n[Test 5] Cuelinks CP Rewritten mode:');
mgr.saveSettings({
  cuelinks: {
    redirectFormat: 'cprewritten',
    pubId: '271664',
    subId: 'custom_sub'
  }
});
const millennia = CREDIT_CARDS.find(c => c.id === 'hdfc-millennia');
const millenniaUrl = mgr.resolveUrl(millennia);
console.log('HDFC Millennia CP Rewritten URL:', millenniaUrl);
if (!millenniaUrl.startsWith('https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=271664&sub_id=custom_sub&url=')) {
  throw new Error('CP Rewritten resolution failed!');
}
console.log('✓ CP Rewritten mode passed.');

// Reset back to recommended LinksRedirect
mgr.saveSettings({
  cuelinks: {
    redirectFormat: 'linksredirect',
    channelId: '317055',
    subId: 'instantcred_web'
  }
});

// Test 6: Custom Link Override
console.log('\n[Test 6] Custom Link Override:');
mgr.saveSettings({
  customLinks: {
    'sbi-cashback': 'https://custom-partner-link.com/sbi?ref=special'
  }
});
const sbi = CREDIT_CARDS.find(c => c.id === 'sbi-cashback');
const sbiUrl = mgr.resolveUrl(sbi);
console.log('SBI custom URL:', sbiUrl);
if (sbiUrl !== 'https://custom-partner-link.com/sbi?ref=special') {
  throw new Error('Custom link override failed!');
}
console.log('✓ Custom link override passed.');

// Clear custom override
mgr.saveSettings({ customLinks: {} });

// Test 7: Outbound Click Logging (Exclusively Cuelinks)
console.log('\n[Test 7] Outbound Click Logging:');
mgr.logClick(moneyback, moneybackUrl, 'cuelinks');
const logs = mgr.getClickLogs();
console.log(`Logged clicks count: ${logs.length}`);
if (logs.length !== 1 || logs[0].network !== 'cuelinks') {
  throw new Error('Click logging failed!');
}
console.log('✓ Click logging exclusively records cuelinks network.');

// Test 8: Configuration Export
console.log('\n[Test 8] Configuration Export & Code Generator:');
const configJson = mgr.exportConfigJSON();
const parsed = JSON.parse(configJson);
if (parsed.primaryNetwork !== 'cuelinks' || !parsed.cuelinks || parsed.cuelinks.channelId !== '317055') {
  throw new Error('Export JSON failed!');
}
const configCode = mgr.generateConfigCode();
if (!configCode.includes('DEFAULT_AFFILIATE_CONFIG') || !configCode.includes('317055')) {
  throw new Error('Config code generator failed!');
}
console.log('✓ Configuration Export & Code generation passed.');

console.log('\n======================================================');
console.log('🎉 ALL CUELINKS AFFILIATE INTEGRATION TESTS PASSED 100%!');
console.log('======================================================\n');
