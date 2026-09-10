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
     1. Category Chips & Filters
     -------------------------------------------------------------------------- */
  renderCategoryChips() {
    const container = document.getElementById('categoryChipsContainer');
    if (!container) return;

    // Filter categories to only those that have at least one card in this.cards
    const availableCategories = CATEGORIES.filter(cat => {
      if (cat.id === 'all') return true;
      return this.cards.some(card => 
        card.primaryCategory === cat.id || (card.categories && card.categories.includes(cat.id))
      );
    });

    if (this.activeCategory !== 'all' && !availableCategories.some(c => c.id === this.activeCategory)) {
      this.activeCategory = 'all';
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    if (isMobile) {
      // Curated quick access on mobile: "all", "Cashback", "Lifetime Free"
      const curatedIds = ['all', 'Cashback', 'Lifetime Free'];
      const topChips = availableCategories.filter(cat => curatedIds.includes(cat.id));
      
      // If current activeCategory is NOT in the topChips, show it dynamically as active chip
      const activeCatObj = availableCategories.find(c => c.id === this.activeCategory);
      const isCustomActive = activeCatObj && !topChips.some(c => c.id === activeCatObj.id);

      const chipsHtml = topChips.map(cat => `
        <button type="button" class="category-chip ${cat.id === this.activeCategory ? 'active' : ''}" data-category-id="${cat.id}">
          <span>${cat.label}</span>
        </button>
      `).join('');

      const customActiveChipHtml = isCustomActive ? `
        <button type="button" class="category-chip active" data-category-id="${activeCatObj.id}">
          <span style="display:inline-flex; align-items:center; gap:4px;">${ICONS.check} ${activeCatObj.label}</span>
        </button>
      ` : '';

      const moreLabel = isCustomActive 
        ? `More Categories ▾`
        : `<span style="display:inline-flex; align-items:center; gap:5px;">${ICONS.tagFolder} All Categories (${availableCategories.length}) ▾</span>`;

      container.innerHTML = `
        ${chipsHtml}
        ${customActiveChipHtml}
        <button type="button" class="category-chip chip-more-trigger ${isCustomActive ? 'has-active' : ''}" id="btnOpenCategoryPicker" aria-label="View all categories" data-open-modal="categoryPickerModal">
          <span>${moreLabel}</span>
        </button>
      `;
    } else {
      // Desktop: wrap all available chips
      container.innerHTML = availableCategories.map(cat => `
        <button type="button" class="category-chip ${cat.id === this.activeCategory ? 'active' : ''}" data-category-id="${cat.id}">
          <span>${cat.label}</span>
        </button>
      `).join('');
    }

    this.renderCategoryPickerModal(availableCategories);
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
     2. Card Rendering
     -------------------------------------------------------------------------- */
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
      
      let tagClass = 'badge-tag';
      if (card.isLifetimeFree) tagClass += ' tag-free';

      return `
        <article class="card-item" data-card-id="${card.id}">
          <div class="card-item-header">
            <div class="card-badges-left">
              <span class="${tagClass}">${card.tag}</span>
              <span class="badge-approval ${card.approvalTier || 'moderate'}">${card.approvalLabel || 'Standard'}</span>
            </div>
            <div class="rating-badge">
              <span class="rating-star-svg">${ICONS.star}</span>
              <span>${card.rating.toFixed(1)}</span>
            </div>
          </div>

          <!-- Authentic Card Artwork -->
          <div class="credit-card-render-wrapper" data-open-card-id="${card.id}" title="View card specifications">
            <div class="credit-card-visual theme-${card.cardTheme}">
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
          </div>

          <!-- Card Details Body -->
          <div class="card-details-body">
            <h3 class="card-main-title">${card.name}</h3>
            <div class="card-cashback-summary">${card.cashbackSummary}</div>

            <!-- Financial Metrics Grid -->
            <div class="metrics-row">
              <div class="metric-box">
                <span class="metric-label">Joining Fee</span>
                <span class="metric-value ${card.joiningFee === 0 ? 'free' : ''}">
                  ${card.joiningFee === 0 ? 'FREE' : `₹${card.joiningFee.toLocaleString('en-IN')}`}
                </span>
                <span class="metric-sub">${card.joiningFee === 0 ? 'Zero Joining' : '+ GST'}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Annual Fee</span>
                <span class="metric-value ${card.annualFee === 0 ? 'free' : ''}">
                  ${card.annualFee === 0 ? 'Lifetime Free' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                </span>
                <span class="metric-sub">${card.feeWaiverSpend > 0 ? `Waived on ₹${(card.feeWaiverSpend / 100000).toFixed(1)}L spend` : (card.annualFee === 0 ? 'No Annual Fee' : 'Non-waivable')}</span>
              </div>
            </div>

            <!-- Key Perks -->
            <ul class="perks-list">
              ${card.keyPerks.slice(0, 3).map(perk => `
                <li class="perk-item">
                  <span class="perk-icon">${ICONS.check}</span>
                  <span>${perk}</span>
                </li>
              `).join('')}
            </ul>

            <!-- Action Buttons -->
            <div class="card-actions-row">
              <button type="button" class="btn btn-secondary btn-compare ${isSelectedForCompare ? 'selected' : ''}" data-compare-id="${card.id}">
                ${isSelectedForCompare ? `${ICONS.check} Selected` : '+ Compare'}
              </button>
              <button type="button" class="btn btn-secondary btn-details" data-open-card-id="${card.id}" title="View Details">
                Specs
              </button>
              <button type="button" class="btn btn-apply btn-outbound-apply" data-card-id="${card.id}">
                Apply on Bank Site ↗
              </button>
            </div>
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
          <span class="smart-match-step-badge">STEP 1 OF 3 • FINANCIAL PROFILE</span>
          <h3 class="smart-match-title">What is your monthly in-hand salary?</h3>
          <p class="smart-match-subtitle">We calculate exact bank underwriting income requirements to maximize your instant approval odds.</p>
        </div>
        <div class="smart-match-grid">
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'low' ? 'selected' : ''}" data-quiz-choice="income" data-val="low">
            <div class="tile-icon-box">${ICONS.briefcase}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Below ₹30,000 / mo</span>
                <span class="tile-tag">Entry</span>
              </div>
              <span class="tile-desc">Zero annual fee & entry-level cashback cards</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'mid' ? 'selected' : ''}" data-quiz-choice="income" data-val="mid">
            <div class="tile-icon-box">${ICONS.cards}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹30,000 – ₹75,000 / mo</span>
                <span class="tile-tag">Growth</span>
              </div>
              <span class="tile-desc">High cashback on dining, food & shopping</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'high' ? 'selected' : ''}" data-quiz-choice="income" data-val="high">
            <div class="tile-icon-box">${ICONS.diamond}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">₹75,000 – ₹1.5L / mo</span>
                <span class="tile-tag">Premium</span>
              </div>
              <span class="tile-desc">Airport lounge access, rewards & air miles</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.income === 'ultra' ? 'selected' : ''}" data-quiz-choice="income" data-val="ultra">
            <div class="tile-icon-box">${ICONS.crown}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Above ₹1.5 Lakh / mo</span>
                <span class="tile-tag">Executive</span>
              </div>
              <span class="tile-desc">Super-premium luxury & international travel</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    } else if (step === 2) {
      contentHTML = `
        <div class="smart-match-header">
          <span class="smart-match-step-badge">STEP 2 OF 3 • SPENDING HABITS</span>
          <h3 class="smart-match-title">Where do you spend the most each month?</h3>
          <p class="smart-match-subtitle">We prioritize cards offering the highest accelerator multipliers for your top spend category.</p>
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
                <span class="tile-title">Dining & Food Delivery</span>
                <span class="tile-tag">10% Off</span>
              </div>
              <span class="tile-desc">Swiggy, Zomato, cafes & gourmet dining</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'travel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="travel">
            <div class="tile-icon-box">${ICONS.catTravel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Flights, Hotels & Travel</span>
                <span class="tile-tag">Air Miles</span>
              </div>
              <span class="tile-desc">Flight bookings, hotel stays & 0% forex</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.primarySpend === 'fuel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="fuel">
            <div class="tile-icon-box">${ICONS.catFuel}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Fuel & Commuting</span>
                <span class="tile-tag">Fee Waiver</span>
              </div>
              <span class="tile-desc">Petrol, diesel, EV charging & toll gates</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    } else if (step === 3) {
      contentHTML = `
        <div class="smart-match-header">
          <span class="smart-match-step-badge">STEP 3 OF 3 • MUST-HAVE FEATURE</span>
          <h3 class="smart-match-title">Which card benefit matters most to you?</h3>
          <p class="smart-match-subtitle">Select the core feature you want unlocked on your new card.</p>
        </div>
        <div class="smart-match-grid">
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'cashback' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="cashback">
            <div class="tile-icon-box">${ICONS.catCashback}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Direct Statement Cashback</span>
                <span class="tile-tag">High ROI</span>
              </div>
              <span class="tile-desc">Direct cash credits deducted from your bills</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'ltf' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="ltf">
            <div class="tile-icon-box">${ICONS.catLifetimeFree}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Zero Annual Fee Forever</span>
                <span class="tile-tag">Lifetime Free</span>
              </div>
              <span class="tile-desc">No joining fee, no annual charges, zero stress</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'lounge' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="lounge">
            <div class="tile-icon-box">${ICONS.catLounge}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">Airport Lounge Access</span>
                <span class="tile-tag">Luxury</span>
              </div>
              <span class="tile-desc">Free food, Wi-Fi & relaxation before flights</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
          <button type="button" class="smart-match-tile ${this.quiz.answers.topPriority === 'upi' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="upi">
            <div class="tile-icon-box">${ICONS.catUpi}</div>
            <div class="tile-content">
              <div class="tile-top-row">
                <span class="tile-title">RuPay UPI QR Payments</span>
                <span class="tile-tag">Everyday UPI</span>
              </div>
              <span class="tile-desc">Scan any merchant UPI QR code & earn rewards</span>
            </div>
            <div class="tile-radio-indicator"></div>
          </button>
        </div>
      `;
    }

    const navHTML = `
      <div class="smart-match-nav-bar">
        ${step > 1 ? `<button type="button" class="btn-smart-back" id="btnQuizBack">← Previous</button>` : `<div></div>`}
        <span class="smart-match-confidential" style="display:inline-flex;align-items:center;gap:5px;">${ICONS.lock} 100% Private • No phone number needed</span>
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

    // Map top priority / spend to catalog category for the bridge button
    const categoryBridgeMap = {
      'shopping': 'Online Shopping',
      'dining': 'Dining & Food',
      'travel': 'Travel',
      'fuel': 'Fuel Savers',
      'cashback': 'Cashback',
      'ltf': 'Lifetime Free',
      'lounge': 'Airport Lounge',
      'upi': 'UPI & RuPay'
    };
    const targetCategory = categoryBridgeMap[this.quiz.answers.topPriority] || categoryBridgeMap[this.quiz.answers.primarySpend] || 'Cashback';

    container.innerHTML = `
      <div class="match-results-hero">
        <div class="match-success-icon">${ICONS.target}</div>
        <h3 class="match-results-title">Your Top Card Matches</h3>
        <p class="match-results-sub">Matched based on your salary tier, primary spending, and must-have rewards.</p>
      </div>

      <div class="match-cards-grid">
        ${matched.map((item, idx) => {
          const isFirst = idx === 0;
          const badgeClass = isFirst ? 'best-match' : 'alt-match';
          const badgeText = isFirst ? '98% BEST MATCH' : '94% GREAT ALTERNATIVE';
          const finalUrl = affiliateManager.resolveUrl(item.card);

          return `
            <div class="match-card-item">
              <div class="match-card-badge-row">
                <span class="match-badge-tag ${badgeClass}"><span style="display:inline-flex;align-items:center;margin-right:4px;">${ICONS.sparkles}</span> ${badgeText}</span>
                <span class="match-card-rating" style="display:inline-flex;align-items:center;gap:3px;"><span class="star-svg">${ICONS.star}</span> ${item.card.rating || '4.8'}</span>
              </div>
              <h4 class="match-card-name">${item.card.name}</h4>
              <span class="match-card-bank">${item.card.bank}</span>
              
              <div class="match-cashback-box">
                <strong>Top Benefit:</strong> ${item.card.cashbackSummary}
              </div>

              <div class="match-reason-box">
                <span style="display:inline-flex;align-items:center;margin-right:4px;color:var(--brand-primary);">${ICONS.bulb}</span> <strong>Why it matches you:</strong> ${item.reasonText}
              </div>

              <div class="match-fee-pill">
                ${item.card.isLifetimeFree ? 'Lifetime Free (₹0 Joining • ₹0 Annual)' : `Joining: ₹${(item.card.joiningFee || 0).toLocaleString('en-IN')} | Renewal: ₹${(item.card.annualFee || 0).toLocaleString('en-IN')}${item.card.feeWaiverSpend > 0 ? ` (Waived on ₹${item.card.feeWaiverSpend.toLocaleString('en-IN')})` : ''}`}
              </div>

              <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-outbound-apply" data-card-id="${item.card.id}" style="width: 100%; text-align: center; margin-top: auto;">
                Apply on Bank Site ↗
              </a>
            </div>
          `;
        }).join('')}
      </div>

      <div class="match-bridge-bar">
        <button type="button" class="btn-filter-match" id="btnFilterMatchCards">
          <span style="display:inline-flex;align-items:center;margin-right:6px;">${ICONS.target}</span> View All "${targetCategory}" Cards in Catalog →
        </button>
        <button type="button" class="btn-retake-match" id="btnRestartQuiz">
          <span style="display:inline-flex;align-items:center;margin-right:5px;">${ICONS.reload}</span> Retake Smart Match
        </button>
      </div>
    `;

    const bridgeBtn = document.getElementById('btnFilterMatchCards');
    if (bridgeBtn) {
      bridgeBtn.addEventListener('click', () => {
        const modal = document.getElementById('quizModal');
        if (modal) modal.classList.remove('open');
        this.activeCategory = targetCategory;
        this.renderCategoryChips();
        this.applyFilters();
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
    const gateScreen = document.getElementById('affiliateGateScreen');
    const realScreen = document.getElementById('affiliateRealScreen');
    const adminForm = document.getElementById('formAffiliateAdminUnlock');
    const adminPwInput = document.getElementById('inputAffiliateAdminPassword');
    const adminError = document.getElementById('affiliateAdminError');
    const adminErrorText = document.getElementById('affiliateAdminErrorText');
    const btnToggleEye = document.getElementById('btnToggleAdminPw');
    const btnUnlock = document.getElementById('btnUnlockAffiliateConsole');
    const btnLockConsole = document.getElementById('btnLockAffiliateConsole');
    const saveBtn = document.getElementById('btnSaveAffiliateSettings');
    const btnAffConfig = document.getElementById('btnOpenAffiliateModal');

    const ADMIN_AUTH_KEY = "Dominar@9008!@#$%";
    const isAuthed = () => sessionStorage.getItem('instantcred_aff_admin_authed') === 'true';

    const showGate = () => {
      if (gateScreen) gateScreen.style.display = 'block';
      if (realScreen) realScreen.style.display = 'none';
      if (adminPwInput) adminPwInput.value = '';
      if (adminError) adminError.style.display = 'none';
    };

    const showReal = () => {
      if (gateScreen) gateScreen.style.display = 'none';
      if (realScreen) realScreen.style.display = 'block';
      populateNetworkInputs();
      this.renderAffiliateOffersTable();
      this.renderAffiliateAnalytics();
      this.renderAffiliateCodeAndBackup();
    };

    const handleUnlock = () => {
      const enteredPw = adminPwInput ? adminPwInput.value.trim() : '';
      if (enteredPw === ADMIN_AUTH_KEY) {
        sessionStorage.setItem('instantcred_aff_admin_authed', 'true');
        showReal();
        this.showToast('Administrator Access Granted', 'success');
      } else {
        if (adminError) {
          adminError.style.display = 'flex';
          if (adminErrorText) adminErrorText.textContent = 'Invalid authorization key. Access restricted. Please wait for latest public updates.';
          adminError.classList.remove('aff-shake');
          void adminError.offsetWidth;
          adminError.classList.add('aff-shake');
        }
        if (adminPwInput) {
          adminPwInput.classList.remove('aff-shake');
          void adminPwInput.offsetWidth;
          adminPwInput.classList.add('aff-shake');
          adminPwInput.value = '';
          adminPwInput.focus();
        }
      }
    };

    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUnlock();
      });
    }

    if (btnUnlock) {
      btnUnlock.addEventListener('click', (e) => {
        e.preventDefault();
        handleUnlock();
      });
    }

    if (btnToggleEye && adminPwInput) {
      btnToggleEye.addEventListener('click', () => {
        const isPw = adminPwInput.type === 'password';
        adminPwInput.type = isPw ? 'text' : 'password';
        btnToggleEye.textContent = isPw ? '🙈' : '👁️';
      });
    }

    if (btnLockConsole) {
      btnLockConsole.addEventListener('click', () => {
        sessionStorage.removeItem('instantcred_aff_admin_authed');
        showGate();
        this.showToast('Affiliate Control Center Locked', 'info');
      });
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

    // Populate Tab 1: Networks & Credentials
    const populateNetworkInputs = () => {
      const settings = affiliateManager.settings;
      const primaryNet = settings.primaryNetwork || 'vcommission';

      // Set active network radio & card styling
      document.querySelectorAll('.network-card').forEach(card => {
        const net = card.dataset.network;
        const radio = card.querySelector('input[type="radio"]');
        if (net === primaryNet) {
          card.classList.add('active');
          if (radio) radio.checked = true;
        } else {
          card.classList.remove('active');
          if (radio) radio.checked = false;
        }
      });

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

      // Show matching network panel
      const panels = ['vcommission', 'cuelinks', 'earnkaro', 'impact', 'direct'];
      panels.forEach(p => {
        const el = document.getElementById(`panel-${p}`);
        if (el) el.style.display = p === primaryNet ? 'block' : 'none';
      });

      // vCommission inputs
      const inputVcommAffId = document.getElementById('inputVcommAffId');
      const inputVcommSubId = document.getElementById('inputVcommSubId');
      const inputVcommSubId2 = document.getElementById('inputVcommSubId2');
      if (inputVcommAffId) inputVcommAffId.value = settings.networks?.vcommission?.affiliateId || '';
      if (inputVcommSubId) inputVcommSubId.value = settings.networks?.vcommission?.subId || '';
      if (inputVcommSubId2) inputVcommSubId2.value = settings.networks?.vcommission?.subId2 || '';

      // Cuelinks inputs
      const inputCuelinksPubId = document.getElementById('inputCuelinksPubId');
      const inputCuelinksSubId = document.getElementById('inputCuelinksSubId');
      const selectCuelinksFormat = document.getElementById('selectCuelinksFormat');
      const toggleCuelinksScript = document.getElementById('toggleCuelinksScript');
      const cuelinksScriptStatusText = document.getElementById('cuelinksScriptStatusText');

      if (inputCuelinksPubId) inputCuelinksPubId.value = settings.networks?.cuelinks?.pubId || '';
      if (inputCuelinksSubId) inputCuelinksSubId.value = settings.networks?.cuelinks?.subId || '';
      if (selectCuelinksFormat) selectCuelinksFormat.value = settings.networks?.cuelinks?.redirectFormat || 'cprewritten';
      if (toggleCuelinksScript) {
        toggleCuelinksScript.checked = !!settings.networks?.cuelinks?.enableAutoTaggingScript;
        if (cuelinksScriptStatusText) {
          cuelinksScriptStatusText.textContent = toggleCuelinksScript.checked
            ? 'Active (Auto-tagging direct bank links via JS)'
            : 'Disabled (Using Redirection Links)';
          cuelinksScriptStatusText.style.color = toggleCuelinksScript.checked ? 'var(--brand-success)' : 'var(--text-secondary)';
        }
      }

      // EarnKaro inputs
      const inputEarnkaroUserId = document.getElementById('inputEarnkaroUserId');
      const inputEarnkaroSubId = document.getElementById('inputEarnkaroSubId');
      if (inputEarnkaroUserId) inputEarnkaroUserId.value = settings.networks?.earnkaro?.userId || '';
      if (inputEarnkaroSubId) inputEarnkaroSubId.value = settings.networks?.earnkaro?.subId || '';

      // Impact inputs
      const inputImpactMpId = document.getElementById('inputImpactMpId');
      const inputImpactSubId = document.getElementById('inputImpactSubId');
      if (inputImpactMpId) inputImpactMpId.value = settings.networks?.impact?.mediaPartnerId || '';
      if (inputImpactSubId) inputImpactSubId.value = settings.networks?.impact?.campaignSubId || '';

      // Direct UTM inputs
      const inputUtmSource = document.getElementById('inputUtmSource');
      const inputUtmMedium = document.getElementById('inputUtmMedium');
      const inputUtmCampaign = document.getElementById('inputUtmCampaign');
      if (inputUtmSource) inputUtmSource.value = settings.networks?.direct?.utmSource || '';
      if (inputUtmMedium) inputUtmMedium.value = settings.networks?.direct?.utmMedium || '';
      if (inputUtmCampaign) inputUtmCampaign.value = settings.networks?.direct?.utmCampaign || '';

      this.updateAffiliateLivePreview();
    };

    populateNetworkInputs();

    // Network Card Selection
    document.querySelectorAll('.network-card').forEach(card => {
      card.addEventListener('click', () => {
        const net = card.dataset.network;
        document.querySelectorAll('.network-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        const panels = ['vcommission', 'cuelinks', 'earnkaro', 'impact', 'direct'];
        panels.forEach(p => {
          const el = document.getElementById(`panel-${p}`);
          if (el) el.style.display = p === net ? 'block' : 'none';
        });

        this.updateAffiliateLivePreview();
      });
    });

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

    // Modal Open Refresh with Auth Check
    if (btnAffConfig) {
      btnAffConfig.addEventListener('click', () => {
        if (isAuthed()) {
          showReal();
        } else {
          showGate();
        }
        if (affiliateModal) affiliateModal.classList.add('open');
      });

      // Also listen for hash navigation
      const checkDiagnosticsHash = () => {
        if (window.location.hash === '#system-diagnostics' || window.location.hash === '#affiliate-admin') {
          btnAffConfig.click();
        }
      };
      window.addEventListener('hashchange', checkDiagnosticsHash);
      if (window.location.hash === '#system-diagnostics' || window.location.hash === '#affiliate-admin') {
        setTimeout(checkDiagnosticsHash, 250);
      }
    }

    const btnSave = document.getElementById('btnSaveAffiliateSettings');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="affPrimaryNetwork"]:checked');
        const selectedNetwork = selectedRadio ? selectedRadio.value : 'cuelinks';

        const vcommAffId = document.getElementById('inputVcommAffId')?.value.trim() || '131993';
        const vcommSubId = document.getElementById('inputVcommSubId')?.value.trim() || 'instantcred_web';
        const vcommSubId2 = document.getElementById('inputVcommSubId2')?.value.trim() || '';

        const cuelinksPubId = document.getElementById('inputCuelinksPubId')?.value.trim() || '271664';
        const cuelinksSubId = document.getElementById('inputCuelinksSubId')?.value.trim() || 'instantcred_web';
        const selectCuelinksFormat = document.getElementById('selectCuelinksFormat')?.value || 'linksredirect';
        const isScriptEnabled = document.getElementById('toggleCuelinksScript')?.checked || false;

        const earnkaroUserId = document.getElementById('inputEarnkaroUserId')?.value.trim() || '';
        const earnkaroSubId = document.getElementById('inputEarnkaroSubId')?.value.trim() || 'instantcred_web';

        const impactMpId = document.getElementById('inputImpactMpId')?.value.trim() || '';
        const impactSubId = document.getElementById('inputImpactSubId')?.value.trim() || 'instantcred_web';

        const utmSource = document.getElementById('inputUtmSource')?.value.trim() || 'instantcred';
        const utmMedium = document.getElementById('inputUtmMedium')?.value.trim() || 'affiliate';
        const utmCampaign = document.getElementById('inputUtmCampaign')?.value.trim() || 'credit_cards_2026';

        const hideNonAffiliate = document.getElementById('toggleHideNonAffiliate')
          ? document.getElementById('toggleHideNonAffiliate').checked
          : true;

        // Collect custom link overrides
        const customLinks = { ...affiliateManager.settings.customLinks };
        const networkOverrides = { ...affiliateManager.settings.networkOverrides };

        document.querySelectorAll('.aff-override-input').forEach(input => {
          const id = input.dataset.itemId;
          const val = input.value.trim();
          if (val) {
            customLinks[id] = val;
          } else {
            delete customLinks[id];
          }
        });

        document.querySelectorAll('.aff-route-select').forEach(select => {
          const id = select.dataset.itemId;
          const val = select.value;
          if (val && val !== 'default') {
            networkOverrides[id] = val;
          } else {
            delete networkOverrides[id];
          }
        });

        const newSettings = {
          primaryNetwork: selectedNetwork,
          hideNonAffiliateCards: hideNonAffiliate,
          networks: {
            vcommission: {
              name: 'vCommission',
              affiliateId: vcommAffId,
              subId: vcommSubId,
              subId2: vcommSubId2
            },
            cuelinks: {
              name: 'Cuelinks',
              pubId: cuelinksPubId,
              channelId: affiliateManager.settings.networks?.cuelinks?.channelId || '317055',
              subId: cuelinksSubId,
              enableAutoTaggingScript: isScriptEnabled,
              redirectFormat: selectCuelinksFormat
            },
            earnkaro: {
              name: 'EarnKaro',
              userId: earnkaroUserId,
              subId: earnkaroSubId
            },
            impact: {
              name: 'Impact.com',
              mediaPartnerId: impactMpId,
              campaignSubId: impactSubId
            },
            direct: {
              name: 'Direct Official Bank Links',
              utmSource: utmSource,
              utmMedium: utmMedium,
              utmCampaign: utmCampaign
            }
          },
          customLinks,
          networkOverrides
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

        this.showToast('Affiliate settings saved and active!', 'success');
        if (affiliateModal) affiliateModal.classList.remove('open');
      });
    }
  }

  updateAffiliateLivePreview() {
    const selectedRadio = document.querySelector('input[name="affPrimaryNetwork"]:checked');
    const net = selectedRadio ? selectedRadio.value : 'cuelinks';
    const sampleCard = this.cards.find(c => c.id === 'sbi-cashback') || this.cards[0] || { id: 'sbi-cashback', name: 'SBI Cashback Credit Card', directUrl: 'https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page', affiliateUrl: '' };

    const previewNameEl = document.getElementById('previewCardName');
    const previewUrlEl = document.getElementById('previewResolvedUrl');
    if (previewNameEl) previewNameEl.textContent = sampleCard.name;

    const vcommAffId = document.getElementById('inputVcommAffId')?.value.trim() || '131993';
    const vcommSubId = document.getElementById('inputVcommSubId')?.value.trim() || 'instantcred_web';
    const cuelinksPubId = document.getElementById('inputCuelinksPubId')?.value.trim() || '271664';
    const cuelinksSubId = document.getElementById('inputCuelinksSubId')?.value.trim() || 'instantcred_web';
    const cuelinksFormat = document.getElementById('selectCuelinksFormat')?.value || 'linksredirect';
    const isScript = document.getElementById('toggleCuelinksScript')?.checked || false;
    const earnkaroId = document.getElementById('inputEarnkaroUserId')?.value.trim() || 'YOUR_EARNKARO_ID';
    const impactMpId = document.getElementById('inputImpactMpId')?.value.trim() || 'YOUR_IMPACT_MP_ID';
    const utmSrc = document.getElementById('inputUtmSource')?.value.trim() || 'instantcred';

    let previewUrl = '';
    const directUrl = sampleCard.directUrl;

    if (net === 'cuelinks') {
      const channelId = affiliateManager.settings.networks?.cuelinks?.channelId || '317055';
      if (isScript && cuelinksPubId !== 'YOUR_CUELINKS_PUB_ID') {
        previewUrl = `${directUrl} (Auto-monetized via Cuelinks JS Widget)`;
      } else if (cuelinksFormat === 'linksredirect') {
        previewUrl = `https://linksredirect.com/?cid=${encodeURIComponent(channelId)}&subid=${encodeURIComponent(cuelinksSubId)}&url=${encodeURIComponent(directUrl)}`;
      } else {
        previewUrl = `https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=${encodeURIComponent(cuelinksPubId)}&sub_id=${encodeURIComponent(cuelinksSubId)}&url=${encodeURIComponent(directUrl)}`;
      }
    } else if (net === 'earnkaro') {
      previewUrl = `https://earnkaro.com/deal/redirect?deal_id=${encodeURIComponent(directUrl)}&r=${encodeURIComponent(earnkaroId)}&subid=${encodeURIComponent(vcommSubId)}`;
    } else if (net === 'impact') {
      previewUrl = `${directUrl}?irclickid=instantcred_web&mpid=${encodeURIComponent(impactMpId)}`;
    } else if (net === 'direct') {
      previewUrl = `${directUrl}?utm_source=${encodeURIComponent(utmSrc)}&utm_medium=affiliate&utm_campaign=credit_cards_2026`;
    } else {
      previewUrl = `https://tracking.vcommission.com/aff_c?offer_id=idfc_first_wow&aff_id=${encodeURIComponent(vcommAffId)}&aff_sub=${encodeURIComponent(vcommSubId)}`;
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
    const globalNet = settings.primaryNetwork || 'cuelinks';

    tbody.innerHTML = items.map(item => {
      const customUrl = settings.customLinks?.[item.id] || '';
      const currentRoute = settings.networkOverrides?.[item.id] || 'default';
      const resolvedUrl = affiliateManager.resolveUrl(item);

      const typeBadge = item.itemType === 'card' ? '💳 Card' : item.itemType === 'loan' ? '💰 Loan' : '📊 Score';

      return `
        <tr>
          <td>
            <div class="aff-card-meta">
              <span class="aff-card-name">${item.name}</span>
              <span class="aff-card-sub">${typeBadge} • ${item.bankLabel}</span>
              ${item.cuelinksCampaign ? `<span style="display: inline-block; font-size: 0.72rem; color: #059669; font-weight: 600; margin-top: 0.2rem; background: rgba(16, 185, 129, 0.12); padding: 0.1rem 0.4rem; border-radius: 4px;">🎯 ${item.cuelinksCampaign} (${item.cuelinksPayout || ''})</span>` : ''}
            </div>
          </td>
          <td>
            <select class="aff-route-select" data-item-id="${item.id}">
              <option value="default" ${currentRoute === 'default' ? 'selected' : ''}>Global (${globalNet})</option>
              <option value="vcommission" ${currentRoute === 'vcommission' ? 'selected' : ''}>vCommission</option>
              <option value="cuelinks" ${currentRoute === 'cuelinks' ? 'selected' : ''}>Cuelinks</option>
              <option value="earnkaro" ${currentRoute === 'earnkaro' ? 'selected' : ''}>EarnKaro</option>
              <option value="impact" ${currentRoute === 'impact' ? 'selected' : ''}>Impact</option>
              <option value="direct" ${currentRoute === 'direct' ? 'selected' : ''}>Direct Bank UTM</option>
            </select>
          </td>
          <td>
            <input type="text" class="aff-override-input" data-item-id="${item.id}" placeholder="Override URL (or leave blank to inherit route)" value="${customUrl}" />
          </td>
          <td style="text-align: right;">
            <a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer" class="aff-test-btn" title="Open resolved tracking URL in new tab">
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
    if (statActiveNetwork) statActiveNetwork.textContent = affiliateManager.settings.primaryNetwork?.toUpperCase() || 'VCOMMISSION';

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
     9. Global Event Listeners & Delegation
     -------------------------------------------------------------------------- */
  bindEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
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
        const chip = e.target.closest('.category-chip');
        if (chip) {
          this.activeCategory = chip.dataset.categoryId;
          this.renderCategoryChips();
          this.applyFilters();
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

    document.querySelectorAll('.btn-launch-quiz').forEach(btn => {
      btn.addEventListener('click', () => this.openQuizModal());
    });

    const btnShareSite = document.getElementById('btnShareSite');
    if (btnShareSite) {
      btnShareSite.addEventListener('click', async () => {
        const shareData = {
          title: 'InstantCred India',
          text: 'Compare top credit cards & instant loans in India, calculate annual rewards & EMI savings on InstantCred.in!',
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

      const removePillBtn = e.target.closest('.btn-remove-pill');
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
