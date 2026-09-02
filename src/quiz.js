/**
 * 30-Second Card Recommendation Wizard
 */

export class CardQuiz {
  constructor(cardsData) {
    this.cardsData = cardsData;
    this.currentStep = 1;
    this.totalSteps = 3;
    this.answers = {
      income: null,
      primarySpend: null,
      topPriority: null
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
    
    // Convert income range to numeric threshold
    let maxAllowedIncome = 25000;
    if (income === 'low') maxAllowedIncome = 30000;
    else if (income === 'mid') maxAllowedIncome = 60000;
    else if (income === 'high') maxAllowedIncome = 120000;
    else if (income === 'ultra') maxAllowedIncome = 500000;

    const scoredCards = this.cardsData.map(card => {
      let score = 0;
      let reasons = [];

      // 1. Income feasibility
      if (card.eligibility.minIncome <= maxAllowedIncome) {
        score += 25;
        if (income === 'low' && (card.categories.includes('Guaranteed Approval') || card.categories.includes('High Approval'))) {
          score += 20; // Extra boost for high acceptance cards on low income
          reasons.push('High approval odds for your income profile');
        }
      } else {
        score -= 50; // Penalty for out of budget
      }

      // 2. Primary Spend Category Match
      if (primarySpend === 'shopping' && card.categories.includes('Shopping')) {
        score += 35;
        reasons.push('High return on online shopping platforms');
      } else if (primarySpend === 'travel' && card.categories.includes('Travel & Miles')) {
        score += 40;
        reasons.push('Exceptional air miles and travel benefits');
      } else if (primarySpend === 'dining' && card.categories.includes('Dining & Food')) {
        score += 35;
        reasons.push('High cashback on dining and food deliveries');
      } else if (primarySpend === 'fuel' && card.categories.includes('Fuel Savers')) {
        score += 40;
        reasons.push('Maximum fuel savings & surcharge waivers');
      }

      // 3. Priority Match
      if (topPriority === 'ltf') {
        if (card.isLifetimeFree) {
          score += 40;
          reasons.push('Zero annual fee forever (Lifetime Free)');
        }
      } else if (topPriority === 'cashback') {
        if (card.categories.includes('Cashback')) {
          score += 30;
          reasons.push('Direct cashback into your statement');
        }
      } else if (topPriority === 'lounge') {
        if (card.loungeAccess.domestic > 0 || card.loungeAccess.international > 0) {
          score += 35;
          reasons.push('Complimentary airport lounge access');
        }
      } else if (topPriority === 'upi') {
        if (card.network === 'RuPay' || card.categories.includes('UPI & RuPay')) {
          score += 45;
          reasons.push('Direct QR scan & pay via UPI');
        }
      }

      // Rating boost
      score += (card.rating || 4.5) * 5;

      return {
        card,
        score,
        reasonText: reasons.slice(0, 2).join(' & ') || 'Great all-round card match'
      };
    });

    // Return top 2 cards
    return scoredCards
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }
}
