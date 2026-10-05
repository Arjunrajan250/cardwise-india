import { CREDIT_CARDS, CATEGORIES, BANKS, NETWORKS } from './data/cards.js';
import { CREDIT_SCORE_OFFERS, PERSONAL_LOANS } from './data/loans.js';
import { CardComparator } from './comparator.js';
import { RewardsCalculator } from './calculator.js';
import { CardQuiz } from './quiz.js';
import { affiliateManager } from './affiliate.js';
import { BlogManager } from './blog.js';
import { ICONS } from './icons.js';

class App {
  constructor() {
    this.allCards = CREDIT_CARDS;
    this.updateActiveCards();
    this.creditScoreOffers = CREDIT_SCORE_OFFERS;
    this.personalLoans = PERSONAL_LOANS;
    this.filteredCards = [...this.cards];
    this.activeCategory = 'all';
    this.selectedBank = 'all';
    this.selectedFeeTier = 'all';
    this.selectedNetwork = 'all';
    this.searchQuery = '';
    this.sortBy = 'popularity';

    // Sub-systems
    this.comparator = new CardComparator(this.cards, () => this.updateComparatorUI());
    this.calculator = new RewardsCalculator(this.cards);
    this.quiz = new CardQuiz(this.cards);
    this.blog = new BlogManager(affiliateManager);

    this.affiliateManager = affiliateManager;
    this.init();
  }

  updateActiveCards() {
    const shouldHide = affiliateManager.settings.hideNonAffiliateCards !== false;
    if (shouldHide) {
      this.cards = this.allCards.filter(c => c.hasAffiliate !== false);
    } else {
      this.cards = [...this.allCards];
    }
  }

  init() {
    this.renderCategoryChips();
    this.renderTopPicks();
    this.populateFilterDropdowns();
    this.applyFilters();
    this.initCalculator();
    this.initCreditScoreSection();
    this.initLoansSection();
    this.initLoanCalculator();
    this.initScrollSpy();
    this.bindEvents();
    this.initAffiliateControlCenter();
  }

  /* --------------------------------------------------------------------------
     1. Category Cards & Top Picks
     -------------------------------------------------------------------------- */
  renderCategoryChips() {
    const container = document.getElementById('categoryChipsContainer');
    if (!container) return;

    const nineCategories = [
      {
        id: 'all',
        label: 'All Cards',
        subtitle: `${this.cards.length}+ Cards`,
        badge: 'TOP',
        theme: 'theme-all',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>`
      },
      {
        id: 'Cashback',
        label: 'Cashback',
        subtitle: 'Up to 10%',
        badge: 'HOT',
        theme: 'theme-cashback',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 15 6-6"></path><circle cx="9.5" cy="9.5" r="1.5" fill="currentColor"></circle><circle cx="14.5" cy="14.5" r="1.5" fill="currentColor"></circle></svg>`
      },
      {
        id: 'Lifetime Free',
        label: 'Zero Fee',
        subtitle: 'Lifetime Free',
        badge: '₹0 FEE',
        theme: 'theme-free',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`
      },
      {
        id: 'Travel & Miles',
        label: 'Travel',
        subtitle: 'Lounge & Miles',
        badge: 'MILES',
        theme: 'theme-travel',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.7-.1-1.3.2-1.6.8l-.5 1 5.4 3.7-3.8 3.8-2.6-.6c-.5-.1-1 .1-1.3.5l-.2.3 3.5 2.1 2.1 3.5.3-.2c.4-.3.6-.8.5-1.3l-.6-2.6 3.8-3.8 3.7 5.4 1-.5c.6-.3.9-.9.8-1.6z"></path></svg>`
      },
      {
        id: 'UPI & RuPay',
        label: 'UPI Cards',
        subtitle: 'Scan & Pay',
        badge: 'RUPAY',
        theme: 'theme-upi',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
      },
      {
        id: 'Fuel Savers',
        label: 'Fuel Savers',
        subtitle: 'Waiver & Cash',
        badge: 'FUEL',
        theme: 'theme-fuel',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h12"></path><path d="M4 9h10"></path><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path></svg>`
      },
      {
        id: 'Shopping',
        label: 'Shopping',
        subtitle: 'Amazon & More',
        badge: 'SALE',
        theme: 'theme-shopping',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`
      },
      {
        id: 'Dining & Food',
        label: 'Food & Dining',
        subtitle: 'Swiggy, Zomato',
        badge: 'FOOD',
        theme: 'theme-dining',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path></svg>`
      },
      {
        id: 'Super Premium',
        altId: 'Lounge',
        label: 'Metal & VIP',
        subtitle: 'Concierge',
        badge: 'VIP',
        theme: 'theme-premium',
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z"></path><path d="M11 3 8 9l4 12 4-12-3-6"></path></svg>`
      }
    ];

    container.innerHTML = nineCategories.map(cat => {
      const isActive = this.activeCategory === cat.id || (cat.altId && this.activeCategory === cat.altId);
      return `
        <button type="button" class="category-card-btn ${cat.theme} ${isActive ? 'active' : ''}" data-category-id="${cat.id}">
          ${cat.badge ? `<span class="cat-micro-badge ${cat.theme}">${cat.badge}</span>` : ''}
          <div class="cat-icon-bubble ${cat.theme}">
            ${cat.icon}
          </div>
          <span class="cat-btn-label">${cat.label}</span>
          <span class="cat-btn-sub">${cat.subtitle}</span>
        </button>
      `;
    }).join('');

    const availableCategories = CATEGORIES.filter(cat => {
      if (cat.id === 'all') return true;
      return this.cards.some(card => 
        card.primaryCategory === cat.id || (card.categories && card.categories.includes(cat.id))
      );
    });
    this.renderCategoryPickerModal(availableCategories);
  }

  renderTopPicks() {
    const container = document.getElementById('topPicksCardsContainer');
    if (!container) return;

    const picks = [
      {
        id: 'hdfc-millennia',
        badge: '🏆 Top Ranked 2026',
        badgeClass: 'badge-gold',
        name: 'HDFC Millennia Credit Card',
        desc: '5% cashback on Amazon, Flipkart, Swiggy & Zomato',
        estVal: '₹13,600',
        rating: '4.7',
        reviews: '(12.4K reviews)',
        img: '/images/cards/hdfc-millennia.webp',
        perk1: '5% Instant CashBack',
        perk2: '1,000 Milestone Bonus'
      },
      {
        id: 'sbi-cashback',
        badge: '🌱 #1 Online Spends',
        badgeClass: 'badge-emerald',
        name: 'SBI Cashback Credit Card',
        desc: '5% flat cashback on all online merchants with zero merchant locking',
        estVal: '₹12,800',
        rating: '4.6',
        reviews: '(9.8K reviews)',
        img: '/images/cards/sbi-cashback.webp',
        perk1: '5% Flat Online Cashback',
        perk2: 'Auto-credited to bill'
      },
      {
        id: 'idfc-first-wow',
        badge: '♾️ Guaranteed Approval',
        badgeClass: 'badge-purple',
        name: 'IDFC FIRST WOW Credit Card',
        desc: 'Zero Forex markup + 100% approval against ₹2,000 FD',
        estVal: '₹14,400',
        rating: '4.9',
        reviews: '(4.2K reviews)',
        img: '/images/cards/idfc-first-wow.webp',
        perk1: 'Zero Annual Fee Forever',
        perk2: 'Zero Forex Fee Abroad'
      },
      {
        id: 'axis-atlas',
        badge: '✈️ Ultimate Luxury',
        badgeClass: 'badge-cyan',
        name: 'Axis Atlas Credit Card',
        desc: 'Tiered EDGE Miles, complimentary domestic & international lounge access',
        estVal: '₹28,500',
        rating: '4.8',
        reviews: '(6.1K reviews)',
        img: '/images/cards/axis-atlas.webp',
        perk1: '5X Travel EDGE Miles',
        perk2: 'Unlimited Airport Lounges'
      }
    ];

    container.innerHTML = picks.map(item => `
      <div class="top-pick-card" data-open-card-id="${item.id}" title="View ${item.name} details">
        <div class="top-pick-header-strip">
          <span class="top-pick-badge ${item.badgeClass}">${item.badge}</span>
          <span class="top-pick-rating-tag"><span class="star-gold">★</span> ${item.rating}</span>
        </div>
        <div class="top-pick-main-content">
          <div class="top-pick-thumb-wrap">
            <img src="${item.img}" alt="${item.name}" class="top-pick-thumb-img" loading="lazy" />
          </div>
          <div class="top-pick-details">
            <h4 class="top-pick-card-name">${item.name}</h4>
            <p class="top-pick-desc">${item.desc}</p>
          </div>
        </div>
        <div class="top-pick-perks-row">
          <span class="top-pick-mini-pill">✓ ${item.perk1}</span>
          <span class="top-pick-mini-pill">✓ ${item.perk2}</span>
        </div>
        <div class="top-pick-footer-bar">
          <div class="top-pick-val-block">
            <span class="val-sub">Net Annual Value</span>
            <span class="val-num">${item.estVal}<small>/yr</small></span>
          </div>
          <button type="button" class="btn-top-pick-explore" data-open-card-id="${item.id}">
            <span>View Card</span>
            <span class="arrow-sym">→</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  renderCategoryPickerModal(availableCategories) {
    const modalBody = document.getElementById('categoryPickerModalBody');
    if (!modalBody) return;

    const iconMap = {
      'all': ICONS.catAll,
      'Guaranteed Approval': ICONS.catGuaranteed,
      'High Approval': ICONS.catHighApproval,
      'Cashback': ICONS.catCashback,
      'Lifetime Free': ICONS.catLifetimeFree,
      'Travel & Miles': ICONS.catTravel,
      'Lounge': ICONS.catLounge,
      'Dining & Food': ICONS.catDining,
      'Shopping': ICONS.catShopping,
      'UPI & RuPay': ICONS.catUpi,
      'Fuel Savers': ICONS.catFuel,
      'Super Premium': ICONS.catSuperPremium
    };

    const itemsHtml = availableCategories.map(cat => {
      const icon = iconMap[cat.id] || ICONS.tagFolder;
      const isActive = cat.id === this.activeCategory;
      const cardCount = cat.id === 'all' 
        ? this.cards.length 
        : this.cards.filter(c => c.primaryCategory === cat.id || (c.categories && c.categories.includes(cat.id))).length;

      return `
        <button type="button" class="category-sheet-item ${isActive ? 'active' : ''}" data-sheet-category-id="${cat.id}">
          <div class="category-sheet-item-left">
            <span class="category-sheet-item-icon">${icon}</span>
            <span class="category-sheet-item-name">${cat.label}</span>
          </div>
          <div class="category-sheet-item-right">
            <span class="category-sheet-item-count">${cardCount} ${cardCount === 1 ? 'card' : 'cards'}</span>
            ${isActive ? `<span class="category-sheet-item-check" aria-label="Selected">${ICONS.check}</span>` : ''}
          </div>
        </button>
      `;
    }).join('');

    modalBody.innerHTML = `
      <div class="category-sheet-list">
        ${itemsHtml}
      </div>
    `;
  }

  populateFilterDropdowns() {
    const bankSelect = document.getElementById('bankFilterSelect');
    if (bankSelect) {
      const activeBanks = [...new Set(this.cards.map(c => c.bank))].sort();
      const bankOptions = activeBanks.map(b => `<option value="${b}">${b}</option>`).join('');
      bankSelect.innerHTML = `<option value="all">All Banks</option>${bankOptions}`;
    }

    const networkSelect = document.getElementById('networkFilterSelect');
    if (networkSelect) {
      const netOptions = NETWORKS.filter(n => this.cards.some(c => c.network?.includes(n)))
        .map(n => `<option value="${n}">${n}</option>`).join('');
      networkSelect.innerHTML = `<option value="all">All Networks</option>${netOptions}`;
    }
  }

  applyFilters() {
    let result = [...this.cards];

    // 1. Category Filter
    if (this.activeCategory !== 'all') {
      result = result.filter(card => 
        card.primaryCategory === this.activeCategory || 
        card.categories.includes(this.activeCategory)
      );
    }

    // 2. Bank Filter
    if (this.selectedBank !== 'all') {
      result = result.filter(card => 
        card.bank === this.selectedBank || 
        card.bank.includes(this.selectedBank) || 
        this.selectedBank.includes(card.bank)
      );
    }

    // 3. Fee Tier Filter
    if (this.selectedFeeTier === 'free') {
      result = result.filter(card => card.isLifetimeFree || card.annualFee === 0);
    } else if (this.selectedFeeTier === 'under1k') {
      result = result.filter(card => card.annualFee > 0 && card.annualFee <= 1000);
    } else if (this.selectedFeeTier === '1k-5k') {
      result = result.filter(card => card.annualFee > 1000 && card.annualFee <= 5000);
    } else if (this.selectedFeeTier === 'premium') {
      result = result.filter(card => card.annualFee > 5000);
    }

    // 4. Network Filter
    if (this.selectedNetwork !== 'all') {
      result = result.filter(card => card.network === this.selectedNetwork);
    }

    // 5. Search Query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(card => 
        card.name.toLowerCase().includes(q) ||
        card.bank.toLowerCase().includes(q) ||
        card.cashbackSummary.toLowerCase().includes(q) ||
        card.keyPerks.some(perk => perk.toLowerCase().includes(q)) ||
        card.categories.some(cat => cat.toLowerCase().includes(q))
      );
    }

    // 6. Sorting
    if (this.sortBy === 'popularity') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
    } else if (this.sortBy === 'approval-odds') {
      result.sort((a, b) => (b.approvalOddsScore || 50) - (a.approvalOddsScore || 50));
    } else if (this.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'fee-low') {
      result.sort((a, b) => a.annualFee - b.annualFee);
    } else if (this.sortBy === 'fee-high') {
      result.sort((a, b) => b.annualFee - a.annualFee);
    }

    this.filteredCards = result;
    this.renderCards();
    this.updateResultsCount();
  }

  updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${this.filteredCards.length}</strong> of ${this.cards.length} Credit Cards`;
    }
  }

