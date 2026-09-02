/**
 * Smart Rewards and Cashback Calculator Engine
 */

export class RewardsCalculator {
  constructor(cardsData) {
    this.cardsData = cardsData;
    this.spends = {
      online: 15000,
      dining: 6000,
      grocery: 8000,
      fuel: 4000,
      travel: 5000,
      bills: 4000
    };
  }

  updateSpend(category, amount) {
    this.spends[category] = Math.max(0, Number(amount) || 0);
  }

  getTotalMonthlySpend() {
    return Object.values(this.spends).reduce((sum, val) => sum + val, 0);
  }

  getTotalAnnualSpend() {
    return this.getTotalMonthlySpend() * 12;
  }

  calculateCardReturns(card) {
    const rates = card.rewardStructure || {
      online: 1,
      dining: 1,
      grocery: 1,
      fuel: 0,
      travel: 1,
      bills: 1,
      others: 1
    };

    // Calculate monthly earnings per category
    const monthlyCategoryEarnings = {
      online: (this.spends.online * (rates.online || 1)) / 100,
      dining: (this.spends.dining * (rates.dining || 1)) / 100,
      grocery: (this.spends.grocery * (rates.grocery || 1)) / 100,
      fuel: (this.spends.fuel * (rates.fuel || 0)) / 100,
      travel: (this.spends.travel * (rates.travel || 1)) / 100,
      bills: (this.spends.bills * (rates.bills || 1)) / 100
    };

    // Total monthly and gross annual earnings
    const monthlyGross = Object.values(monthlyCategoryEarnings).reduce((a, b) => a + b, 0);
    const annualGross = monthlyGross * 12;

    // Check if annual fee is waived based on total annual spends
    const totalAnnualSpend = this.getTotalAnnualSpend();
    let effectiveAnnualFee = card.annualFee;
    let feeWaived = false;

    if (card.isLifetimeFree || card.annualFee === 0) {
      effectiveAnnualFee = 0;
      feeWaived = true;
    } else if (card.feeWaiverSpend > 0 && totalAnnualSpend >= card.feeWaiverSpend) {
      effectiveAnnualFee = 0;
      feeWaived = true;
    }

    const netAnnualSavings = Math.round(annualGross - effectiveAnnualFee);

    return {
      card,
      monthlyGross: Math.round(monthlyGross),
      annualGross: Math.round(annualGross),
      effectiveAnnualFee,
      feeWaived,
      netAnnualSavings,
      breakdown: {
        online: Math.round(monthlyCategoryEarnings.online * 12),
        dining: Math.round(monthlyCategoryEarnings.dining * 12),
        grocery: Math.round(monthlyCategoryEarnings.grocery * 12),
        fuel: Math.round(monthlyCategoryEarnings.fuel * 12),
        travel: Math.round(monthlyCategoryEarnings.travel * 12),
        bills: Math.round(monthlyCategoryEarnings.bills * 12)
      }
    };
  }

  getRankedResults() {
    return this.cardsData
      .map(card => this.calculateCardReturns(card))
      .sort((a, b) => b.netAnnualSavings - a.netAnnualSavings);
  }
}
