/**
 * Affiliate Management and Tracking Module
 * Handles affiliate links, vCommission IDs, custom sub-IDs, and outbound redirection
 */

const STORAGE_KEY = 'instantcred_affiliate_settings';

export class AffiliateManager {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved affiliate settings:', e);
      }
    }
    return {
      affiliateId: 'DEMO_AFF_ID',
      subId: 'instantcred_web',
      customLinks: {}
    };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  resolveUrl(rawUrl, id) {
    if (this.settings.customLinks && id && this.settings.customLinks[id]) {
      return this.settings.customLinks[id];
    }

    let url = rawUrl || `https://tracking.vcommission.com/aff_c?offer_id=${id}&aff_id=YOUR_AFF_ID`;
    url = url.replace('YOUR_AFF_ID', this.settings.affiliateId || 'DEMO_AFF_ID');
    
    if (!url.includes('aff_sub=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}aff_sub=${encodeURIComponent(this.settings.subId || 'instantcred_web')}`;
    }

    return url;
  }

  getAffiliateUrl(card) {
    return this.resolveUrl(card.affiliateUrl, card.id);
  }

  triggerOutboundApply(card, onRedirectReady) {
    const finalUrl = this.getAffiliateUrl(card);
    
    // Trigger callback to display the high-converting secure redirect interstitial
    if (onRedirectReady) {
      onRedirectReady({
        card,
        finalUrl,
        affiliateId: this.settings.affiliateId
      });
    }

    // Track event for internal analytics & Google Analytics 4
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'affiliate_click', {
          item_id: card.id,
          item_name: card.name,
          category: card.lender ? 'loan' : 'credit_card',
          partner: card.lender || card.bank || 'Partner',
          outbound_url: finalUrl
        });
      }

      const clickLogs = JSON.parse(localStorage.getItem('instantcred_clicks') || '[]');
      clickLogs.push({
        cardId: card.id,
        cardName: card.name,
        bank: card.bank || card.lender,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('instantcred_clicks', JSON.stringify(clickLogs.slice(-100)));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export const affiliateManager = new AffiliateManager();
