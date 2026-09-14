/**
 * InstantCred - 30-Second Personal Finance Decision Engine Wizard
 * Evaluates monthly salary, primary spend category, and core priority
 * to compute estimated annual cashback, fees, and true net benefit.
 */

export class CardQuiz {
  constructor(cardsData) {
    this.cardsData = cardsData;
    this.currentStep = 1;
    this.totalSteps = 3;
    this.answers = {
      income: 'tier-25k-40k',
      primarySpend: 'shopping',
      topPriority: 'cashback'
    };
  }

  reset() {
    this.currentStep = 1;
    this.answers = {
      income: null,
      primarySpend: null,
      topPriority: null
    };
  }

  setAnswer(stepKey, value) {
    this.answers[stepKey] = value;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      return true;
    }
    return false;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      return true;
    }
    return false;
  }

  getMatchedCards() {
    const { income, primarySpend, topPriority } = this.answers;
    
    // Map income tiers to maximum allowed underwriting income & estimated monthly card spend
    let maxIncome = 35000;
    let estimatedMonthlySpend = 18000;

    switch (income) {
      case 'tier-15k-25k':
        maxIncome = 25000;
        estimatedMonthlySpend = 10000;
        break;
      case 'tier-25k-40k':
        maxIncome = 40000;
        estimatedMonthlySpend = 18000;
        break;
      case 'tier-40k-60k':
        maxIncome = 60000;
        estimatedMonthlySpend = 30000;
        break;
      case 'tier-60k-1l':
        maxIncome = 100000;
        estimatedMonthlySpend = 48000;
        break;
      case 'tier-1l-plus':
        maxIncome = 500000;
        estimatedMonthlySpend = 85000;
        break;
      default:
        maxIncome = 40000;
        estimatedMonthlySpend = 20000;
    }

    const scoredCards = this.cardsData.map(card => {
      let score = 0;
      let reasons = [];
      const annualFee = card.isLifetimeFree ? 0 : (card.annualFee || 0);

      // 1. Income Feasibility Check
      const minRequired = card.eligibility?.minIncome || 0;
      if (minRequired <= maxIncome) {
        score += 35;
        if (minRequired === 0 || card.isLifetimeFree) {
          reasons.push('High eligibility feasibility for your income tier');
        }
      } else {
        // High penalty if user income is strictly below bank requirement
        score -= 60;
      }

      // 2. Spend Category Multiplier Match & Reward Rate Calculation
      let rewardRate = 1.5; // Baseline conservative reward rate
      const struct = card.rewardStructure || {};

      if (primarySpend === 'shopping') {
        rewardRate = struct.online || (card.categories.includes('Shopping') ? 4.0 : 1.5);
        if (card.categories.includes('Shopping') || card.id.includes('cashback') || card.id.includes('amazon') || card.id.includes('flipkart')) {
          score += 40;
          reasons.push('Accelerated 5% cashback on online e-commerce platforms');
        }
      } else if (primarySpend === 'dining') {
        rewardRate = struct.dining || (card.categories.includes('Dining & Food') ? 4.0 : 1.5);
        if (card.categories.includes('Dining & Food') || card.id.includes('swiggy') || card.id.includes('myzone')) {
          score += 40;
          reasons.push('High cashback on dining out & Swiggy/Zomato deliveries');
        }
      } else if (primarySpend === 'fuel') {
        rewardRate = struct.fuel || (card.categories.includes('Fuel Savers') ? 4.0 : 1.0);
        if (card.categories.includes('Fuel Savers') || card.id.includes('bpcl') || card.fuelSurchargeWaiver) {
          score += 45;
          reasons.push('Fuel surcharge waiver & accelerated fuel reward points');
        }
      } else if (primarySpend === 'travel') {
        rewardRate = struct.travel || (card.categories.includes('Travel & Miles') ? 5.0 : 1.5);
        if (card.categories.includes('Travel & Miles') || card.forexMarkup === '0.0%' || card.id.includes('atlas') || card.id.includes('scapia')) {
          score += 45;
          reasons.push('Air miles transfer ratios, low forex markup & travel privileges');
        }
      } else if (primarySpend === 'upi') {
        rewardRate = card.network === 'RuPay' ? 2.5 : 1.0;
        if (card.network === 'RuPay' || card.categories.includes('UPI & RuPay')) {
          score += 50;
          reasons.push('Direct RuPay UPI linking for everyday merchant QR payments');
        }
      } else if (primarySpend === 'bills') {
        rewardRate = struct.bills || (card.id.includes('airtel') ? 10.0 : 2.0);
        if (card.id.includes('airtel') || card.categories.includes('Cashback')) {
          score += 40;
          reasons.push('High return on utility bills and recharges');
        }
      } else {
        // Everything / balanced
        rewardRate = (struct.online || 2.0) * 0.5 + (struct.others || 1.0) * 0.5;
        score += 25;
        reasons.push('Balanced rewards across grocery, shopping and daily spends');
      }

      // 3. User Priority Boost
      if (topPriority === 'cashback') {
        if (card.categories.includes('Cashback') || card.id.includes('cashback') || card.id.includes('millennia')) {
          score += 35;
          reasons.push('Direct statement credit with transparent monthly cash deduction');
        }
      } else if (topPriority === 'ltf') {
        if (card.isLifetimeFree) {
          score += 45;
          reasons.push('Zero joining & zero annual maintenance fee forever');
        } else {
          score -= 15;
        }
      } else if (topPriority === 'lounge') {
        const domestic = card.loungeAccess?.domestic || 0;
        if (domestic > 0) {
          score += 40;
          reasons.push(`Complimentary domestic airport lounge visits (${domestic}/quarter)`);
        } else {
          score -= 10;
        }
      } else if (topPriority === 'upi') {
        if (card.network === 'RuPay' || card.categories.includes('UPI & RuPay')) {
          score += 45;
          reasons.push('Official RuPay credit line linked to Google Pay / PhonePe');
        }
      } else if (topPriority === 'travel') {
        if (card.categories.includes('Travel & Miles')) {
          score += 35;
          reasons.push('Travel insurance, air miles & global hotel partnerships');
        }
      } else if (topPriority === 'low-fee') {
        if (annualFee <= 500) {
          score += 35;
          reasons.push('Budget-friendly annual fee with easy spend-based waivers');
        }
      }

      // Quality rating bonus
      score += (card.rating || 4.5) * 6;

      // Realistic Net Benefit Math
      // Cap rate between 1.0% and 8.0% for realistic calculation
      const effectiveRate = Math.min(8.0, Math.max(1.0, rewardRate));
      const estimatedAnnualRewards = Math.round(estimatedMonthlySpend * (effectiveRate / 100) * 12);
      
      // Check if user's estimated annual spend easily waives the fee
      const annualSpend = estimatedMonthlySpend * 12;
      const feeWaiverSpend = card.feeWaiverSpend || 0;
      const isFeeWaived = (feeWaiverSpend > 0 && annualSpend >= feeWaiverSpend) || card.isLifetimeFree;
      const effectiveAnnualFee = isFeeWaived ? 0 : annualFee;
      const netAnnualBenefit = Math.max(1200, estimatedAnnualRewards - effectiveAnnualFee);

      return {
        card,
        score,
        estimatedAnnualRewards,
        annualFee: card.annualFee || 0,
        isLifetimeFree: card.isLifetimeFree,
        isFeeWaived,
        effectiveAnnualFee,
        netAnnualBenefit,
        bestFor: card.primaryCategory || card.categories[0] || 'All-Round Spends',
        reasonText: reasons.slice(0, 2).join(' • ') || 'Strong overall match for your financial profile'
      };
    });

    // Sort by algorithmic score descending
    const sorted = scoredCards.sort((a, b) => b.score - a.score);

    // Pick Top 3 Cards ensuring variety
    const top3 = [];
    const usedIds = new Set();

    if (sorted[0]) {
      top3.push({
        ...sorted[0],
        rank: 1,
        rankBadge: '🥇 BEST MATCH',
        rankClass: 'rank-best-match'
      });
      usedIds.add(sorted[0].card.id);
    }

    // Runner up (highest score not used)
    for (let i = 1; i < sorted.length; i++) {
      if (!usedIds.has(sorted[i].card.id)) {
        top3.push({
          ...sorted[i],
          rank: 2,
          rankBadge: '🥈 HIGH VALUE RUNNER-UP',
          rankClass: 'rank-runner-up'
        });
        usedIds.add(sorted[i].card.id);
        break;
      }
    }

    // Third card: prefer a Lifetime Free or low-fee alternative if not already in top 2
    let thirdCard = sorted.find(item => !usedIds.has(item.card.id) && (item.card.isLifetimeFree || (item.card.annualFee || 0) <= 500));
    if (!thirdCard) {
      thirdCard = sorted.find(item => !usedIds.has(item.card.id));
    }

    if (thirdCard) {
      top3.push({
        ...thirdCard,
        rank: 3,
        rankBadge: thirdCard.card.isLifetimeFree ? '🥉 BEST LIFETIME FREE' : '🥉 SMART BUDGET ALTERNATIVE',
        rankClass: 'rank-alternative'
      });
    }

    return top3;
  }
}