  /* --------------------------------------------------------------------------
     2. Card Rendering & Helpers
     -------------------------------------------------------------------------- */
  getCardBanner(card) {
    if (card.id === 'hdfc-millennia' || card.tag?.toLowerCase().includes('top') || card.tag?.toLowerCase().includes('popular')) {
      return { icon: '🏠', text: 'Popular Choice', cssClass: 'badge-caramel' };
    }
    if (card.approvalTier === 'guaranteed' || card.categories?.includes('Guaranteed Approval')) {
      return { icon: '🎓', text: 'FD Backed (Student Friendly)', cssClass: 'badge-purple' };
    }
    if (card.approvalOddsScore >= 90 || card.approvalTier === 'high' || card.tag?.toLowerCase().includes('high approval')) {
      return { icon: '👍', text: 'High Approval', cssClass: 'badge-green' };
    }
    if (card.isLifetimeFree || card.annualFee === 0) {
      return { icon: '♾️', text: 'Lifetime Free', cssClass: 'badge-teal' };
    }
    if (card.categories?.includes('Travel & Miles') || card.annualFee >= 5000) {
      return { icon: '✈️', text: 'Best for Travel', cssClass: 'badge-rose' };
    }
    return { icon: '⭐', text: card.tag || 'Recommended', cssClass: 'badge-neutral' };
  }

  getCardBenefitChips(card) {
    if (card.id === 'hdfc-millennia') {
      return ['10% Online', '1% Other', '5% Travel'];
    }
    if (card.id === 'sbi-cashback') {
      return ['5% Online', '1% Other', 'RuPay UPI'];
    }
    if (card.id === 'idfc-first-wow') {
      return ['Lifetime Free', 'Zero Forex', 'Global Use'];
    }
    if (card.id === 'axis-atlas') {
      return ['5X Miles', 'Tier Upgrades', '18+ Lounges'];
    }
    if (card.id === 'airtel-axis') {
      return ['25% Airtel', '10% Utilities', '10% Swiggy'];
    }
    if (card.id === 'tata-neu-infinity') {
      return ['10% NeuCoins', 'RuPay UPI', 'Tata Brands'];
    }
    if (card.id === 'amazon-pay-icici') {
      return ['5% Amazon', 'Lifetime Free', 'Zero Surcharge'];
    }
    if (card.id === 'swiggy-hdfc') {
      return ['10% Swiggy', '5% Top Apps', '1% Other'];
    }

    const chips = [];
    if (card.isLifetimeFree) chips.push('Lifetime Free');
    if (card.rewardStructure?.online) chips.push(`${card.rewardStructure.online}% Online`);
    if (card.rewardStructure?.dining) chips.push(`${card.rewardStructure.dining}% Dining`);
    if (card.rewardStructure?.travel && chips.length < 3) chips.push(`${card.rewardStructure.travel}% Travel`);
    if (card.network?.includes('RuPay') && chips.length < 3) chips.push('RuPay UPI');
    if (card.forexMarkup?.includes('0') && chips.length < 3) chips.push('Zero Forex');
    if (card.loungeAccess?.domestic > 0 && chips.length < 3) chips.push(`${card.loungeAccess.domestic} Lounges/yr`);
    if (chips.length < 3) chips.push('1% Other');
    return chips.slice(0, 3);
  }

  getCardBestFor(card) {
    if (card.id === 'hdfc-millennia') return 'Online shopping, everyday spends';
    if (card.id === 'sbi-cashback') return 'Online shopping, cashback lovers';
    if (card.id === 'idfc-first-wow') return 'Students, first-time applicants, international use';
    if (card.id === 'axis-atlas') return 'Frequent domestic & international travelers';
    if (card.id === 'airtel-axis') return 'Airtel users, utility bill payments & food delivery';
    if (card.id === 'tata-neu-infinity') return 'Tata ecosystem shoppers & UPI transactions';
    if (card.id === 'amazon-pay-icici') return 'Amazon Prime members & zero fee seekers';
    if (card.id === 'swiggy-hdfc') return 'Swiggy food delivery, Instamart & dining out';

    if (card.primaryCategory === 'Guaranteed Approval') return 'First-time users & credit score building';
    if (card.primaryCategory === 'Cashback') return 'Direct cashback on retail & online spends';
    if (card.primaryCategory === 'Travel & Miles') return 'Flights, hotel stays & airline miles';
    if (card.primaryCategory === 'Lifetime Free') return 'Zero maintenance fee & beginner spending';
    if (card.primaryCategory === 'Fuel Savers') return 'Fuel surcharge savings & petrol pumps';
    if (card.primaryCategory === 'Super Premium') return 'Luxury travel, airport lounge & concierge';
    return 'Everyday retail spends & rewards';
  }

  getCardEstimatedAnnualValue(card) {
    if (card.id === 'hdfc-millennia') return '13,600';
    if (card.id === 'sbi-cashback') return '12,800';
    if (card.id === 'idfc-first-wow') return '14,400';
    if (card.id === 'axis-atlas') return '28,500';
    if (card.isLifetimeFree) return '14,400';
    if (card.annualFee > 5000) return '26,500';
    if (card.annualFee > 1500) return '18,200';
    return '11,200';
  }

