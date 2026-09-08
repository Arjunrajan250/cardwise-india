/**
 * InstantCred India - Advanced Multi-Affiliate & Monetization Engine
 * 
 * Supports:
 * 1. vCommission (CPA / CPL tracking links & sub-IDs)
 * 2. Cuelinks.com (Both Cuelinks Auto-Tagging JS script & CP-rewritten/LinksRedirect redirects)
 * 3. EarnKaro (Deal redirects with user referral parameters)
 * 4. Impact.com / Admitad
 * 5. Direct Official Bank Links with UTM tracking parameters
 * 6. Per-card & per-offer custom URL overrides and network switching
 * 7. Live click analytics & Configuration Export/Import
 */

import { DEFAULT_AFFILIATE_CONFIG } from './affiliate.config.js';

const STORAGE_KEY = 'instantcred_affiliate_settings';
const CLICKS_STORAGE_KEY = 'instantcred_affiliate_clicks';

export class AffiliateManager {
  constructor() {
    this.settings = this.loadSettings();
    this.syncCuelinksScript();
  }

  /* --------------------------------------------------------------------------
     1. Settings Management (LocalStorage + Codebase Default Fallback)
     -------------------------------------------------------------------------- */
  loadSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Deep merge with DEFAULT_AFFILIATE_CONFIG to ensure all structure exists
          return this.deepMerge(DEFAULT_AFFILIATE_CONFIG, parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved affiliate settings, using defaults:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_AFFILIATE_CONFIG));
  }

  saveSettings(newSettings) {
    this.settings = this.deepMerge(this.settings, newSettings);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.error('Failed to save affiliate settings to localStorage:', e);
    }
    this.syncCuelinksScript();
  }

  resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_AFFILIATE_CONFIG));
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch (e) {
      console.error('Failed to reset affiliate settings:', e);
    }
    this.syncCuelinksScript();
    return this.settings;
  }

  deepMerge(target, source) {
    const result = { ...target };
    if (!source || typeof source !== 'object') return result;

    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /* --------------------------------------------------------------------------
     2. Cuelinks Auto-Tagging JavaScript Management
     -------------------------------------------------------------------------- */
  syncCuelinksScript() {
    if (typeof document === 'undefined') return;

    const existingScript = document.getElementById('cuelinks-autotag-script');
    const cuelinksConfig = this.settings.networks?.cuelinks;
    const isPrimaryCuelinks = this.settings.primaryNetwork === 'cuelinks';
    const isScriptEnabled = cuelinksConfig?.enableAutoTaggingScript && cuelinksConfig?.pubId && cuelinksConfig.pubId !== 'YOUR_CUELINKS_PUB_ID';

    if (isScriptEnabled) {
      const scriptUrl = `https://admin.cuelinks.com/api/cuelinks.js?pub_id=${encodeURIComponent(cuelinksConfig.pubId)}`;
      if (existingScript) {
        if (existingScript.src !== scriptUrl) {
          existingScript.src = scriptUrl;
        }
      } else {
        const script = document.createElement('script');
        script.id = 'cuelinks-autotag-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = scriptUrl;
        document.head.appendChild(script);
      }
    } else {
      if (existingScript) {
        existingScript.remove();
      }
    }
  }

  /* --------------------------------------------------------------------------
     3. Multi-Network URL Resolution Engine
     -------------------------------------------------------------------------- */
  getNetworkForItem(item) {
    if (!item) return this.settings.primaryNetwork || 'vcommission';
    
    // Check item-level network override
    if (this.settings.networkOverrides && this.settings.networkOverrides[item.id]) {
      return this.settings.networkOverrides[item.id];
    }

    return this.settings.primaryNetwork || 'vcommission';
  }

  resolveUrl(rawUrlOrItem, optionalId) {
    let item = null;
    let rawUrl = '';
    let itemId = '';

    if (typeof rawUrlOrItem === 'object' && rawUrlOrItem !== null) {
      item = rawUrlOrItem;
      itemId = item.id;
      rawUrl = item.affiliateUrl || '';
    } else {
      rawUrl = rawUrlOrItem || '';
      itemId = optionalId || '';
      item = { id: itemId, affiliateUrl: rawUrl, directUrl: rawUrl };
    }

    // 1. Check for custom link override for this specific card/loan
    if (this.settings.customLinks && itemId && this.settings.customLinks[itemId]) {
      let customUrl = this.settings.customLinks[itemId].trim();
      if (customUrl) {
        // Substitute common macros if present in custom link
        const vcommAffId = this.settings.networks?.vcommission?.affiliateId || '131993';
        const vcommSubId = this.settings.networks?.vcommission?.subId || 'instantcred_web';
        customUrl = customUrl.replace(/YOUR_AFF_ID/g, vcommAffId).replace(/YOUR_SUB_ID/g, vcommSubId);
        return customUrl;
      }
    }

    // 2. Identify active network for this item
    const network = this.getNetworkForItem(item);
    const directUrl = item.directUrl || rawUrl || 'https://www.instantcred.in';

    switch (network) {
      case 'cuelinks': {
        const cuelinks = this.settings.networks?.cuelinks || {};
        const pubId = cuelinks.pubId || 'YOUR_CUELINKS_PUB_ID';
        const subId = cuelinks.subId || 'instantcred_web';
        
        // If AutoTagging script is active, return direct URL because script dynamically intercepts it
        if (cuelinks.enableAutoTaggingScript && pubId !== 'YOUR_CUELINKS_PUB_ID') {
          return directUrl;
        }

        // Otherwise generate redirection link
        if (cuelinks.redirectFormat === 'linksredirect') {
          return `https://linksredirect.com/?cid=${encodeURIComponent(pubId)}&subid=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
        }
        // Default Cuelinks CP Rewritten format
        return `https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=${encodeURIComponent(pubId)}&sub_id=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
      }

      case 'earnkaro': {
        const earnkaro = this.settings.networks?.earnkaro || {};
        const userId = earnkaro.userId || 'YOUR_EARNKARO_USER_ID';
        const subId = earnkaro.subId || 'instantcred_web';
        return `https://earnkaro.com/deal/redirect?deal_id=${encodeURIComponent(directUrl)}&r=${encodeURIComponent(userId)}&subid=${encodeURIComponent(subId)}`;
      }

      case 'impact': {
        const impact = this.settings.networks?.impact || {};
        const mpId = impact.mediaPartnerId || 'YOUR_IMPACT_MP_ID';
        const subId = impact.campaignSubId || 'instantcred_web';
        const separator = directUrl.includes('?') ? '&' : '?';
        return `${directUrl}${separator}irclickid=${encodeURIComponent(subId)}&mpid=${encodeURIComponent(mpId)}`;
      }

      case 'direct': {
        const direct = this.settings.networks?.direct || {};
        const utmSource = direct.utmSource || 'instantcred';
        const utmMedium = direct.utmMedium || 'affiliate';
        const utmCampaign = direct.utmCampaign || 'credit_cards_2026';
        const separator = directUrl.includes('?') ? '&' : '?';
        return `${directUrl}${separator}utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;
      }

      case 'vcommission':
      default: {
        const vcomm = this.settings.networks?.vcommission || {};
        const affId = vcomm.affiliateId || '131993';
        const subId = vcomm.subId || 'instantcred_web';
        const subId2 = vcomm.subId2 || '';

        let url = rawUrl || `https://tracking.vcommission.com/aff_c?offer_id=${encodeURIComponent(itemId)}&aff_id=YOUR_AFF_ID`;
        url = url.replace(/YOUR_AFF_ID/g, affId);

        if (!url.includes('aff_sub=')) {
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}aff_sub=${encodeURIComponent(subId)}`;
        }

        if (subId2 && !url.includes('aff_sub2=')) {
          url = `${url}&aff_sub2=${encodeURIComponent(subId2)}`;
        }

        return url;
      }
    }
  }

  getAffiliateUrl(item) {
    return this.resolveUrl(item);
  }

  /* --------------------------------------------------------------------------
     4. Outbound Click Trigger & Analytics Logging
     -------------------------------------------------------------------------- */
  triggerOutboundApply(item, onRedirectReady) {
    const finalUrl = this.getAffiliateUrl(item);
    const network = this.getNetworkForItem(item);
    
    // Log click event locally
    this.logClick(item, finalUrl, network);

    // Trigger UI redirect interstitial
    if (onRedirectReady) {
      onRedirectReady({
        card: item,
        finalUrl,
        network,
        affiliateId: this.settings.networks?.[network]?.affiliateId || this.settings.networks?.[network]?.pubId || network
      });
    }

    // Google Analytics 4 tracking event
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'affiliate_click', {
          item_id: item.id,
          item_name: item.name,
          category: item.lender ? 'loan' : 'credit_card',
          partner: item.lender || item.bank || 'Partner',
          affiliate_network: network,
          outbound_url: finalUrl
        });
      }
    } catch (e) {
      // Ignore GA errors
    }
  }

  logClick(item, destinationUrl, network) {
    try {
      if (typeof localStorage !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem(CLICKS_STORAGE_KEY) || '[]');
        logs.unshift({
          cardId: item.id,
          name: item.name,
          bank: item.bank || item.lender || item.provider || 'Partner',
          network: network,
          destinationUrl: destinationUrl,
          timestamp: new Date().toISOString()
        });
        // Keep most recent 150 clicks
        localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(logs.slice(0, 150)));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  getClickLogs() {
    try {
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem(CLICKS_STORAGE_KEY) || '[]');
      }
    } catch (e) {
      return [];
    }
    return [];
  }

  clearClickLogs() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CLICKS_STORAGE_KEY);
      }
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     5. Export & Import Configuration
     -------------------------------------------------------------------------- */
  exportConfigJSON() {
    return JSON.stringify(this.settings, null, 2);
  }

  importConfigJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.saveSettings(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  generateConfigCode() {
    return `export const DEFAULT_AFFILIATE_CONFIG = ${JSON.stringify(this.settings, null, 2)};\n`;
  }
}

export const affiliateManager = new AffiliateManager();
