/**
 * Side-by-Side Credit Card Comparator Module
 */

import { ICONS } from './icons.js';

export class CardComparator {
  constructor(cardsData, onStateChange) {
    this.cardsData = cardsData;
    this.selectedCardIds = [];
    this.maxSelections = 3;
    this.onStateChange = onStateChange;
    this.activePairIndex = 0;
    this.mobileViewMode = 'split'; // 'split' or 'table'
  }

  toggleCard(cardId) {
    const index = this.selectedCardIds.indexOf(cardId);
    if (index > -1) {
      this.selectedCardIds.splice(index, 1);
    } else {
      if (this.selectedCardIds.length >= this.maxSelections) {
        return {
          success: false,
          message: `You can compare a maximum of ${this.maxSelections} cards at a time.`
        };
      }
      this.selectedCardIds.push(cardId);
    }

    this.activePairIndex = 0;

    if (this.onStateChange) {
      this.onStateChange(this.getSelectedCards());
    }

    return {
      success: true,
      selected: this.isSelected(cardId)
    };
  }

  isSelected(cardId) {
    return this.selectedCardIds.includes(cardId);
  }

  removeCard(cardId) {
    this.selectedCardIds = this.selectedCardIds.filter(id => id !== cardId);
    this.activePairIndex = 0;
    if (this.onStateChange) {
      this.onStateChange(this.getSelectedCards());
    }
  }

  clearAll() {
    this.selectedCardIds = [];
    this.activePairIndex = 0;
    if (this.onStateChange) {
      this.onStateChange([]);
    }
  }

  getSelectedCards() {
    return this.selectedCardIds.map(id => 
      this.cardsData.find(card => card.id === id)
    ).filter(Boolean);
  }

  renderTrayHTML() {
    const selectedCards = this.getSelectedCards();
    const count = selectedCards.length;

    if (count === 0) {
      return '';
    }

    const pillsHTML = selectedCards.map(card => `
      <div class="compare-mini-pill" data-card-id="${card.id}">
        <span>${card.name}</span>
        <button type="button" class="btn-remove-pill" data-remove-id="${card.id}" title="Remove">${ICONS.close}</button>
      </div>
    `).join('');

    const emptySlots = this.maxSelections - count;
    let emptySlotsHTML = '';
    for (let i = 0; i < emptySlots; i++) {
      emptySlotsHTML += `<span class="compare-empty-slot">+ Add ${i === 0 && count === 1 ? 'another' : 'card'}</span>`;
    }

    return `
      <div class="compare-tray visible" id="compareTray">
        <div class="compare-tray-left">
          <span class="compare-title">Comparing (${count}/${this.maxSelections}):</span>
          <div class="compare-cards-pills">
            ${pillsHTML}
            ${emptySlotsHTML}
          </div>
        </div>
        <div class="compare-tray-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="btnClearCompare">Clear</button>
          <button type="button" class="btn btn-primary btn-sm" id="btnOpenCompareModal" ${count < 2 ? 'disabled title="Select at least 2 cards to compare"' : ''}>
            Compare Now (${count})
          </button>
        </div>
      </div>
    `;
  }