  renderCards() {
    const grid = document.getElementById('cardGrid');
    if (!grid) return;

    if (this.filteredCards.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No matching credit cards found</h3>
          <p>Try clearing filters or searching for terms like 'Cashback', 'Lounge', or 'SBI'.</p>
          <button type="button" class="btn btn-primary" id="btnResetAllFilters">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredCards.map(card => {
      const isSelectedForCompare = this.comparator.isSelected(card.id);
      const banner = this.getCardBanner(card);
      const benefitChips = this.getCardBenefitChips(card);
      const estAnnualVal = this.getCardEstimatedAnnualValue(card);
      const bestForText = this.getCardBestFor(card);

      const chipsHtml = benefitChips.map(ch => `<span class="benefit-chip">${ch}</span>`).join('');

      return `
        <article class="card-item" data-card-id="${card.id}">
          <!-- Card Top Bar: Banner Badge Left & Rating Pill Right -->
          <div class="card-top-bar">
            <div class="card-banner-badge ${banner.cssClass}">
              <span class="badge-icon">${banner.icon}</span>
              <span>${banner.text}</span>
            </div>
            <div class="card-rating-pill">
              <span class="rating-star">★</span>
              <span class="rating-val">${card.rating.toFixed(1)}</span>
            </div>
          </div>

          <!-- Main Content Row: Card Artwork Left & Details Right -->
          <div class="card-main-row">
            <div class="card-thumb-column" data-open-card-id="${card.id}" title="View ${card.name} specifications">
              <div class="credit-card-visual theme-${card.cardTheme} ${card.imageUrl ? 'has-real-image' : ''} ${card.isVertical ? 'is-vertical' : ''}">
                ${card.imageUrl ? `
                  <img 
                    src="${card.imageUrl}" 
                    alt="${card.name}" 
                    class="credit-card-real-img" 
                    loading="lazy" 
                    onerror="this.style.display='none'; const fb = this.nextElementSibling; if (fb) fb.style.display='flex';"
                  />
                  <div class="card-css-fallback" style="display: none;">
                    <div class="card-top-row">
                      <span class="bank-name-label">${card.bank}</span>
                      <span class="contactless-icon">${ICONS.contactless}</span>
                    </div>
                    <div class="card-middle-row">
                      <div class="emv-chip"></div>
                    </div>
                    <div class="card-bottom-row">
                      <span class="card-title-preview">${card.name}</span>
                      <span class="network-badge">${card.network}</span>
                    </div>
                  </div>
                ` : `
                  <div class="card-top-row">
                    <span class="bank-name-label">${card.bank}</span>
                    <span class="contactless-icon">${ICONS.contactless}</span>
                  </div>
                  <div class="card-middle-row">
                    <div class="emv-chip"></div>
                  </div>
                  <div class="card-bottom-row">
                    <span class="card-title-preview">${card.name}</span>
                    <span class="network-badge">${card.network}</span>
                  </div>
                `}
              </div>
            </div>

            <div class="card-info-column">
              <h3 class="card-title-text" data-open-card-id="${card.id}" title="View details">${card.name}</h3>
              <p class="card-subtitle-text">${card.cashbackSummary}</p>

              <!-- 3 Benefit Chips -->
              <div class="card-benefit-chips-row">
                ${chipsHtml}
              </div>

              <!-- Fees Grid (Joining & Annual) -->
              <div class="card-fees-row">
                <div class="fee-col">
                  <span class="fee-label">Joining Fee</span>
                  <span class="fee-value ${card.joiningFee === 0 ? 'fee-free' : ''}">
                    ${card.joiningFee === 0 ? 'FREE' : `₹${card.joiningFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div class="fee-col">
                  <span class="fee-label">Annual Fee</span>
                  <span class="fee-value ${card.annualFee === 0 ? 'fee-free' : ''}">
                    ${card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                  </span>
                  <span class="fee-sub">
                    ${card.annualFee === 0 ? '(No annual fee)' : (card.feeWaiverSpend > 0 ? `(waived on ₹${(card.feeWaiverSpend / 100000).toFixed(1)}L spend)` : '')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Metrics Box -->
          <div class="card-metrics-box">
            <div class="metric-val-col">
              <span class="metric-box-label">Estimated annual value</span>
              <div class="metric-box-highlight">
                <span class="metric-currency-val">₹${estAnnualVal}</span>
              </div>
              <span class="metric-box-sub">after annual fees</span>
            </div>
            <div class="metric-best-col">
              <span class="metric-box-label">Best for</span>
              <p class="metric-best-text">${bestForText}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-action-buttons">
            <button type="button" class="btn btn-apply-dark btn-outbound-apply" data-card-id="${card.id}">
              <span>Check Eligibility</span>
              <span class="btn-arrow">→</span>
            </button>
            <button type="button" class="btn btn-compare-outline btn-compare ${isSelectedForCompare ? 'selected' : ''}" data-compare-id="${card.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>Compare</span>
            </button>
          </div>

          <!-- Detailed Calculation Link -->
          <div class="card-calc-footer">
            <a href="#calculator-section" class="card-calc-link" data-calc-card-id="${card.id}">
              <span>See detailed calculation</span>
              <span class="link-arrow">→</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  /* --------------------------------------------------------------------------
     3. Comparator Bottom Tray & Modal
     -------------------------------------------------------------------------- */
  updateComparatorUI() {
    let trayContainer = document.getElementById('compareTrayWrapper');
    if (!trayContainer) {
      trayContainer = document.createElement('div');
      trayContainer.id = 'compareTrayWrapper';
      document.body.appendChild(trayContainer);
    }
    trayContainer.innerHTML = this.comparator.renderTrayHTML();
    this.renderCards();

    const compareModal = document.getElementById('compareModal');
    if (compareModal && compareModal.classList.contains('open')) {
      const content = document.getElementById('compareModalContent');
      if (content) {
        content.innerHTML = this.comparator.renderComparisonMatrixHTML(affiliateManager);
      }
    }
  }

  openComparatorModal() {
    const modal = document.getElementById('compareModal');
    const content = document.getElementById('compareModalContent');
    if (!modal || !content) return;

    content.innerHTML = this.comparator.renderComparisonMatrixHTML(affiliateManager);
    modal.classList.add('open');
  }

  /* --------------------------------------------------------------------------
     4. Card Detail Modal
     -------------------------------------------------------------------------- */
  openCardDetails(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    const modal = document.getElementById('cardDetailModal');
    const title = document.getElementById('cardDetailModalTitle');
    const body = document.getElementById('cardDetailModalBody');
    if (!modal || !title || !body) return;

    title.innerText = card.name;
    body.innerHTML = `
      <div class="modal-tabs-nav">
        <button type="button" class="tab-btn active" data-tab="tab-overview">Overview</button>
        <button type="button" class="tab-btn" data-tab="tab-fees">Fees & Charges</button>
        <button type="button" class="tab-btn" data-tab="tab-lounge">Lounge & Travel</button>
        <button type="button" class="tab-btn" data-tab="tab-eligibility">Eligibility</button>
        <button type="button" class="tab-btn" data-tab="tab-proscons">Pros & Cons</button>
      </div>

      <!-- Tab: Overview -->
      <div class="tab-pane active" id="tab-overview">
        ${card.imageUrl ? `
          <div class="modal-card-showcase">
            <div class="modal-card-img-wrap ${card.isVertical ? 'is-vertical' : ''}">
              <img src="${card.imageUrl}" alt="${card.name}" class="modal-card-img" />
            </div>
            <div class="modal-card-info">
              <div class="modal-card-badges">
                <span class="badge-tag">${card.tag}</span>
                <span class="badge-approval ${card.approvalTier || 'moderate'}">${card.approvalLabel || 'Standard'}</span>
              </div>
              <p class="modal-card-summary-text">${card.cashbackSummary}</p>
            </div>
          </div>
        ` : ''}

        <div class="detail-box-grid">
          <div class="detail-stat-card">
            <div class="label">Bank</div>
            <div class="value">${card.bank}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Rating</div>
            <div class="value" style="display: inline-flex; align-items: center; gap: 4px;"><span class="star-svg">${ICONS.star}</span> ${card.rating} / 5 (${card.reviewsCount} reviews)</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Network</div>
            <div class="value">${card.network}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Forex Markup</div>
            <div class="value">${card.forexMarkup}</div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Core Benefits</h4>
          <ul class="perks-list">
            ${card.keyPerks.map(p => `
              <li class="perk-item">
                <span class="perk-icon">${ICONS.check}</span>
                <span>${p}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="detail-section">
          <h4>Welcome Offer</h4>
          <p class="text-secondary">${card.welcomeBonus}</p>
        </div>
      </div>

      <!-- Tab: Fees & Charges -->
      <div class="tab-pane" id="tab-fees">
        <div class="detail-box-grid">
          <div class="detail-stat-card">
            <div class="label">Joining Fee</div>
            <div class="value">${card.joiningFee === 0 ? 'FREE (₹0)' : `₹${card.joiningFee.toLocaleString('en-IN')}`}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Annual Fee</div>
            <div class="value">${card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee.toLocaleString('en-IN')}`}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Annual Spend Waiver</div>
            <div class="value">${card.feeWaiverSpend > 0 ? `₹${card.feeWaiverSpend.toLocaleString('en-IN')}` : 'None'}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Reward Redemption Fee</div>
            <div class="value">${card.rewardRedemptionFee || '₹0'}</div>
          </div>
        </div>
        <div class="detail-section">
          <h4>Milestone Rewards</h4>
          <p class="text-secondary">${card.milestoneRewards}</p>
        </div>
      </div>

      <!-- Tab: Lounge & Travel -->
      <div class="tab-pane" id="tab-lounge">
        <div class="detail-box-grid">
          <div class="detail-stat-card">
            <div class="label">Domestic Lounge</div>
            <div class="value">${card.loungeAccess.domestic} / Year</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">International Lounge</div>
            <div class="value">${card.loungeAccess.international} / Year</div>
          </div>
        </div>
        <div class="detail-section" style="margin-top: 1rem;">
          <h4>Lounge Access Terms</h4>
          <p class="text-secondary">${card.loungeAccess.details}</p>
        </div>
      </div>

      <!-- Tab: Eligibility -->
      <div class="tab-pane" id="tab-eligibility">
        <div class="detail-box-grid">
          <div class="detail-stat-card">
            <div class="label">Min Monthly Income</div>
            <div class="value">₹${card.eligibility.minIncome.toLocaleString('en-IN')}</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Min CIBIL Score</div>
            <div class="value">${card.eligibility.minCibil}+</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Min Age</div>
            <div class="value">${card.eligibility.minAge} Years</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">Employment</div>
            <div class="value">${card.eligibility.employment}</div>
          </div>
        </div>
      </div>

      <!-- Tab: Pros & Cons -->
      <div class="tab-pane" id="tab-proscons">
        <div class="detail-section">
          <h4 style="color: var(--brand-success)">What We Like (Pros)</h4>
          <ul class="comp-pros-list" style="margin-bottom: 1.25rem;">
            ${card.pros.map(p => `<li><span class="comp-check-svg">${ICONS.check}</span> <span>${p}</span></li>`).join('')}
          </ul>
          <h4 style="color: var(--brand-danger)">Points to Consider (Cons)</h4>
          <ul class="comp-cons-list">
            ${card.cons.map(c => `<li><span class="comp-cross-svg">${ICONS.close}</span> <span>${c}</span></li>`).join('')}
          </ul>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; gap: 1rem; align-items: center;">
        <button type="button" class="btn btn-apply btn-outbound-apply" style="flex: 1; padding: 0.75rem;" data-card-id="${card.id}">
          Apply on Bank Official Portal ↗
        </button>
      </div>
    `;

    modal.classList.add('open');

    const tabs = body.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        body.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = body.querySelector(`#${tab.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. Spend & Savings Calculator
     -------------------------------------------------------------------------- */
  initCalculator() {
    const toggleBtn = document.getElementById('btnToggleCalculator');
    const closeBtn = document.getElementById('btnCloseCalculator');
    const collapsibleBody = document.getElementById('calcCollapsibleBody');

    this.setCalculatorState = (isOpen) => {
      if (!collapsibleBody || !toggleBtn) return;
      if (isOpen) {
        collapsibleBody.classList.add('is-expanded');
        toggleBtn.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        const textEl = toggleBtn.querySelector('.calc-toggle-text');
        const iconEl = toggleBtn.querySelector('.calc-toggle-icon');
        if (textEl) textEl.textContent = 'Hide Spend Calculator';
        if (iconEl) iconEl.innerHTML = ICONS.close;
      } else {
        collapsibleBody.classList.remove('is-expanded');
        toggleBtn.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        const textEl = toggleBtn.querySelector('.calc-toggle-text');
        const iconEl = toggleBtn.querySelector('.calc-toggle-icon');
        if (textEl) textEl.textContent = 'Open Spend Calculator (6 Spends)';
        if (iconEl) iconEl.innerHTML = ICONS.calculator;
      }
    };

    if (toggleBtn && collapsibleBody) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = collapsibleBody.classList.contains('is-expanded');
        this.setCalculatorState(!isOpen);
      });
    }

    if (closeBtn && collapsibleBody) {
      closeBtn.addEventListener('click', () => {
        this.setCalculatorState(false);
        const section = document.getElementById('calculator-section');
        if (section) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          window.scrollTo({
            top: section.offsetTop - headerHeight + 5,
            behavior: 'smooth'
          });
        }
      });
    }

    const sliders = document.querySelectorAll('.range-slider');
    sliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const cat = e.target.dataset.calcCategory;
        const val = Number(e.target.value);
        this.calculator.updateSpend(cat, val);

        const display = document.getElementById(`display-${cat}`);
        if (display) {
          display.innerText = `₹${val.toLocaleString('en-IN')}`;
        }

        this.updateCalculatorResults();
      });
    });

    this.updateCalculatorResults();
  }

  updateCalculatorResults() {
    const totalSpend = this.calculator.getTotalMonthlySpend();
    const totalDisplay = document.getElementById('calcTotalSpendDisplay');
    if (totalDisplay) {
      totalDisplay.innerText = `₹${totalSpend.toLocaleString('en-IN')}/mo (₹${(totalSpend * 12).toLocaleString('en-IN')}/yr)`;
    }

    const ranked = this.calculator.getRankedResults();
    if (ranked.length === 0) return;

    const winner = ranked[0];
    const winnerContainer = document.getElementById('calcWinnerContainer');
    if (winnerContainer) {
      winnerContainer.innerHTML = `
        <div class="winner-card-box">
          <span class="winner-badge-top">Top Match for Your Spends</span>
          <span class="winner-bank-label">${winner.card.bank}</span>
          <h3 class="winner-card-title">${winner.card.name}</h3>
          
          <div class="winner-savings-highlight">
            <div>
              <div class="savings-label">Estimated Net Annual Savings</div>
              <div class="savings-num">₹${winner.netAnnualSavings.toLocaleString('en-IN')}</div>
            </div>
            <button type="button" class="btn btn-apply btn-outbound-apply" data-card-id="${winner.card.id}">
              Apply on Bank Site ↗
            </button>
          </div>

          <ul class="calc-breakdown-list">
            <li><span>Online Shopping Return:</span> <strong>₹${winner.breakdown.online.toLocaleString('en-IN')}/yr</strong></li>
            <li><span>Dining & Food Return:</span> <strong>₹${winner.breakdown.dining.toLocaleString('en-IN')}/yr</strong></li>
            <li><span>Groceries Return:</span> <strong>₹${winner.breakdown.grocery.toLocaleString('en-IN')}/yr</strong></li>
            <li><span>Fuel Return:</span> <strong>₹${winner.breakdown.fuel.toLocaleString('en-IN')}/yr</strong></li>
            <li><span>Effective Annual Fee:</span> <strong>${winner.feeWaived ? 'Waived (₹0)' : `₹${winner.effectiveAnnualFee}`}</strong></li>
          </ul>
        </div>

        <h4 style="font-size: 0.9rem; font-weight: 700; margin: 1.25rem 0 0.5rem; color: var(--text-secondary);">Runner-Up Alternatives</h4>
        <div class="runner-ups-list">
          ${ranked.slice(1, 4).map(r => `
            <div class="runner-up-item">
              <div class="runner-up-info">
                <span class="runner-up-name">${r.card.name}</span>
                <span class="runner-up-bank">${r.card.bank}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="runner-up-savings">₹${r.netAnnualSavings.toLocaleString('en-IN')}/yr</span>
                <button type="button" class="btn btn-secondary btn-sm btn-outbound-apply" data-card-id="${r.card.id}">
                  Apply
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  /* --------------------------------------------------------------------------
     6. Card Finder Quiz
     -------------------------------------------------------------------------- */
  openQuizModal() {
    this.quiz.reset();
    const modal = document.getElementById('quizModal');
    if (!modal) return;
    this.renderQuizStep();
    modal.classList.add('open');
  }

  renderQuizStep() {
    const container = document.getElementById('quizModalBody');
    if (!container) return;

    const step = this.quiz.currentStep;

    const stepPillsHTML = `
      <div class="smart-match-stepper">
        <div class="smart-step-pill ${step === 1 ? 'active' : (step > 1 ? 'done' : '')}">
          <span class="step-num">${step > 1 ? ICONS.check : '1'}</span>
          <span class="step-label">Income</span>
        </div>
        <div class="smart-step-divider ${step > 1 ? 'done' : ''}"></div>
        <div class="smart-step-pill ${step === 2 ? 'active' : (step > 2 ? 'done' : '')}">
          <span class="step-num">${step > 2 ? ICONS.check : '2'}</span>
          <span class="step-label">Spend</span>
        </div>
        <div class="smart-step-divider ${step > 2 ? 'done' : ''}"></div>
        <div class="smart-step-pill ${step === 3 ? 'active' : ''}">
          <span class="step-num">3</span>
          <span class="step-label">Priority</span>
        </div>
      </div>
    `;

    let contentHTML = '';

    if (step === 1) {
      contentHTML = `
        <div class="smart-match-header">
          <span class="smart-match-step-badge">QUESTION 1 OF 3 • SALARY TIER</span>
          <h3 class="smart-match-title">What is your monthly in-hand income?</h3>
          <p class="smart-match-subtitle">We check actual bank underwriting criteria to match cards with high approval feasibility.</p>
        </div>
        <div class="smart-match-grid">
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'tier-15k-25k' ? 'selected' : ''}" data-quiz-choice="income" data-val="tier-15k-25k">
            <div class="tile-icon-box">${ICONS.briefcase}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹15,000 – ₹25,000 / mo</span>
                <span class="tile-tag">Starter</span>
              </div>
              <span class="tile-desc">Secured FD-backed & entry-level cashback cards</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'tier-25k-40k' ? 'selected' : ''}" data-quiz-choice="income" data-val="tier-25k-40k">
            <div class="tile-icon-box">${ICONS.cards}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹25,000 – ₹40,000 / mo</span>
                <span class="tile-tag">Growth</span>
              </div>
              <span class="tile-desc">Popular cashback cards on Amazon, Flipkart & Swiggy</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'tier-40k-60k' ? 'selected' : ''}" data-quiz-choice="income" data-val="tier-40k-60k">
            <div class="tile-icon-box">${ICONS.diamond}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹40,000 – ₹60,000 / mo</span>
                <span class="tile-tag">Balanced</span>
              </div>
              <span class="tile-desc">Balanced rewards on dining, fuel, grocery & bills</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'tier-60k-1l' ? 'selected' : ''}" data-quiz-choice="income" data-val="tier-60k-1l">
            <div class="tile-icon-box">${ICONS.catTravel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹60,000 – ₹1,00,000 / mo</span>
                <span class="tile-tag">Premium</span>
              </div>
              <span class="tile-desc">Airport lounge access, accelerated miles & fee waivers</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'tier-1l-plus' ? 'selected' : ''}" data-quiz-choice="income" data-val="tier-1l-plus">
            <div class="tile-icon-box">${ICONS.crown}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Above ₹1,00,000 / mo</span>
                <span class="tile-tag">Super-Premium</span>
              </div>
              <span class="tile-desc">Metal cards, 1:1 air miles transfer & luxury perks</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    } else if (step === 2) {
      contentHTML = `
        <div class="smart-match-header">
          <span class="smart-match-step-badge">QUESTION 2 OF 3 • PRIMARY SPENDING</span>
          <h3 class="smart-match-title">Where do you spend the most each month?</h3>
          <p class="smart-match-subtitle">We match cards offering the highest accelerator multipliers on your major expense.</p>
        </div>
        <div class="smart-match-grid">
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'shopping' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="shopping">
            <div class="tile-icon-box">${ICONS.catShopping}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Online Shopping</span>
                <span class="tile-tag">5% Cashback</span>
              </div>
              <span class="tile-desc">Amazon, Flipkart, Myntra & quick commerce</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'dining' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="dining">
            <div class="tile-icon-box">${ICONS.catDining}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Food & Dining</span>
                <span class="tile-tag">10% Off</span>
              </div>
              <span class="tile-desc">Swiggy, Zomato, cafes & restaurant dining</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'fuel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="fuel">
            <div class="tile-icon-box">${ICONS.catFuel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Fuel & Commuting</span>
                <span class="tile-tag">Surcharge Waiver</span>
              </div>
              <span class="tile-desc">Petrol, diesel, EV charging & toll payments</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'travel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="travel">
            <div class="tile-icon-box">${ICONS.catTravel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Travel & Flights</span>
                <span class="tile-tag">Air Miles</span>
              </div>
              <span class="tile-desc">Flight bookings, hotels & 0% forex markup</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'upi' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="upi">
            <div class="tile-icon-box">${ICONS.catUpi}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">UPI & Daily QR Spends</span>
                <span class="tile-tag">RuPay Rewards</span>
              </div>
              <span class="tile-desc">Scan any merchant QR code via PhonePe / GPay</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'bills' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="bills">
            <div class="tile-icon-box">${ICONS.calculator}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Utility Bills & Recharges</span>
                <span class="tile-tag">Up to 25% Off</span>
              </div>
              <span class="tile-desc">Electricity, mobile recharges, DTH & broadband</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'everything' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="everything">
            <div class="tile-icon-box">${ICONS.cards}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Everything / General Spends</span>
                <span class="tile-tag">All-Rounder</span>
              </div>
              <span class="tile-desc">Evenly distributed everyday grocery & retail expenses</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    } else if (step === 3) {
      contentHTML = `
        <div class="smart-match-header">
          <span class="smart-match-step-badge">QUESTION 3 OF 3 • YOUR TOP PRIORITY</span>
          <h3 class="smart-match-title">What is your #1 must-have benefit?</h3>
          <p class="smart-match-subtitle">We rank cards based on the benefit you care about most.</p>
        </div>
        <div class="smart-match-grid">
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'cashback' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="cashback">
            <div class="tile-icon-box">${ICONS.catCashback}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Maximum Cashback</span>
                <span class="tile-tag">Direct Cash</span>
              </div>
              <span class="tile-desc">Direct cash credits deducted from your monthly bill</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'ltf' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="ltf">
            <div class="tile-icon-box">${ICONS.catLifetimeFree}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Lifetime Free (₹0 Fee)</span>
                <span class="tile-tag">Zero Fee</span>
              </div>
              <span class="tile-desc">Zero joining fee and zero annual charges forever</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'lounge' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="lounge">
            <div class="tile-icon-box">${ICONS.catLounge}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Airport Lounge Access</span>
                <span class="tile-tag">Travel Luxury</span>
              </div>
              <span class="tile-desc">Complimentary airport food, drinks & relaxation</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'travel' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="travel">
            <div class="tile-icon-box">${ICONS.catTravel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Travel Rewards & Miles</span>
                <span class="tile-tag">Free Flights</span>
              </div>
              <span class="tile-desc">Reward points convertible to airline miles & hotel stays</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'upi' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="upi">
            <div class="tile-icon-box">${ICONS.catUpi}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">RuPay UPI QR Rewards</span>
                <span class="tile-tag">Scan & Pay</span>
              </div>
              <span class="tile-desc">Earn points scanning local tea stalls, grocery & retail QR</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'low-fee' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="low-fee">
            <div class="tile-icon-box">${ICONS.shieldCheck}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Low Fees & Easy Waivers</span>
                <span class="tile-tag">High Value</span>
              </div>
              <span class="tile-desc">Low barrier to entry with easily achievable spend waivers</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    }

    const navHTML = `
      <div class="smart-match-nav-bar">
        ${step > 1 ? `<button type="button" class="btn-smart-back" id="btnQuizBack">← Previous Step</button>` : `<div></div>`}
        <span class="smart-match-confidential" style="display:inline-flex;align-items:center;gap:5px;">${ICONS.lock} 100% Free & Anonymous • No mobile number required</span>
      </div>
    `;

    container.innerHTML = stepPillsHTML + contentHTML + navHTML;

    container.querySelectorAll('.smart-match-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const choice = tile.dataset.quizChoice;
        const val = tile.dataset.val;
        this.quiz.setAnswer(choice, val);

        if (this.quiz.nextStep()) {
          this.renderQuizStep();
        } else {
          this.renderQuizResults();
        }
      });
    });

    const backBtn = document.getElementById('btnQuizBack');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.quiz.prevStep()) {
          this.renderQuizStep();
        }
      });
    }
  }

  renderQuizResults() {
    const container = document.getElementById('quizModalBody');
    if (!container) return;

    const matched = this.quiz.getMatchedCards();

    container.innerHTML = `
      <div class="match-results-hero">
        <div class="match-success-icon">${ICONS.target}</div>
        <h3 class="match-results-title">Your Top 3 Card Matches</h3>
        <p class="match-results-sub">Calculated based on your income profile, primary category spend, and must-have rewards.</p>
      </div>

      <div class="match-cards-grid match-top3-grid">
        ${matched.map(item => {
          const card = item.card;
          const feeDisplay = item.isLifetimeFree 
            ? '₹0 Lifetime Free' 
            : (item.isFeeWaived ? `₹0 (Waived on annual spend)` : `₹${item.annualFee.toLocaleString('en-IN')} / yr`);

          return `
            <div class="match-card-item ${item.rankClass}">
              <div class="match-card-badge-row">
                <span class="match-badge-tag ${item.rankClass}">
                  <span>${item.rankBadge}</span>
                </span>
                <span class="match-card-rating" style="display:inline-flex;align-items:center;gap:3px;">
                  <span class="star-svg">${ICONS.star}</span> ${card.rating || '4.8'}
                </span>
              </div>

              <h4 class="match-card-name">${card.name}</h4>
              <span class="match-card-bank">${card.bank}</span>

              <!-- Mathematical Calculation Box -->
              <div class="match-calculation-box">
                <div class="calc-metric-row">
                  <span>Est. Annual Rewards:</span>
                  <strong>+₹${item.estimatedAnnualRewards.toLocaleString('en-IN')}</strong>
                </div>
                <div class="calc-metric-row">
                  <span>Annual Fee:</span>
                  <span>${feeDisplay}</span>
                </div>
                <div class="calc-metric-divider"></div>
                <div class="calc-metric-row net-benefit-row">
                  <span>Net Annual Benefit:</span>
                  <strong class="net-benefit-amount">+₹${item.netAnnualBenefit.toLocaleString('en-IN')}/yr</strong>
                </div>
              </div>

              <!-- Match Reason -->
              <div class="match-reason-box">
                <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:var(--brand-primary);margin-bottom:2px;">
                  <span>${ICONS.bulb}</span> Why we selected it:
                </div>
                <div style="font-size:0.83rem;color:var(--text-secondary);line-height:1.4;">${item.reasonText}</div>
              </div>

              <div class="match-best-for-pill">
                <strong>Best For:</strong> ${item.bestFor}
              </div>

              <div class="match-card-cta-block">
                <button type="button" class="btn btn-primary btn-outbound-apply match-apply-btn" data-card-id="${card.id}">
                  Check Eligibility on Bank Site →
                </button>
                <div class="match-aff-disclosure">
                  Official bank partner link • Zero fee impact • 100% free eligibility check
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="match-bridge-bar">
        <button type="button" class="btn-filter-match" id="btnFilterMatchCards">
          <span style="display:inline-flex;align-items:center;margin-right:6px;">${ICONS.target}</span> Browse All 35+ Cards in Directory →
        </button>
        <button type="button" class="btn-retake-match" id="btnRestartQuiz">
          <span style="display:inline-flex;align-items:center;margin-right:5px;">${ICONS.reload}</span> Retake Smart Match
        </button>
      </div>
    `;

    // Bind Outbound Apply Buttons in Quiz Modal
    container.querySelectorAll('.btn-outbound-apply').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cardId = btn.dataset.cardId;
        this.handleOutboundApply(cardId);
      });
    });

    const bridgeBtn = document.getElementById('btnFilterMatchCards');
    if (bridgeBtn) {
      bridgeBtn.addEventListener('click', () => {
        const modal = document.getElementById('quizModal');
        if (modal) modal.classList.remove('open');
        const target = document.getElementById('card-directory');
        if (target) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          window.scrollTo({
            top: target.offsetTop - headerHeight + 5,
            behavior: 'smooth'
          });
        }
      });
    }

    const restartBtn = document.getElementById('btnRestartQuiz');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.quiz.reset();
        this.renderQuizStep();
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. Outbound Redirect Interstitial
     -------------------------------------------------------------------------- */
  handleOutboundApply(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    affiliateManager.triggerOutboundApply(card, ({ card, finalUrl, affiliateId }) => {
      const modal = document.getElementById('redirectModal');
      const body = document.getElementById('redirectModalBody');
      if (!modal || !body) {
        window.open(finalUrl, '_blank');
        return;
      }

      body.innerHTML = `
        <div class="redirect-box">
          <div class="redirect-spinner"></div>
          <h3 class="redirect-title">Redirecting to ${card.bank}...</h3>
          <p class="redirect-sub">You are being transferred to the official ${card.bank} credit card application portal.</p>
          
          <div style="background-color: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 1.25rem; text-align: left;">
            <div style="font-size: 0.82rem; color: var(--brand-success); font-weight: 700; margin-bottom: 0.2rem;">Welcome Offer Information</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${card.welcomeBonus}</div>
          </div>

          <div class="redirect-security-note">
            <span style="display: inline-flex; align-items: center; gap: 6px;">${ICONS.shieldCheck} Secure Official Bank Redirection</span>
          </div>

          <div style="margin-top: 1.25rem;">
            <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" id="btnDirectRedirect">
              Continue to Bank Portal (2s)
            </a>
          </div>
        </div>
      `;

      modal.classList.add('open');

      setTimeout(() => {
        window.open(finalUrl, '_blank');
        setTimeout(() => {
          modal.classList.remove('open');
        }, 1200);
      }, 2000);
    });
  }

  /* --------------------------------------------------------------------------
     8. Credit Score & Personal Loans Revenue Engine
     -------------------------------------------------------------------------- */
  initCreditScoreSection() {
    const grid = document.getElementById('cibilOffersGrid');
    if (!grid) return;

    grid.innerHTML = this.creditScoreOffers.map(offer => {
      const finalUrl = affiliateManager.resolveUrl(offer);
      return `
        <div class="cibil-provider-card">
          <div>
            <div class="provider-card-header">
              <span class="provider-badge">${offer.badge}</span>
              <div class="rating-badge" style="display: inline-flex; align-items: center; gap: 3px;"><span class="star-svg">${ICONS.star}</span> ${offer.rating}</div>
            </div>
            <h4 class="provider-title">${offer.name}</h4>
            <div class="provider-sub">${offer.provider}</div>
            <div style="font-size: 0.8rem; color: var(--brand-primary); font-weight: 700; margin-bottom: 0.85rem;">
              Score Range: ${offer.scoreRange} (${offer.reportFrequency})
            </div>

            <ul class="perks-list" style="margin-bottom: 1.25rem;">
              ${offer.keyBenefits.map(b => `
                <li class="perk-item">
                  <span class="perk-icon">${ICONS.check}</span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald btn-track-cibil" data-offer-id="${offer.id}" style="width: 100%; text-align: center;">
            ${offer.ctaText}
          </a>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-track-cibil').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const offerId = btn.dataset.offerId;
        const offer = this.creditScoreOffers.find(o => o.id === offerId);
        if (offer) {
          affiliateManager.logClick(offer, btn.href, affiliateManager.getNetworkForItem(offer));
        }
      });
    });
  }

  initLoansSection() {
    const grid = document.getElementById('loansCardsGrid');
    if (!grid) return;

    grid.innerHTML = this.personalLoans.map(loan => {
      const finalUrl = affiliateManager.resolveUrl(loan);
      return `
        <div class="loan-card">
          <div class="loan-card-header">
            <span class="loan-badge">${loan.badge}</span>
            <div class="rating-badge" style="display: inline-flex; align-items: center; gap: 3px;"><span class="star-svg">${ICONS.star}</span> ${loan.rating}</div>
          </div>

          <h4 class="loan-title">${loan.name}</h4>
          <div class="loan-lender">${loan.lender}</div>

          <div class="loan-metrics-grid">
            <div class="loan-metric-item">
              <span class="label">Max Loan</span>
              <span class="val" style="color: var(--brand-success);">${loan.maxAmountLabel}</span>
            </div>
            <div class="loan-metric-item">
              <span class="label">Interest Rate</span>
              <span class="val">${loan.interestRateRange}</span>
            </div>
            <div class="loan-metric-item">
              <span class="label">Disbursal Time</span>
              <span class="val">${loan.disbursalTime}</span>
            </div>
            <div class="loan-metric-item">
              <span class="label">Min Income</span>
              <span class="val">${loan.minSalaryLabel}</span>
            </div>
          </div>

          <ul class="loan-perks-list">
            ${loan.keyPerks.slice(0, 3).map(perk => `
              <li class="loan-perk-item">
                <span class="perk-icon">${ICONS.check}</span>
                <span>${perk}</span>
              </li>
            `).join('')}
          </ul>

          <div class="loan-eligibility-note">
            <strong>Eligibility:</strong> ${loan.eligibility}
          </div>

          <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-track-loan" data-loan-id="${loan.id}" style="width: 100%; text-align: center; margin-top: auto;">
            Apply for Instant Loan ↗
          </a>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-track-loan').forEach(btn => {
      btn.addEventListener('click', () => {
        const loanId = btn.dataset.loanId;
        const loan = this.personalLoans.find(l => l.id === loanId);
        if (loan) {
          affiliateManager.logClick(loan, btn.href, affiliateManager.getNetworkForItem(loan));
        }
      });
    });

    const toggleBtn = document.getElementById('btnToggleLoanCalc');
    const closeBtn = document.getElementById('btnCloseLoanCalc');
    const collapsibleBody = document.getElementById('loanCalcCollapsible');

    this.setLoanCalcState = (isOpen) => {
      if (!collapsibleBody || !toggleBtn) return;
      if (isOpen) {
        collapsibleBody.classList.add('is-expanded');
        toggleBtn.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        const textEl = toggleBtn.querySelector('.calc-toggle-text');
        const iconEl = toggleBtn.querySelector('.calc-toggle-icon');
        if (textEl) textEl.textContent = 'Hide Loan EMI Calculator';
        if (iconEl) iconEl.innerHTML = ICONS.close;
      } else {
        collapsibleBody.classList.remove('is-expanded');
        toggleBtn.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        const textEl = toggleBtn.querySelector('.calc-toggle-text');
        const iconEl = toggleBtn.querySelector('.calc-toggle-icon');
        if (textEl) textEl.textContent = 'Calculate Loan EMI & Repayment Schedule';
        if (iconEl) iconEl.innerHTML = ICONS.calculator;
      }
    };

    if (toggleBtn && collapsibleBody) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = collapsibleBody.classList.contains('is-expanded');
        this.setLoanCalcState(!isOpen);
      });
    }

    if (closeBtn && collapsibleBody) {
      closeBtn.addEventListener('click', () => {
        this.setLoanCalcState(false);
        const section = document.getElementById('loans-section');
        if (section) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          window.scrollTo({
            top: section.offsetTop - headerHeight + 5,
            behavior: 'smooth'
          });
        }
      });
    }
  }

  initLoanCalculator() {
    const amountSlider = document.getElementById('loanAmountSlider');
    const tenureSlider = document.getElementById('loanTenureSlider');
    const amountDisplay = document.getElementById('loanAmountDisplay');
    const tenureDisplay = document.getElementById('loanTenureDisplay');
    const emiDisplay = document.getElementById('estimatedEmiDisplay');
    const principalDisplay = document.getElementById('loanPrincipalDisplay');
    const interestDisplay = document.getElementById('loanTotalInterestDisplay');
    const payableDisplay = document.getElementById('loanTotalPayableDisplay');

    if (!amountSlider || !tenureSlider) return;

    const updateLoanCalc = () => {
      const p = parseFloat(amountSlider.value);
      const n = parseInt(tenureSlider.value, 10);
      const annualRate = 15.99; // 15.99% standard loan APR
      const r = (annualRate / 12) / 100;

      // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
      const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      const totalPayable = Math.round(emi * n);
      const totalInterest = Math.round(totalPayable - p);

      if (amountDisplay) amountDisplay.textContent = `₹${p.toLocaleString('en-IN')}`;
      if (tenureDisplay) tenureDisplay.textContent = `${n} Months (${(n / 12).toFixed(1)} Yrs)`;
      if (emiDisplay) emiDisplay.textContent = `₹${emi.toLocaleString('en-IN')}`;
      if (principalDisplay) principalDisplay.textContent = `₹${p.toLocaleString('en-IN')}`;
      if (interestDisplay) interestDisplay.textContent = `₹${totalInterest.toLocaleString('en-IN')}`;
      if (payableDisplay) payableDisplay.textContent = `₹${totalPayable.toLocaleString('en-IN')}`;
    };

    amountSlider.addEventListener('input', updateLoanCalc);
    tenureSlider.addEventListener('input', updateLoanCalc);
    updateLoanCalc();
  }

  /* --------------------------------------------------------------------------
     8b. Mobile Section Nav & ScrollSpy
     -------------------------------------------------------------------------- */
  initScrollSpy() {
    const navLinks = document.querySelectorAll('.bottom-nav-item, .mobile-nav-link');
    const sections = [
      { id: 'card-directory', el: document.getElementById('card-directory') },
      { id: 'loans-section', el: document.getElementById('loans-section') },
      { id: 'calculator-section', el: document.getElementById('calculator-section') },
      { id: 'credit-guides-section', el: document.getElementById('credit-guides-section') },
      { id: 'faq-section', el: document.getElementById('faq-section') }
    ].filter(s => s.el);

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (href === '#calculator-section' && this.setCalculatorState) {
            this.setCalculatorState(true);
          }
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight + 5;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });

    // Highlight active nav item on scroll
    let lastActiveId = '';
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 180;
      let currentSectionId = '';

      for (const section of sections) {
        if (section.el.offsetTop <= scrollPos) {
          currentSectionId = section.id;
        }
      }

      if (currentSectionId && currentSectionId !== lastActiveId) {
        lastActiveId = currentSectionId;
        navLinks.forEach(link => {
          if (link.dataset.section === currentSectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     9. Affiliate & Monetization Control Center
     -------------------------------------------------------------------------- */
  initAffiliateControlCenter() {
    const affiliateModal = document.getElementById('affiliateModal');

    const openConsole = () => {
      if (affiliateModal) {
        affiliateModal.classList.add('open');
        populateNetworkInputs();
        this.renderAffiliateOffersTable();
        this.renderAffiliateAnalytics();
        this.renderAffiliateCodeAndBackup();
      }
    };

    // Secret Admin URL Trigger: ?admin=instantcred, ?cuelinks=1, or ?monetize=1
    if (typeof window !== 'undefined' && (
      window.location.search.includes('admin=instantcred') || 
      window.location.search.includes('cuelinks=1') || 
      window.location.search.includes('monetize=1')
    )) {
      openConsole();
    }

    // Secret Admin Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (affiliateModal && affiliateModal.classList.contains('open')) {
          affiliateModal.classList.remove('open');
        } else {
          openConsole();
          this.showToast('Monetization Console Opened (Admin Mode)', 'info');
        }
      }
    });

    if (affiliateModal) {
      const closeBtn = affiliateModal.querySelector('.btn-close-icon');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          affiliateModal.classList.remove('open');
        });
      }
    }

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.aff-tab-btn');
    const tabPanes = document.querySelectorAll('.aff-tab-pane');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(btn.dataset.tab);
        if (targetPane) targetPane.classList.add('active');

        // Refresh dynamic content when tab opens
        if (btn.dataset.tab === 'aff-tab-analytics') {
          this.renderAffiliateAnalytics();
        } else if (btn.dataset.tab === 'aff-tab-code') {
          this.renderAffiliateCodeAndBackup();
        } else if (btn.dataset.tab === 'aff-tab-links') {
          this.renderAffiliateOffersTable();
        }
      });
    });

    // Populate Tab 1: Cuelinks Configuration
    const populateNetworkInputs = () => {
      const settings = affiliateManager.settings;
      const cuelinks = settings.cuelinks || settings.networks?.cuelinks || {};

      // Monetization Filter toggle
      const toggleHideNonAffiliate = document.getElementById('toggleHideNonAffiliate');
      const badgeMonetizedCount = document.getElementById('badgeMonetizedCount');
      if (toggleHideNonAffiliate) {
        toggleHideNonAffiliate.checked = settings.hideNonAffiliateCards !== false;
        const activeMonetizedCount = this.allCards.filter(c => c.hasAffiliate !== false).length;
        if (badgeMonetizedCount) {
          badgeMonetizedCount.textContent = toggleHideNonAffiliate.checked 
            ? `${activeMonetizedCount} Monetized Cards Active` 
            : `All ${this.allCards.length} Cards Active`;
        }
        toggleHideNonAffiliate.onchange = () => {
          if (badgeMonetizedCount) {
            badgeMonetizedCount.textContent = toggleHideNonAffiliate.checked 
              ? `${activeMonetizedCount} Monetized Cards Active` 
              : `All ${this.allCards.length} Cards Active`;
          }
        };
      }

      // Cuelinks inputs
      const inputCuelinksChannelId = document.getElementById('inputCuelinksChannelId');
      const inputCuelinksPubId = document.getElementById('inputCuelinksPubId');
      const inputCuelinksSubId = document.getElementById('inputCuelinksSubId');
      const selectCuelinksFormat = document.getElementById('selectCuelinksFormat');
      const toggleCuelinksScript = document.getElementById('toggleCuelinksScript');
      const cuelinksScriptStatusText = document.getElementById('cuelinksScriptStatusText');

      if (inputCuelinksChannelId) inputCuelinksChannelId.value = cuelinks.channelId || '317055';
      if (inputCuelinksPubId) inputCuelinksPubId.value = cuelinks.pubId || '271664';
      if (inputCuelinksSubId) inputCuelinksSubId.value = cuelinks.subId || 'instantcred_web';
      if (selectCuelinksFormat) selectCuelinksFormat.value = cuelinks.redirectFormat || 'linksredirect';
      if (toggleCuelinksScript) {
        toggleCuelinksScript.checked = !!cuelinks.enableAutoTaggingScript;
        if (cuelinksScriptStatusText) {
          cuelinksScriptStatusText.textContent = toggleCuelinksScript.checked
            ? 'Active (Auto-tagging direct bank links via JS)'
            : 'Disabled (Using Ultra-Fast LinksRedirect Links)';
          cuelinksScriptStatusText.style.color = toggleCuelinksScript.checked ? 'var(--brand-success)' : 'var(--text-secondary)';
        }
      }

      this.updateAffiliateLivePreview();
    };

    populateNetworkInputs();

    // Cuelinks script toggle listener
    const toggleCuelinksScript = document.getElementById('toggleCuelinksScript');
    if (toggleCuelinksScript) {
      toggleCuelinksScript.addEventListener('change', () => {
        const statusText = document.getElementById('cuelinksScriptStatusText');
        if (statusText) {
          statusText.textContent = toggleCuelinksScript.checked
            ? 'Active (Auto-tagging direct bank links via JS)'
            : 'Disabled (Using Redirection Links)';
          statusText.style.color = toggleCuelinksScript.checked ? 'var(--brand-success)' : 'var(--text-secondary)';
        }
        this.updateAffiliateLivePreview();
      });
    }

    // Live preview on input changes
    const modalInputs = affiliateModal ? affiliateModal.querySelectorAll('.affiliate-form-input') : [];
    modalInputs.forEach(input => {
      input.addEventListener('input', () => this.updateAffiliateLivePreview());
      input.addEventListener('change', () => this.updateAffiliateLivePreview());
    });

    // Tab 2 Search & Filter Pills
    const searchInput = document.getElementById('inputAffSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activePill = document.querySelector('.aff-filter-pill.active');
        const filterType = activePill ? activePill.dataset.type : 'all';
        this.renderAffiliateOffersTable(filterType, e.target.value);
      });
    }

    document.querySelectorAll('.aff-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.aff-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const searchVal = searchInput ? searchInput.value : '';
        this.renderAffiliateOffersTable(pill.dataset.type, searchVal);
      });
    });

    // Tab 3 Analytics Actions
    const btnDownloadCSV = document.getElementById('btnDownloadClicksCSV');
    if (btnDownloadCSV) {
      btnDownloadCSV.addEventListener('click', () => this.downloadClicksCSV());
    }

    const btnClearLogs = document.getElementById('btnClearClicksLog');
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => {
        if (confirm('Clear all recorded click logs?')) {
          affiliateManager.clearClickLogs();
          this.renderAffiliateAnalytics();
          this.showToast('Click logs cleared.', 'info');
        }
      });
    }

    // Tab 4 Backup & Code Actions
    const btnExportJSON = document.getElementById('btnExportJSON');
    if (btnExportJSON) {
      btnExportJSON.addEventListener('click', () => {
        const jsonStr = affiliateManager.exportConfigJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instantcred-affiliate-config-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Affiliate settings exported to JSON.', 'success');
      });
    }

    const inputImportJSON = document.getElementById('inputImportJSON');
    if (inputImportJSON) {
      inputImportJSON.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = affiliateManager.importConfigJSON(event.target.result);
          if (res.success) {
            populateNetworkInputs();
            this.renderAffiliateOffersTable();
            this.renderAffiliateAnalytics();
            this.renderAffiliateCodeAndBackup();
            this.showToast('Settings imported successfully!', 'success');
          } else {
            alert('Failed to parse JSON file: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    const btnResetDefaults = document.getElementById('btnResetDefaults');
    if (btnResetDefaults) {
      btnResetDefaults.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all affiliate credentials and custom overrides to defaults?')) {
          affiliateManager.resetToDefaults();
          this.updateActiveCards();
          if (this.comparator) this.comparator.cards = this.cards;
          if (this.calculator) this.calculator.cards = this.cards;
          if (this.quiz) this.quiz.cards = this.cards;
          this.populateFilterDropdowns();
          this.renderCategoryChips();
          this.applyFilters();
          populateNetworkInputs();
          this.renderAffiliateOffersTable();
          this.renderAffiliateAnalytics();
          this.renderAffiliateCodeAndBackup();
          this.showToast('All settings reset to defaults.', 'info');
        }
      });
    }

    const btnCopyCode = document.getElementById('btnCopyConfigCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const code = affiliateManager.generateConfigCode();
        navigator.clipboard.writeText(code).then(() => {
          this.showToast('Configuration code copied to clipboard!', 'success');
        }).catch(() => {
          this.showToast('Code copied.', 'success');
        });
      });
    }

    const btnSave = document.getElementById('btnSaveAffiliateSettings');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const inputChannelId = document.getElementById('inputCuelinksChannelId')?.value.trim() || '317055';
        const inputPubId = document.getElementById('inputCuelinksPubId')?.value.trim() || '271664';
        const inputSubId = document.getElementById('inputCuelinksSubId')?.value.trim() || 'instantcred_web';
        const selectCuelinksFormat = document.getElementById('selectCuelinksFormat')?.value || 'linksredirect';
        const isScriptEnabled = document.getElementById('toggleCuelinksScript')?.checked || false;

        const hideNonAffiliate = document.getElementById('toggleHideNonAffiliate')
          ? document.getElementById('toggleHideNonAffiliate').checked
          : true;

        // Collect custom link overrides
        const customLinks = { ...affiliateManager.settings.customLinks };

        document.querySelectorAll('.aff-override-input').forEach(input => {
          const id = input.dataset.itemId;
          const val = input.value.trim();
          if (val) {
            customLinks[id] = val;
          } else {
            delete customLinks[id];
          }
        });

        const newSettings = {
          primaryNetwork: 'cuelinks',
          hideNonAffiliateCards: hideNonAffiliate,
          cuelinks: {
            name: 'Cuelinks India',
            channelId: inputChannelId,
            pubId: inputPubId,
            subId: inputSubId,
            enableAutoTaggingScript: isScriptEnabled,
            redirectFormat: selectCuelinksFormat
          },
          customLinks
        };

        affiliateManager.saveSettings(newSettings);

        // Refresh cards and sub-systems if visibility changed
        this.updateActiveCards();
        if (this.comparator) this.comparator.cards = this.cards;
        if (this.calculator) this.calculator.cards = this.cards;
        if (this.quiz) this.quiz.cards = this.cards;
        this.populateFilterDropdowns();
        this.renderCategoryChips();
        this.applyFilters();

        // Re-render live sections to immediately apply new tracking links
        this.initCreditScoreSection();
        this.initLoansSection();
        if (this.comparator) {
          const content = document.getElementById('comparisonModalContent');
          if (content) content.innerHTML = this.comparator.renderComparisonMatrixHTML(affiliateManager);
        }

        this.showToast('Cuelinks settings saved and active!', 'success');
        if (affiliateModal) affiliateModal.classList.remove('open');
      });
    }
  }

  updateAffiliateLivePreview() {
    const sampleCard = this.cards.find(c => c.id === 'hdfc-moneyback') || this.cards[0] || { id: 'hdfc-moneyback', name: 'HDFC Bank MoneyBack+ Credit Card', directUrl: 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/moneyback-plus' };

    const previewNameEl = document.getElementById('previewCardName');
    const previewUrlEl = document.getElementById('previewResolvedUrl');
    if (previewNameEl) previewNameEl.textContent = sampleCard.name;

    const channelId = document.getElementById('inputCuelinksChannelId')?.value.trim() || '317055';
    const pubId = document.getElementById('inputCuelinksPubId')?.value.trim() || '271664';
    const subId = document.getElementById('inputCuelinksSubId')?.value.trim() || 'instantcred_web';
    const format = document.getElementById('selectCuelinksFormat')?.value || 'linksredirect';
    const isScript = document.getElementById('toggleCuelinksScript')?.checked || false;

    let previewUrl = '';
    const directUrl = sampleCard.directUrl;

    if (isScript && pubId) {
      previewUrl = `${directUrl} (Auto-monetized via Cuelinks JS Widget)`;
    } else if (format === 'cprewritten') {
      previewUrl = `https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=${encodeURIComponent(pubId)}&sub_id=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
    } else {
      previewUrl = `https://linksredirect.com/?cid=${encodeURIComponent(channelId)}&subid=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
    }

    if (previewUrlEl) previewUrlEl.textContent = previewUrl;
  }

  renderAffiliateOffersTable(filterType = 'all', searchQuery = '') {
    const tbody = document.getElementById('affCardTableBody');
    if (!tbody) return;

    const pillAll = document.querySelector('.aff-filter-pill[data-type="all"]');
    const pillCards = document.querySelector('.aff-filter-pill[data-type="cards"]');
    if (pillCards) pillCards.textContent = `Credit Cards (${this.cards.length})`;
    if (pillAll) pillAll.textContent = `All (${this.cards.length + this.personalLoans.length + this.creditScoreOffers.length})`;

    let items = [];
    if (filterType === 'all' || filterType === 'cards') {
      items.push(...this.cards.map(c => ({ ...c, itemType: 'card', bankLabel: c.bank })));
    }
    if (filterType === 'all' || filterType === 'loans') {
      items.push(...this.personalLoans.map(l => ({ ...l, itemType: 'loan', bankLabel: l.lender })));
    }
    if (filterType === 'all' || filterType === 'cibil') {
      items.push(...this.creditScoreOffers.map(s => ({ ...s, itemType: 'cibil', bankLabel: s.provider })));
    }

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      items = items.filter(i => (i.name && i.name.toLowerCase().includes(query)) || (i.bankLabel && i.bankLabel.toLowerCase().includes(query)));
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching cards or offers found.</td></tr>`;
      return;
    }

    const settings = affiliateManager.settings;

    tbody.innerHTML = items.map(item => {
      const customUrl = settings.customLinks?.[item.id] || '';
      const resolvedUrl = affiliateManager.resolveUrl(item);
      const typeBadge = item.itemType === 'card' ? '💳 Card' : item.itemType === 'loan' ? '💰 Loan' : '📊 Score';
      const campaignBadge = item.cuelinksCampaign || 'Cuelinks Partner';
      const payoutBadge = item.cuelinksPayout || item.commissionRate || item.payoutNote || 'Standard CPA';

      return `
        <tr>
          <td>
            <div class="aff-card-meta">
              <span class="aff-card-name">${item.name}</span>
              <span class="aff-card-sub">${typeBadge} • ${item.bankLabel}</span>
            </div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.74rem; color: #065f46; font-weight: 700; background: #ecfdf5; padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.25);">
              🎯 ${campaignBadge}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-top: 0.2rem;">
              ${payoutBadge}
            </div>
          </td>
          <td>
            <input type="text" class="aff-override-input" data-item-id="${item.id}" placeholder="Optional custom override URL (or inherits Cuelinks)" value="${customUrl}" />
          </td>
          <td style="text-align: right;">
            <a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer" class="aff-test-btn" title="Open resolved Cuelinks tracking URL in new tab">
              Test ↗
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderAffiliateAnalytics() {
    const logs = affiliateManager.getClickLogs();
    const statTotalClicks = document.getElementById('statTotalClicks');
    const statActiveNetwork = document.getElementById('statActiveNetwork');
    const statTopCard = document.getElementById('statTopCard');
    const container = document.getElementById('clicksLogContainer');

    if (statTotalClicks) statTotalClicks.textContent = logs.length;
    if (statActiveNetwork) {
      const channelId = affiliateManager.settings.cuelinks?.channelId || affiliateManager.settings.networks?.cuelinks?.channelId || '317055';
      statActiveNetwork.textContent = `CUELINKS (CID: ${channelId})`;
    }

    if (logs.length > 0) {
      const counts = {};
      logs.forEach(l => { counts[l.name] = (counts[l.name] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (statTopCard) statTopCard.textContent = top ? `${top[0]} (${top[1]})` : '—';
    } else {
      if (statTopCard) statTopCard.textContent = '—';
    }

    if (!container) return;

    if (logs.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem; font-size: 0.85rem;">No outbound clicks recorded yet. Clicks on "Apply Now" buttons will be logged here in real-time.</div>`;
      return;
    }

    container.innerHTML = logs.map(l => {
      const timeStr = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = new Date(l.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `
        <div class="click-log-item">
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">${l.name}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${l.bank} • <span style="font-weight: 600; text-transform: uppercase; color: var(--brand-primary);">${l.network || 'network'}</span></div>
          </div>
          <div style="text-align: right;">
            <div class="click-log-time">${dateStr}, ${timeStr}</div>
            <a href="${l.destinationUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--brand-primary); text-decoration: underline;">Verify URL ↗</a>
          </div>
        </div>
      `;
    }).join('');
  }

  downloadClicksCSV() {
    const logs = affiliateManager.getClickLogs();
    if (logs.length === 0) {
      this.showToast('No click activity logs to export.', 'info');
      return;
    }

    let csv = 'Timestamp,Offer Name,Bank / Lender,Affiliate Network,Destination URL\n';
    logs.forEach(l => {
      csv += `"${l.timestamp}","${(l.name || '').replace(/"/g, '""')}","${(l.bank || '').replace(/"/g, '""')}","${l.network || ''}","${(l.destinationUrl || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instantcred-clicks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Clicks log downloaded as CSV.', 'success');
  }

  renderAffiliateCodeAndBackup() {
    const codeEl = document.getElementById('codeConfigPreview');
    if (codeEl) {
      codeEl.textContent = affiliateManager.generateConfigCode();
    }
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = type === 'success' ? ICONS.check : `<span style="display:inline-flex;">${ICONS.shieldCheck}</span>`;
    toast.innerHTML = `<span class="toast-icon" style="display:inline-flex;align-items:center;">${iconSvg}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  /* --------------------------------------------------------------------------
     8. Popular Searches & High-Intent Presets
     -------------------------------------------------------------------------- */
  applyPopularPreset(preset) {
    const bankSelect = document.getElementById('bankFilterSelect');
    const feeSelect = document.getElementById('feeFilterSelect');
    const searchInput = document.getElementById('searchInput');

    if (searchInput) searchInput.value = '';
    this.searchQuery = '';
    if (bankSelect) {
      bankSelect.value = 'all';
      this.selectedBank = 'all';
    }

    switch (preset) {
      case 'salary-30k':
        this.activeCategory = 'all';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.filteredCards = this.cards.filter(c => (c.eligibility?.minIncome || 0) <= 30000);
        this.renderCategoryChips();
        this.renderCards();
        this.updateResultsCount();
        this.scrollToCatalog();
        this.showToast('Filtered: Cards for income under ₹30,000 / mo', 'info');
        return;

      case 'cashback':
        this.activeCategory = 'Cashback';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing top cashback credit cards', 'info');
        break;

      case 'ltf':
        this.activeCategory = 'all';
        this.selectedFeeTier = 'free';
        if (feeSelect) feeSelect.value = 'free';
        this.showToast('Showing Lifetime Free (₹0 fee) cards', 'info');
        break;

      case 'amazon-flipkart':
        this.activeCategory = 'Shopping';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing best cards for Amazon & Flipkart', 'info');
        break;

      case 'upi-rupay':
        this.activeCategory = 'UPI & RuPay';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing RuPay UPI scan & pay cards', 'info');
        break;

      case 'fuel':
        this.activeCategory = 'Fuel Savers';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing best fuel savings cards', 'info');
        break;

      case 'travel-lounge':
        this.activeCategory = 'Travel & Miles';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing travel & airport lounge cards', 'info');
        break;

      case 'beginners':
        this.activeCategory = 'Guaranteed Approval';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
        this.showToast('Showing starter & high-feasibility cards', 'info');
        break;

      default:
        this.activeCategory = 'all';
        this.selectedFeeTier = 'all';
        if (feeSelect) feeSelect.value = 'all';
    }

    this.renderCategoryChips();
    this.applyFilters();
    this.scrollToCatalog();
  }

  scrollToCatalog() {
    const target = document.getElementById('card-directory');
    if (target) {
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
      window.scrollTo({
        top: target.offsetTop - headerHeight - 10,
        behavior: 'smooth'
      });
    }
  }

  /* --------------------------------------------------------------------------
     9. Global Event Listeners & Delegation
     -------------------------------------------------------------------------- */
  bindEvents() {
    const searchInput = document.getElementById('searchInput');
    const btnSubmitSearch = document.getElementById('btnSubmitSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.searchQuery = e.target.value;
          this.applyFilters();
          this.scrollToCatalog();
        }
      });
    }

    if (btnSubmitSearch) {
      btnSubmitSearch.addEventListener('click', () => {
        const val = searchInput ? searchInput.value : '';
        this.searchQuery = val;
        this.applyFilters();
        this.scrollToCatalog();
      });
    }

    const btnHeaderSearch = document.getElementById('btnHeaderSearch');
    if (btnHeaderSearch) {
      btnHeaderSearch.addEventListener('click', () => {
        const searchSection = document.querySelector('.search-bar-section');
        const isMobile = window.innerWidth <= 860;
        if (isMobile && searchSection) {
          const isOpen = searchSection.classList.toggle('mobile-search-open');
          btnHeaderSearch.classList.toggle('active', isOpen);
          if (isOpen) {
            if (searchInput) {
              setTimeout(() => {
                searchInput.focus();
                searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }
        } else if (searchInput) {
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => searchInput.focus(), 300);
        }
      });
    }

    // Popular Searches Presets & Keyword Pills
    const popularContainer = document.getElementById('popularSearchesContainer');
    if (popularContainer) {
      popularContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.popular-pill, .popular-chip');
        if (!pill) return;
        popularContainer.querySelectorAll('.popular-pill, .popular-chip').forEach(c => c.classList.remove('active'));
        pill.classList.add('active');

        if (pill.dataset.searchKeyword) {
          const keyword = pill.dataset.searchKeyword;
          if (searchInput) searchInput.value = keyword;
          this.searchQuery = keyword;
          this.applyFilters();
          this.scrollToCatalog();
        } else if (pill.dataset.popularPreset) {
          this.applyPopularPreset(pill.dataset.popularPreset);
        }
      });
    }

    const categoryContainer = document.getElementById('categoryChipsContainer');
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        const moreBtn = e.target.closest('.chip-more-trigger');
        if (moreBtn) {
          const modal = document.getElementById('categoryPickerModal');
          if (modal) modal.classList.add('open');
          return;
        }
        const chip = e.target.closest('.category-card-btn, .category-chip');
        if (chip) {
          this.activeCategory = chip.dataset.categoryId;
          this.renderCategoryChips();
          this.applyFilters();
          this.scrollToCatalog();
        }
      });
    }

    const categoryPickerModal = document.getElementById('categoryPickerModal');
    if (categoryPickerModal) {
      categoryPickerModal.addEventListener('click', (e) => {
        const item = e.target.closest('[data-sheet-category-id]');
        if (item) {
          const categoryId = item.dataset.sheetCategoryId;
          this.activeCategory = categoryId;
          this.renderCategoryChips();
          this.applyFilters();
          categoryPickerModal.classList.remove('open');
          
          const target = document.getElementById('card-directory');
          if (target) {
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderCategoryChips();
      }, 150);
    });

    const bankSelect = document.getElementById('bankFilterSelect');
    if (bankSelect) {
      bankSelect.addEventListener('change', (e) => {
        this.selectedBank = e.target.value;
        this.applyFilters();
      });
    }

    const feeSelect = document.getElementById('feeFilterSelect');
    if (feeSelect) {
      feeSelect.addEventListener('change', (e) => {
        this.selectedFeeTier = e.target.value;
        this.applyFilters();
      });
    }

    const netSelect = document.getElementById('networkFilterSelect');
    if (netSelect) {
      netSelect.addEventListener('change', (e) => {
        this.selectedNetwork = e.target.value;
        this.applyFilters();
      });
    }

    const sortSelect = document.getElementById('sortBySelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    const mobileQuickStrip = document.getElementById('mobileQuickFilterStrip');
    if (mobileQuickStrip) {
      mobileQuickStrip.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-filter-chip');
        if (!chip) return;
        
        mobileQuickStrip.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filterType = chip.dataset.quickFilter;
        if (filterType === 'all') {
          this.activeCategory = 'all';
          this.selectedFeeTier = 'all';
          this.selectedNetwork = 'all';
          const feeSel = document.getElementById('feeFilterSelect');
          if (feeSel) feeSel.value = 'all';
          const netSel = document.getElementById('networkFilterSelect');
          if (netSel) netSel.value = 'all';
        } else if (filterType === 'free') {
          this.selectedFeeTier = 'free';
          const feeSel = document.getElementById('feeFilterSelect');
          if (feeSel) feeSel.value = 'free';
        } else if (filterType === 'cashback') {
          this.activeCategory = 'Cashback';
        } else if (filterType === 'lounge') {
          this.activeCategory = 'Lounge';
        } else if (filterType === 'rupay') {
          this.selectedNetwork = 'RuPay';
          const netSel = document.getElementById('networkFilterSelect');
          if (netSel) netSel.value = 'RuPay';
        } else if (filterType === 'instant') {
          this.activeCategory = 'High Approval';
        }

        this.renderCategoryChips();
        this.applyFilters();
      });
    }

    document.querySelectorAll('.btn-launch-quiz').forEach(btn => {
      btn.addEventListener('click', () => this.openQuizModal());
    });

    const btnShareSite = document.getElementById('btnShareSite');
    if (btnShareSite) {
      btnShareSite.addEventListener('click', async () => {
        const shareData = {
          title: 'InstantCred | Credit Card Comparisons & Financial Analytics',
          text: 'Compare top credit cards and instant personal loans in India with transparent rewards analytics on InstantCred.in',
          url: 'https://www.instantcred.in/'
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText('https://www.instantcred.in/');
            this.showToast('Link copied to clipboard! Share it with your friends.', 'success');
          } else {
            const input = document.createElement('input');
            input.value = 'https://www.instantcred.in/';
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showToast('Link copied to clipboard!', 'success');
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error:', err);
          }
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.id === 'btnResetAllFilters') {
        this.activeCategory = 'all';
        this.selectedBank = 'all';
        this.selectedFeeTier = 'all';
        this.selectedNetwork = 'all';
        this.searchQuery = '';
        if (searchInput) searchInput.value = '';
        if (bankSelect) bankSelect.value = 'all';
        if (feeSelect) feeSelect.value = 'all';
        if (netSelect) netSelect.value = 'all';
        this.renderCategoryChips();
        this.applyFilters();
      }
    });

    document.addEventListener('click', (e) => {
      const applyBtn = e.target.closest('.btn-outbound-apply');
      if (applyBtn) {
        e.preventDefault();
        const cardId = applyBtn.dataset.cardId;
        if (cardId) this.handleOutboundApply(cardId);
        return;
      }

      const compareBtn = e.target.closest('.btn-compare');
      if (compareBtn) {
        const cardId = compareBtn.dataset.compareId;
        const res = this.comparator.toggleCard(cardId);
        if (!res.success) {
          this.showToast(res.message, 'info');
        }
        return;
      }

      const removePillBtn = e.target.closest('.btn-remove-pill, .comp-remove-card-btn');
      if (removePillBtn) {
        const cardId = removePillBtn.dataset.removeId;
        this.comparator.removeCard(cardId);
        return;
      }

      if (e.target.id === 'btnClearCompare') {
        this.comparator.clearAll();
        return;
      }

      if (e.target.id === 'btnOpenCompareModal') {
        this.openComparatorModal();
        return;
      }

      const compModeBtn = e.target.closest('[data-comp-mode]');
      if (compModeBtn) {
        this.comparator.mobileViewMode = compModeBtn.dataset.compMode;
        const content = document.getElementById('compareModalContent');
        if (content) {
          content.innerHTML = this.comparator.renderComparisonMatrixHTML(affiliateManager);
        }
        return;
      }

      const compPairBtn = e.target.closest('[data-comp-pair]');
      if (compPairBtn) {
        this.comparator.activePairIndex = parseInt(compPairBtn.dataset.compPair, 10);
        const content = document.getElementById('compareModalContent');
        if (content) {
          content.innerHTML = this.comparator.renderComparisonMatrixHTML(affiliateManager);
        }
        return;
      }

      const openDetailTrigger = e.target.closest('[data-open-card-id]');
      if (openDetailTrigger) {
        const cardId = openDetailTrigger.dataset.openCardId;
        this.openCardDetails(cardId);
        return;
      }

      const openModalTrigger = e.target.closest('[data-open-modal]');
      if (openModalTrigger) {
        e.preventDefault();
        const modalId = openModalTrigger.dataset.openModal;
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
        return;
      }

      const calcSectionLink = e.target.closest('a[href="#calculator-section"]');
      if (calcSectionLink) {
        e.preventDefault();
        if (this.setCalculatorState) {
          this.setCalculatorState(true);
        }
        const target = document.getElementById('calculator-section');
        if (target) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 5;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        return;
      }

      const loansSectionLink = e.target.closest('a[href="#loans-section"]');
      if (loansSectionLink) {
        e.preventDefault();
        const target = document.getElementById('loans-section');
        if (target) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
          const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 5;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        return;
      }

      const closeBtn = e.target.closest('.btn-close-icon, .btn-close-modal, .btn-cancel-modal');
      if (closeBtn) {
        const modal = closeBtn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('open');
        return;
      }

      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('open');
      }
    });
  }
}

function initInstantCredApp() {
  if (!window.app) {
    window.app = new App();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInstantCredApp);
} else {
  initInstantCredApp();
}
