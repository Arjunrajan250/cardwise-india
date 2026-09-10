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
          if (!parsed.version || parsed.version < (DEFAULT_AFFILIATE_CONFIG.version || 1)) {
            const upgraded = this.deepMerge(DEFAULT_AFFILIATE_CONFIG, {
              customLinks: parsed.customLinks || {}
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
            return upgraded;
          }
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
    const cuelinksConfig = this.settings.cuelinks || this.settings.networks?.cuelinks;
    const isScriptEnabled = cuelinksConfig?.enableAutoTaggingScript && cuelinksConfig?.pubId;

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
     3. Cuelinks Exclusive URL Resolution Engine
     -------------------------------------------------------------------------- */
  getNetworkForItem(item) {
    return 'cuelinks';
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
      const customUrl = this.settings.customLinks[itemId].trim();
      if (customUrl) return customUrl;
    }

    // 2. Resolve exclusively through Cuelinks
    const cuelinks = this.settings.cuelinks || this.settings.networks?.cuelinks || {};
    const channelId = cuelinks.channelId || '317055';
    const pubId = cuelinks.pubId || '271664';
    const subId = cuelinks.subId || 'instantcred_web';
    const directUrl = item.directUrl || rawUrl || 'https://www.instantcred.in';

    // If AutoTagging script is active, return direct URL because script dynamically intercepts it
    if (cuelinks.enableAutoTaggingScript && pubId) {
      return directUrl;
    }

    // Cuelinks CP Rewritten format if explicitly chosen
    if (cuelinks.redirectFormat === 'cprewritten') {
      return `https://cprewritten.cuelinks.com/?channel=cuelinks&pub_id=${encodeURIComponent(pubId)}&sub_id=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
    }

    // Primary & Verified Cuelinks Format: linksredirect with Channel ID
    return `https://linksredirect.com/?cid=${encodeURIComponent(channelId)}&subid=${encodeURIComponent(subId)}&url=${encodeURIComponent(directUrl)}`;
  }

  getAffiliateUrl(item) {
    return this.resolveUrl(item);
  }

  /* --------------------------------------------------------------------------
     4. Outbound Click Trigger & Analytics Logging
     -------------------------------------------------------------------------- */
  triggerOutboundApply(item, onRedirectReady) {
    const finalUrl = this.getAffiliateUrl(item);
    const network = 'cuelinks';
    const cuelinks = this.settings.cuelinks || this.settings.networks?.cuelinks || {};
    const affiliateId = cuelinks.channelId || cuelinks.pubId || '317055';
    
    // Log click event locally
    this.logClick(item, finalUrl, network);

    // Trigger UI redirect interstitial
    if (onRedirectReady) {
      onRedirectReady({
        card: item,
        finalUrl,
        network,
        affiliateId
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