  renderComparisonMatrixHTML(affiliateManager) {
    const cards = this.getSelectedCards();
    if (cards.length < 2) {
      return `<p class="text-secondary text-center" style="padding: 2.5rem 1rem;">Please select at least 2 cards to view side-by-side comparison.</p>`;
    }

    const has3Cards = cards.length >= 3;
    let cardA = cards[0];
    let cardB = cards[1];

    if (has3Cards) {
      if (this.activePairIndex === 1) {
        cardA = cards[0];
        cardB = cards[2];
      } else if (this.activePairIndex === 2) {
        cardA = cards[1];
        cardB = cards[2];
      } else {
        cardA = cards[0];
        cardB = cards[1];
      }
    }

    const mobileSplitHTML = this.renderMobileSplitView(cards, cardA, cardB, has3Cards);
    const desktopTableHTML = this.renderDesktopTableView(cards);

    return `
      <div class="comp-matrix-container">
        <!-- View Mode & Pair Toolbar (Mobile Responsive) -->
        <div class="comp-view-toolbar">
          <div class="comp-mode-tabs" role="tablist">
            <button type="button" class="comp-mode-btn ${this.mobileViewMode !== 'table' ? 'active' : ''}" data-comp-mode="split">
              <span style="display:inline-flex;align-items:center;margin-right:5px;">${ICONS.splitView}</span> Side-by-Side (50/50)
            </button>
            <button type="button" class="comp-mode-btn ${this.mobileViewMode === 'table' ? 'active' : ''}" data-comp-mode="table">
              <span style="display:inline-flex;align-items:center;margin-right:5px;">${ICONS.gridView}</span> Full Table Grid
            </button>
          </div>
          ${has3Cards && this.mobileViewMode !== 'table' ? `
            <div class="comp-pair-switcher">
              <span class="comp-pair-label">Pair:</span>
              <button type="button" class="comp-pair-tab ${this.activePairIndex === 0 ? 'active' : ''}" data-comp-pair="0" title="${cards[0].name} vs ${cards[1].name}">
                1 vs 2
              </button>
              <button type="button" class="comp-pair-tab ${this.activePairIndex === 1 ? 'active' : ''}" data-comp-pair="1" title="${cards[0].name} vs ${cards[2].name}">
                1 vs 3
              </button>
              <button type="button" class="comp-pair-tab ${this.activePairIndex === 2 ? 'active' : ''}" data-comp-pair="2" title="${cards[1].name} vs ${cards[2].name}">
                2 vs 3
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Mobile 50/50 Split View (Active by default on mobile) -->
        <div class="comp-mobile-split-view ${this.mobileViewMode === 'table' ? 'comp-hidden' : ''}">
          ${mobileSplitHTML}
        </div>

        <!-- Desktop Table Matrix View (Active on desktop, or if user toggles table mode on mobile) -->
        <div class="comp-desktop-table-view ${this.mobileViewMode !== 'table' ? 'comp-mobile-hidden' : ''}">
          ${desktopTableHTML}
        </div>
      </div>
    `;
  }

  renderMobileSplitView(cards, cardA, cardB, has3Cards) {
    return `
      <!-- Sticky Card Header Pinned on Vertical Scroll -->
      <div class="comp-mobile-sticky-bar">
        <div class="comp-sticky-card-col">
          <span class="comp-sticky-bank">${cardA.bank}</span>
          <h4 class="comp-sticky-title" title="${cardA.name}">${cardA.name}</h4>
          <button type="button" class="btn btn-apply btn-sm comp-sticky-btn btn-outbound-apply" data-card-id="${cardA.id}">
            Apply ↗
          </button>
        </div>
        <div class="comp-sticky-card-col">
          <span class="comp-sticky-bank">${cardB.bank}</span>
          <h4 class="comp-sticky-title" title="${cardB.name}">${cardB.name}</h4>
          <button type="button" class="btn btn-apply btn-sm comp-sticky-btn btn-outbound-apply" data-card-id="${cardB.id}">
            Apply ↗
          </button>
        </div>
      </div>

      <!-- Spec Comparison Sections -->
      <div class="comp-mobile-specs-list">
        <!-- 1. Fees & Charges -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-primary);">${ICONS.cards}</span>
            <span>Fees & Annual Charges</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Joining Fee</div>
              <div>${cardA.joiningFee === 0 ? '<strong class="comp-highlight">FREE (₹0)</strong>' : `<strong>₹${cardA.joiningFee.toLocaleString('en-IN')}</strong>`}</div>
            </div>
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Joining Fee</div>
              <div>${cardB.joiningFee === 0 ? '<strong class="comp-highlight">FREE (₹0)</strong>' : `<strong>₹${cardB.joiningFee.toLocaleString('en-IN')}</strong>`}</div>
            </div>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Annual / Renewal Fee</div>
              <div>${cardA.annualFee === 0 ? '<strong class="comp-highlight">Lifetime Free</strong>' : `<strong>₹${cardA.annualFee.toLocaleString('en-IN')}</strong>`}</div>
              ${cardA.feeWaiverSpend > 0 ? `<div class="metric-sub">Waived on ₹${(cardA.feeWaiverSpend / 100000).toFixed(1)}L annual spend</div>` : ''}
            </div>
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Annual / Renewal Fee</div>
              <div>${cardB.annualFee === 0 ? '<strong class="comp-highlight">Lifetime Free</strong>' : `<strong>₹${cardB.annualFee.toLocaleString('en-IN')}</strong>`}</div>
              ${cardB.feeWaiverSpend > 0 ? `<div class="metric-sub">Waived on ₹${(cardB.feeWaiverSpend / 100000).toFixed(1)}L annual spend</div>` : ''}
            </div>
          </div>
        </div>

