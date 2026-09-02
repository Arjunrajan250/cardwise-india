/**
 * Side-by-Side Credit Card Comparator Module
 */

export class CardComparator {
  constructor(cardsData, onStateChange) {
    this.cardsData = cardsData;
    this.selectedCardIds = [];
    this.maxSelections = 3;
    this.onStateChange = onStateChange;
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
    if (this.onStateChange) {
      this.onStateChange(this.getSelectedCards());
    }
  }

  clearAll() {
    this.selectedCardIds = [];
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
        <button type="button" class="btn-remove-pill" data-remove-id="${card.id}" title="Remove">×</button>
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
      return `<p class="text-secondary text-center">Please select at least 2 cards to view side-by-side comparison.</p>`;
    }

    return `
      <div class="comparison-matrix-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Features & Specs</th>
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
              <th>Joining Fee</th>
              ${cards.map(card => `
                <td>${card.joiningFee === 0 ? '<strong class="comp-highlight">FREE</strong>' : `₹${card.joiningFee.toLocaleString('en-IN')}`}</td>
              `).join('')}
            </tr>
            <tr>
              <th>Annual / Renewal Fee</th>
              ${cards.map(card => `
                <td>
                  ${card.annualFee === 0 ? '<strong class="comp-highlight">Lifetime Free (₹0)</strong>' : `₹${card.annualFee.toLocaleString('en-IN')}`}
                  ${card.feeWaiverSpend > 0 ? `<div class="metric-sub">Waived on ₹${(card.feeWaiverSpend / 100000).toFixed(1)}L annual spend</div>` : ''}
                </td>
              `).join('')}
            </tr>
            <tr>
              <th>Cashback / Reward Summary</th>
              ${cards.map(card => `
                <td class="comp-highlight">${card.cashbackSummary}</td>
              `).join('')}
            </tr>
            <tr>
              <th>Airport Lounge Access</th>
              ${cards.map(card => `
                <td>
                  <strong>${card.loungeAccess.domestic} Domestic / ${card.loungeAccess.international} Int'l</strong>
                  <div class="metric-sub">${card.loungeAccess.details}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th>Card Network</th>
              ${cards.map(card => `<td><strong>${card.network}</strong></td>`).join('')}
            </tr>
            <tr>
              <th>Forex Markup Fee</th>
              ${cards.map(card => `<td>${card.forexMarkup}</td>`).join('')}
            </tr>
            <tr>
              <th>Fuel Surcharge Waiver</th>
              ${cards.map(card => `<td>${card.fuelSurchargeWaiver}</td>`).join('')}
            </tr>
            <tr>
              <th>Eligibility</th>
              ${cards.map(card => `
                <td>
                  <div>Min Monthly Income: <strong>₹${card.eligibility.minIncome.toLocaleString('en-IN')}</strong></div>
                  <div>Min CIBIL Score: <strong>${card.eligibility.minCibil}+</strong></div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th>Top Pros</th>
              ${cards.map(card => `
                <td>
                  <ul class="comp-pros-list">
                    ${card.pros.map(pro => `<li>✓ ${pro}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th>Key Cons / Exclusions</th>
              ${cards.map(card => `
                <td>
                  <ul class="comp-cons-list">
                    ${card.cons.map(con => `<li>✕ ${con}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <th>Action</th>
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
