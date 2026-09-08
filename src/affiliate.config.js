/**
 * InstantCred India - Affiliate & Monetization Configuration
 * 
 * You can edit this file directly in code to configure your default production affiliate settings,
 * or manage them interactively via the in-app "Affiliate Settings" control center.
 */

export const DEFAULT_AFFILIATE_CONFIG = {
  // Active primary affiliate network: 'vcommission' | 'cuelinks' | 'earnkaro' | 'impact' | 'direct'
  primaryNetwork: 'vcommission',

  // Network-specific configuration and publisher credentials
  networks: {
    // 1. vCommission (India's leading CPA network for credit cards & loans)
    vcommission: {
      name: 'vCommission',
      affiliateId: '131993', // Replace with your vCommission Publisher ID
      subId: 'instantcred_web',
      subId2: ''
    },

    // 2. Cuelinks.com (Automated monetization & 2-tier affiliate redirection)
    cuelinks: {
      name: 'Cuelinks',
      pubId: '271664', // Account Publisher ID
      channelId: '317055', // Verified Channel ID for InstantCred India
      subId: 'instantcred_web',
      // If true, automatically loads the Cuelinks JS auto-tagging script on page load
      enableAutoTaggingScript: false,
      // Redirection format: 'linksredirect' (uses Channel ID) or 'cprewritten'
      redirectFormat: 'linksredirect'
    },

    // 3. EarnKaro (Deal-sharing & cashback affiliate network)
    earnkaro: {
      name: 'EarnKaro',
      userId: 'YOUR_EARNKARO_USER_ID', // Replace with your EarnKaro User / Referral ID
      subId: 'instantcred_web'
    },

    // 4. Impact.com / Partnership Cloud
    impact: {
      name: 'Impact.com',
      mediaPartnerId: 'YOUR_IMPACT_MP_ID', // Replace with your Impact Media Partner ID
      campaignSubId: 'instantcred_web'
    },

    // 5. Direct Bank / Custom UTM Links (No intermediary network, direct bank application)
    direct: {
      name: 'Direct Official Bank Links',
      utmSource: 'instantcred',
      utmMedium: 'referral_web',
      utmCampaign: 'credit_cards_2026'
    }
  },

  // Per-card or Per-loan custom affiliate URL overrides
  // Key: card/loan ID (e.g. 'sbi-cashback', 'hdfc-millennia', 'moneyview-loan')
  // Value: Your exact custom affiliate or tracking link for that specific offer
  customLinks: {},

  // Per-card network override (allows routing specific cards to different networks)
  // Key: card/loan ID, Value: 'vcommission' | 'cuelinks' | 'earnkaro' | 'impact' | 'direct'
  networkOverrides: {}
};