        <!-- 2. Cashback & Rewards -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-warning);">${ICONS.gift}</span>
            <span>Cashback & Reward Summary</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-highlight font-medium">${cardA.cashbackSummary}</div>
            </div>
            <div class="comp-spec-cell">
              <div class="comp-highlight font-medium">${cardB.cashbackSummary}</div>
            </div>
          </div>
        </div>

        <!-- 3. Airport Lounge Access -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-primary);">${ICONS.catTravel}</span>
            <span>Airport Lounge Access</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div><strong>${cardA.loungeAccess.domestic} Dom / ${cardA.loungeAccess.international} Int'l</strong></div>
              <div class="metric-sub" style="margin-top: 0.25rem;">${cardA.loungeAccess.details}</div>
            </div>
            <div class="comp-spec-cell">
              <div><strong>${cardB.loungeAccess.domestic} Dom / ${cardB.loungeAccess.international} Int'l</strong></div>
              <div class="metric-sub" style="margin-top: 0.25rem;">${cardB.loungeAccess.details}</div>
            </div>
          </div>
        </div>

        <!-- 4. Network & Surcharges -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-warning);">${ICONS.catUpi}</span>
            <span>Network & Charges</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Card Network</div>
              <div><strong>${cardA.network}</strong></div>
            </div>
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Card Network</div>
              <div><strong>${cardB.network}</strong></div>
            </div>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Forex Markup</div>
              <div>${cardA.forexMarkup}</div>
            </div>
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Forex Markup</div>
              <div>${cardB.forexMarkup}</div>
            </div>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Fuel Waiver</div>
              <div>${cardA.fuelSurchargeWaiver}</div>
            </div>
            <div class="comp-spec-cell">
              <div class="comp-spec-sublabel">Fuel Waiver</div>
              <div>${cardB.fuelSurchargeWaiver}</div>
            </div>
          </div>
        </div>

        <!-- 5. Eligibility -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-primary);">${ICONS.lock}</span>
            <span>Eligibility Requirements</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <div>Min Income: <strong>₹${cardA.eligibility.minIncome.toLocaleString('en-IN')}/mo</strong></div>
              <div style="margin-top: 0.2rem;">Min CIBIL: <strong>${cardA.eligibility.minCibil}+</strong></div>
            </div>
            <div class="comp-spec-cell">
              <div>Min Income: <strong>₹${cardB.eligibility.minIncome.toLocaleString('en-IN')}/mo</strong></div>
              <div style="margin-top: 0.2rem;">Min CIBIL: <strong>${cardB.eligibility.minCibil}+</strong></div>
            </div>
          </div>
        </div>

        <!-- 6. Top Pros & Cons -->
        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-success);">${ICONS.thumbUp}</span>
            <span>Key Advantages (Pros)</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <ul class="comp-pros-list">
                ${cardA.pros.map(pro => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-success);">${ICONS.check}</span> <span>${pro}</span></li>`).join('')}
              </ul>
            </div>
            <div class="comp-spec-cell">
              <ul class="comp-pros-list">
                ${cardB.pros.map(pro => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-success);">${ICONS.check}</span> <span>${pro}</span></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="comp-spec-card">
          <div class="comp-spec-header">
            <span style="display:inline-flex;align-items:center;color:var(--brand-danger);">${ICONS.close}</span>
            <span>Key Exclusions (Cons)</span>
          </div>
          <div class="comp-spec-row">
            <div class="comp-spec-cell">
              <ul class="comp-cons-list">
                ${cardA.cons.map(con => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-danger);">${ICONS.close}</span> <span>${con}</span></li>`).join('')}
              </ul>
            </div>
            <div class="comp-spec-cell">
              <ul class="comp-cons-list">
                ${cardB.cons.map(con => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-danger);">${ICONS.close}</span> <span>${con}</span></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Bottom Action Row -->
        <div class="comp-bottom-actions">
          <button type="button" class="btn btn-apply btn-outbound-apply" style="width: 100%; min-height: 44px;" data-card-id="${cardA.id}">
            Apply ${cardA.bank} ↗
          </button>
          <button type="button" class="btn btn-apply btn-outbound-apply" style="width: 100%; min-height: 44px;" data-card-id="${cardB.id}">
            Apply ${cardB.bank} ↗
          </button>
        </div>
      </div>
    `;
  }

  renderDesktopTableView(cards) {
    return `
      <div class="comparison-matrix-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th class="sticky-col-th">Features & Specs</th>
              ${cards.map(card => `
                <td>
                  <div class="comp-card-header">
                    <span class="bank-name">${card.bank}</span>
                    <h3 class="card-title">${card.name}</h3>
                    <span class="badge-tag">${card.tag}</span>
                    <button type="button" class="btn btn-apply btn-sm btn-outbound-apply" data-card-id="${card.id}">
                      Apply Now ↗
                    </button>
                  </div>
                </td>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th class="sticky-col-th">Joining Fee</th>
              ${cards.map(card => `
                <td>${card.joiningFee === 0 ? '<strong class="comp-highlight">FREE</strong>' : `₹${card.joiningFee.toLocaleString('en-IN')}`}</td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Annual / Renewal Fee</th>
              ${cards.map(card => `
                <td>
                  ${card.annualFee === 0 ? '<strong class="comp-highlight">Lifetime Free (₹0)</strong>' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                  ${card.feeWaiverSpend > 0 ? `<div class="metric-sub">Waived on ₹${(card.feeWaiverSpend / 100000).toFixed(1)}L annual spend</div>` : ''}
                </td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Cashback / Reward Summary</th>
              ${cards.map(card => `
                <td class="comp-highlight">${card.cashbackSummary}</td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Airport Lounge Access</th>
              ${cards.map(card => `
                <td>
                  <strong>${card.loungeAccess.domestic} Domestic / ${card.loungeAccess.international} Int'l</strong>
                  <div class="metric-sub">${card.loungeAccess.details}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Card Network</th>
              ${cards.map(card => `<td><strong>${card.network}</strong></td>`).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Forex Markup Fee</th>
              ${cards.map(card => `<td>${card.forexMarkup}</td>`).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Fuel Surcharge Waiver</th>
              ${cards.map(card => `<td>${card.fuelSurchargeWaiver}</td>`).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Eligibility</th>
              ${cards.map(card => `
                <td>
                  <div>Min Monthly Income: <strong>₹${card.eligibility.minIncome.toLocaleString('en-IN')}</strong></div>
                  <div>Min CIBIL Score: <strong>${card.eligibility.minCibil}+</strong></div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Top Pros</th>
              ${cards.map(card => `
                <td>
                  <ul class="comp-pros-list">
                    ${card.pros.map(pro => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-success);">${ICONS.check}</span> <span>${pro}</span></li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Key Cons / Exclusions</th>
              ${cards.map(card => `
                <td>
                  <ul class="comp-cons-list">
                    ${card.cons.map(con => `<li><span style="display:inline-flex;align-items:center;margin-right:5px;color:var(--brand-danger);">${ICONS.close}</span> <span>${con}</span></li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th class="sticky-col-th">Action</th>
              ${cards.map(card => `
                <td>
                  <button type="button" class="btn btn-apply btn-outbound-apply" style="width: 100%;" data-card-id="${card.id}">
                    Apply on Bank Site ↗
                  </button>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}
