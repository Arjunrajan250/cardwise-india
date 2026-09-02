import { CREDIT_CARDS, CATEGORIES, BANKS, NETWORKS } from './data/cards.js';
import { CREDIT_SCORE_OFFERS, PERSONAL_LOANS } from './data/loans.js';
import { CardComparator } from './comparator.js';
import { RewardsCalculator } from './calculator.js';
import { CardQuiz } from './quiz.js';
import { affiliateManager } from './affiliate.js';

class App {
  constructor() {
    this.cards = CREDIT_CARDS;
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

    this.init();
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
    this.checkInitialAffiliateConfig();
  }

  /* --------------------------------------------------------------------------
     1. Category Chips & Filters
     -------------------------------------------------------------------------- */
  renderCategoryChips() {
    const container = document.getElementById('categoryChipsContainer');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
      <button type="button" class="category-chip ${cat.id === this.activeCategory ? 'active' : ''}" data-category-id="${cat.id}">
        <span>${cat.label}</span>
      </button>
    `).join('');
  }

  populateFilterDropdowns() {
    const bankSelect = document.getElementById('bankFilterSelect');
    if (bankSelect) {
      const bankOptions = BANKS.map(b => `<option value="${b}">${b}</option>`).join('');
      bankSelect.innerHTML = `<option value="all">All Banks</option>${bankOptions}`;
    }

    const networkSelect = document.getElementById('networkFilterSelect');
    if (networkSelect) {
      const netOptions = NETWORKS.map(n => `<option value="${n}">${n}</option>`).join('');
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
              <span>★</span>
              <span>${card.rating.toFixed(1)}</span>
            </div>
          </div>

          <!-- Authentic Card Artwork -->
          <div class="credit-card-render-wrapper" data-open-card-id="${card.id}" title="View card specifications">
            <div class="credit-card-visual theme-${card.cardTheme}">
              <div class="card-top-row">
                <span class="bank-name-label">${card.bank}</span>
                <span class="contactless-icon">📶</span>
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
                  <span class="perk-icon">✓</span>
                  <span>${perk}</span>
                </li>
              `).join('')}
            </ul>

            <!-- Action Buttons -->
            <div class="card-actions-row">
              <button type="button" class="btn btn-secondary btn-compare ${isSelectedForCompare ? 'selected' : ''}" data-compare-id="${card.id}">
                ${isSelectedForCompare ? '✓ Selected' : '+ Compare'}
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
            <div class="value">★ ${card.rating} / 5 (${card.reviewsCount} reviews)</div>
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
                <span class="perk-icon">✓</span>
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
            <div class="label">Fuel Surcharge</div>
            <div class="value">${card.fuelSurchargeWaiver}</div>
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
            <div class="value">${card.loungeAccess.domestic} Visits / Year</div>
          </div>
          <div class="detail-stat-card">
            <div class="label">International Lounge</div>
            <div class="value">${card.loungeAccess.international} Visits / Year</div>
          </div>
        </div>
        <div class="detail-section">
          <h4>Lounge Access Guidelines</h4>
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
            ${card.pros.map(p => `<li>✓ ${p}</li>`).join('')}
          </ul>
          <h4 style="color: var(--brand-danger)">Points to Consider (Cons)</h4>
          <ul class="comp-cons-list">
            ${card.cons.map(c => `<li>✕ ${c}</li>`).join('')}
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
    const progressPercent = (step / this.quiz.totalSteps) * 100;

    let stepHTML = `
      <div class="quiz-progress-bar-wrapper">
        <div class="quiz-progress-fill" style="width: ${progressPercent}%;"></div>
      </div>
    `;

    if (step === 1) {
      stepHTML += `
        <h3 class="quiz-step-title">Step 1 of 3: What is your monthly salary or income?</h3>
        <p class="quiz-step-subtitle">This helps match you with cards you are eligible to be approved for.</p>
        <div class="quiz-options-grid">
          <div class="quiz-option-card ${this.quiz.answers.income === 'low' ? 'selected' : ''}" data-quiz-choice="income" data-val="low">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Below ₹30,000 / month</span>
              <span class="quiz-option-desc">Entry-level and Lifetime Free cards</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.income === 'mid' ? 'selected' : ''}" data-quiz-choice="income" data-val="mid">
            <div class="quiz-option-text">
              <span class="quiz-option-title">₹30,000 – ₹75,000 / month</span>
              <span class="quiz-option-desc">High cashback and everyday shopping cards</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.income === 'high' ? 'selected' : ''}" data-quiz-choice="income" data-val="high">
            <div class="quiz-option-text">
              <span class="quiz-option-title">₹75,000 – ₹1.5 Lakh / month</span>
              <span class="quiz-option-desc">Premium travel, airport lounge and rewards cards</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.income === 'ultra' ? 'selected' : ''}" data-quiz-choice="income" data-val="ultra">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Above ₹1.5 Lakh / month</span>
              <span class="quiz-option-desc">Super premium and luxury travel tier cards</span>
            </div>
          </div>
        </div>
      `;
    } else if (step === 2) {
      stepHTML += `
        <h3 class="quiz-step-title">Step 2 of 3: What is your main monthly expense?</h3>
        <p class="quiz-step-subtitle">Select the category where you spend the most.</p>
        <div class="quiz-options-grid">
          <div class="quiz-option-card ${this.quiz.answers.primarySpend === 'shopping' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="shopping">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Online Shopping</span>
              <span class="quiz-option-desc">Amazon, Flipkart, Myntra, electronics</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.primarySpend === 'dining' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="dining">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Dining & Food Delivery</span>
              <span class="quiz-option-desc">Swiggy, Zomato, cafes and dining out</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.primarySpend === 'travel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="travel">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Flights, Hotels & Travel</span>
              <span class="quiz-option-desc">Airline bookings, hotel stays, air miles</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.primarySpend === 'fuel' ? 'selected' : ''}" data-quiz-choice="primarySpend" data-val="fuel">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Fuel & Commuting</span>
              <span class="quiz-option-desc">Petrol, diesel and daily travel</span>
            </div>
          </div>
        </div>
      `;
    } else if (step === 3) {
      stepHTML += `
        <h3 class="quiz-step-title">Step 3 of 3: Which feature matters most to you?</h3>
        <p class="quiz-step-subtitle">Select your main priority.</p>
        <div class="quiz-options-grid">
          <div class="quiz-option-card ${this.quiz.answers.topPriority === 'cashback' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="cashback">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Direct Statement Cashback</span>
              <span class="quiz-option-desc">Direct credits against monthly card bills</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.topPriority === 'ltf' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="ltf">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Zero Annual Fee (Lifetime Free)</span>
              <span class="quiz-option-desc">No joining or renewal fee overhead</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.topPriority === 'lounge' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="lounge">
            <div class="quiz-option-text">
              <span class="quiz-option-title">Complimentary Airport Lounges</span>
              <span class="quiz-option-desc">Free food and lounge access on flights</span>
            </div>
          </div>
          <div class="quiz-option-card ${this.quiz.answers.topPriority === 'upi' ? 'selected' : ''}" data-quiz-choice="topPriority" data-val="upi">
            <div class="quiz-option-text">
              <span class="quiz-option-title">RuPay UPI QR Payments</span>
              <span class="quiz-option-desc">Earn points scanning merchant UPI QR codes</span>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = stepHTML;

    container.querySelectorAll('.quiz-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const choice = card.dataset.quizChoice;
        const val = card.dataset.val;
        this.quiz.setAnswer(choice, val);
        
        if (this.quiz.nextStep()) {
          this.renderQuizStep();
        } else {
          this.renderQuizResults();
        }
      });
    });
  }

  renderQuizResults() {
    const container = document.getElementById('quizModalBody');
    if (!container) return;

    const matched = this.quiz.getMatchedCards();

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <h3 style="font-size: 1.35rem; margin-bottom: 0.35rem;">Recommended Card Matches</h3>
        <p class="text-secondary" style="font-size: 0.88rem;">Based on your income and spending preferences, here are the top 2 recommended options.</p>
      </div>

      <div class="quiz-matched-cards-grid">
        ${matched.map(item => `
          <div class="card-item" style="padding: 1.25rem;">
            <span class="badge-tag" style="align-self: flex-start; margin-bottom: 0.6rem;">${item.card.tag}</span>
            <h4 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${item.card.name}</h4>
            <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${item.card.bank}</span>
            
            <div class="card-cashback-summary" style="margin: 0.75rem 0;">
              ${item.card.cashbackSummary}
            </div>

            <p style="font-size: 0.8rem; color: var(--brand-primary); background-color: var(--brand-primary-light); padding: 0.4rem 0.6rem; border-radius: 4px; margin-bottom: 1rem;">
              <strong>Match Reason:</strong> ${item.reasonText}
            </p>

            <button type="button" class="btn btn-apply btn-outbound-apply" style="width: 100%;" data-card-id="${item.card.id}">
              Apply on Bank Site ↗
            </button>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; margin-top: 1.25rem;">
        <button type="button" class="btn btn-secondary btn-sm" id="btnRestartQuiz">Start Over</button>
      </div>
    `;

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
            <span>🔒 Secure Official Bank Redirection</span>
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
      const finalUrl = affiliateManager.resolveUrl(offer.affiliateUrl, offer.id);
      return `
        <div class="cibil-provider-card">
          <div>
            <div class="provider-card-header">
              <span class="provider-badge">${offer.badge}</span>
              <div class="rating-badge">★ ${offer.rating}</div>
            </div>
            <h4 class="provider-title">${offer.name}</h4>
            <div class="provider-sub">${offer.provider}</div>
            <div style="font-size: 0.8rem; color: var(--brand-primary); font-weight: 700; margin-bottom: 0.85rem;">
              Score Range: ${offer.scoreRange} (${offer.reportFrequency})
            </div>

            <ul class="perks-list" style="margin-bottom: 1.25rem;">
              ${offer.keyBenefits.map(b => `
                <li class="perk-item">
                  <span class="perk-icon">✓</span>
                  <span>${b}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-emerald" style="width: 100%; text-align: center;">
            ${offer.ctaText}
          </a>
        </div>
      `;
    }).join('');
  }

  initLoansSection() {
    const grid = document.getElementById('loansCardsGrid');
    if (!grid) return;

    grid.innerHTML = this.personalLoans.map(loan => {
      const finalUrl = affiliateManager.resolveUrl(loan.affiliateUrl, loan.id);
      return `
        <div class="loan-card">
          <div class="loan-card-header">
            <span class="loan-badge">${loan.badge}</span>
            <div class="rating-badge">★ ${loan.rating}</div>
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
                <span>✓</span>
                <span>${perk}</span>
              </li>
            `).join('')}
          </ul>

          <div class="loan-eligibility-note">
            <strong>Eligibility:</strong> ${loan.eligibility}
          </div>

          <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; text-align: center; margin-top: auto;">
            Apply for Instant Loan ↗
          </a>
        </div>
      `;
    }).join('');
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
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = [
      { id: 'card-directory', el: document.getElementById('card-directory') },
      { id: 'credit-score-section', el: document.getElementById('credit-score-section') },
      { id: 'loans-section', el: document.getElementById('loans-section') },
      { id: 'calculator-section', el: document.getElementById('calculator-section') },
      { id: 'faq-section', el: document.getElementById('faq-section') }
    ].filter(s => s.el);

    mobileLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 90;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight + 10;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            mobileLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        }
      });
    });

    // Highlight active chip on scroll
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 140;
      let currentSectionId = '';

      for (const section of sections) {
        if (section.el.offsetTop <= scrollPos) {
          currentSectionId = section.id;
        }
      }

      if (currentSectionId) {
        mobileLinks.forEach(link => {
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
     9. Affiliate Config & Admin Settings
     -------------------------------------------------------------------------- */
  checkInitialAffiliateConfig() {
    const affiliateModal = document.getElementById('affiliateModal');
    const saveBtn = document.getElementById('btnSaveAffiliateSettings');
    const inputAffId = document.getElementById('inputAffiliateId');
    const inputSubId = document.getElementById('inputAffiliateSubId');

    if (inputAffId && inputSubId) {
      inputAffId.value = affiliateManager.settings.affiliateId || '';
      inputSubId.value = affiliateManager.settings.subId || '';
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const affId = inputAffId.value.trim() || 'DEMO_AFF_ID';
        const subId = inputSubId.value.trim() || 'cardwise_web';
        affiliateManager.saveSettings({ affiliateId: affId, subId });
        this.showToast('Affiliate settings saved successfully.', 'success');
        affiliateModal.classList.remove('open');
      });
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
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span><span>${message}</span>`;
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
        const chip = e.target.closest('.category-chip');
        if (chip) {
          this.activeCategory = chip.dataset.categoryId;
          this.renderCategoryChips();
          this.applyFilters();
        }
      });
    }

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

    const btnAffConfig = document.getElementById('btnOpenAffiliateModal');
    if (btnAffConfig) {
      btnAffConfig.addEventListener('click', () => {
        const modal = document.getElementById('affiliateModal');
        if (modal) modal.classList.add('open');
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

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
