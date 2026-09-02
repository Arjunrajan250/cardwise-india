/**
 * Affiliate Management and Tracking Module
 * Handles affiliate links, vCommission IDs, custom sub-IDs, and outbound redirection
 */

const STORAGE_KEY = 'cardwise_affiliate_settings';

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
      subId: 'cardwise_web',
      customLinks: {}
    };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
  }

  getAffiliateUrl(card) {
    // Check if there is a custom override link for this card
    if (this.settings.customLinks && this.settings.customLinks[card.id]) {
      return this.settings.customLinks[card.id];
    }

    // Replace placeholder affiliate ID and sub-ID in default URL
    let url = card.affiliateUrl || `https://tracking.vcommission.com/aff_c?offer_id=${card.id}&aff_id=YOUR_AFF_ID`;
    url = url.replace('YOUR_AFF_ID', this.settings.affiliateId);
    
    // Append sub-ID parameter
    if (!url.includes('aff_sub=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}aff_sub=${encodeURIComponent(this.settings.subId)}`;
    }

    return url;
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

    // Track event for internal analytics
    try {
      const clickLogs = JSON.parse(localStorage.getItem('cardwise_clicks') || '[]');
      clickLogs.push({
        cardId: card.id,
        cardName: card.name,
        bank: card.bank,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('cardwise_clicks', JSON.stringify(clickLogs.slice(-100)));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export const affiliateManager = new AffiliateManager();
