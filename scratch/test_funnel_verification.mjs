import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CardQuiz } from '../src/quiz.js';
import { CREDIT_CARDS } from '../src/data/cards.js';
import { PERSONAL_LOANS } from '../src/data/loans.js';

console.log('--- InstantCred Funnel & Logic Verification ---');

// 1. Check index.html for eliminated diagnostics & added trust elements
const html = readFileSync(resolve('./index.html'), 'utf8');

const checks = [
  { name: 'Public gear icon removed', pass: !html.includes('btnOpenAffiliateModal') },
  { name: 'Fake maintenance gate removed', pass: !html.includes('Banking Partner Gateway v2.4 Upgrade in Progress') },
  { name: 'Fake tokenization text removed', pass: !html.includes('RBI Tokenization Handshake') },
  { name: 'Admin passphrase prompt removed from public UI', pass: !html.includes('Administrative Access Passphrase') },
  { name: 'Hero Decision Engine copy present', pass: html.toLowerCase().includes('which credit card is actually best for you?') },
  { name: 'Hero primary CTA present', pass: html.includes('Find My Card (30-Sec Smart Match)') },
  { name: 'Popular searches strip present', pass: html.includes('popularSearchesContainer') && html.includes('Under ₹30k Salary') },
  { name: 'Why Trust InstantCred section present', pass: html.includes('Why Trust InstantCred?') && html.includes('Independent Mathematical Model') },
  { name: 'Sort dropdown feasibility text clean', pass: html.includes('High Eligibility Feasibility') },
];

let allPassed = true;
checks.forEach(c => {
  if (c.pass) {
    console.log(`✅ ${c.name}`);
  } else {
    console.error(`❌ FAILED: ${c.name}`);
    allPassed = false;
  }
});

// 2. Test Smart Match Quiz Logic
console.log('\n--- Testing CardQuiz Engine ---');
const quizA = new CardQuiz(CREDIT_CARDS);
quizA.setAnswer('income', 'tier-25k-40k');
quizA.setAnswer('spend', 'shopping');
quizA.setAnswer('priority', 'cashback');
const resultsA = quizA.getMatchedCards();

console.log(`Scenario A (30k salary, online shopping, cashback) -> ${resultsA.length} cards matched:`);
resultsA.forEach(c => {
  console.log(`  [Rank ${c.rank}] ${c.card.name} (${c.card.bank}) | Net Benefit: ₹${c.netAnnualBenefit} (Rewards: ₹${c.estimatedAnnualRewards} - Fee: ₹${c.effectiveAnnualFee}) | Best For: ${c.bestFor}`);
});

if (resultsA.length === 3 && resultsA[0].rank === 1 && resultsA[0].netAnnualBenefit > 0) {
  console.log('✅ Scenario A passed: Top 3 cards returned with realistic positive net benefits');
} else {
  console.error('❌ Scenario A failed!');
  allPassed = false;
}

// Scenario B: ₹20k salary beginner, UPI rewards, lifetime free priority
const quizB = new CardQuiz(CREDIT_CARDS);
quizB.setAnswer('income', 'tier-15k-25k');
quizB.setAnswer('spend', 'upi');
quizB.setAnswer('priority', 'ltf');
const resultsB = quizB.getMatchedCards();

console.log(`\nScenario B (20k salary, UPI, lifetime free) -> ${resultsB.length} cards matched:`);
resultsB.forEach(c => {
  console.log(`  [Rank ${c.rank}] ${c.card.name} (${c.card.bank}) | Fee: ₹${c.effectiveAnnualFee} | Best For: ${c.bestFor}`);
});

if (resultsB.length === 3 && resultsB.some(c => c.effectiveAnnualFee === 0)) {
  console.log('✅ Scenario B passed: Lifetime free cards prioritized for low-income/free preference');
} else {
  console.error('❌ Scenario B failed!');
  allPassed = false;
}

// 3. Test Loans data for softened claims
console.log('\n--- Testing Loans Data Claims ---');
const loansAggressivePhrases = [
  '100% digital',
  '100% online approval',
  '2-hour disbursal',
  'guaranteed'
];

let aggressiveFound = false;
PERSONAL_LOANS.forEach(loan => {
  const text = JSON.stringify(loan).toLowerCase();
  loansAggressivePhrases.forEach(phrase => {
    if (text.includes(phrase)) {
      console.warn(`⚠️ Warning: Found '${phrase}' in loan ${loan.name}`);
      aggressiveFound = true;
    }
  });
});

if (!aggressiveFound) {
  console.log('✅ All loan claims successfully softened to compliant language');
} else {
  console.warn('⚠️ Some phrases found, please review');
}

console.log(`\nAll checks completed: ${allPassed ? 'ALL PASSED 🎉' : 'FAILURES DETECTED'}`);
process.exit(allPassed ? 0 : 1);
