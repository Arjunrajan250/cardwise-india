/**
 * InstantCred India - Affiliate & Monetization Configuration
 * 
 * You can edit this file directly in code to configure your default production affiliate settings,
 * or manage them interactively via the in-app "Affiliate Settings" control center.
 */

export const DEFAULT_AFFILIATE_CONFIG = {
  version: 4,
  // Exclusive Affiliate Network: 'cuelinks'
  primaryNetwork: 'cuelinks',

  // Hide all cards that do not have active affiliate tracking (Only display monetized cards)
  hideNonAffiliateCards: true,

  // Cuelinks Publisher Credentials & Configuration
  cuelinks: {
    name: 'Cuelinks India',
    pubId: '271664', // Account Publisher ID
    channelId: '317055', // Verified Channel ID for InstantCred India
    subId: 'instantcred_web',
    // If true, automatically loads the Cuelinks JS auto-tagging script on page load
    enableAutoTaggingScript: false,
    // Redirection format: 'linksredirect' (uses Channel ID 317055) or 'cprewritten'
    redirectFormat: 'linksredirect'
  },

  // Per-card or Per-loan custom affiliate URL overrides
  // Key: card/loan ID (e.g. 'sbi-cashback', 'hdfc-millennia', 'kreditpe-loan')
  // Value: Your exact custom tracking link if you wish to override Cuelinks for that specific offer
  customLinks: {}
};
