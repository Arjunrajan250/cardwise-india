export const CREDIT_CARDS = [
  {
    id: "sbi-cashback",
    name: "SBI Cashback Credit Card",
    bank: "SBI Card",
    network: "Visa",
    cardTheme: "sbi-blue",
    joiningFee: 999,
    annualFee: 999,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 1420,
    primaryCategory: "Cashback",
    categories: ["Cashback", "Shopping"],
    tag: "Best for Online Cashback",
    cashbackSummary: "5% cashback on online spends (no merchant restriction) + 1% offline",
    rewardStructure: {
      online: 5.0,
      dining: 5.0,
      grocery: 5.0,
      fuel: 0.0,
      travel: 5.0,
      bills: 0.0,
      others: 1.0
    },
    keyPerks: [
      "5% cashback on online transactions up to ₹5,000 per billing month",
      "1% cashback on all offline purchases with no upper limit",
      "Cashback automatically credited to your statement within 2 days of bill generation",
      "Annual fee waived on spending ₹2,00,000 in the previous anniversary year",
      "1% fuel surcharge waiver across petrol stations in India"
    ],
    welcomeBonus: "Welcome voucher or fee reversal promotions during active bank enrollment drives.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No complimentary airport lounge access."
    },
    milestoneRewards: "Annual fee renewal waiver on ₹2,00,000 annual spend.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for transactions between ₹500 and ₹3,000.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 30000,
      minAge: 21,
      minCibil: 750,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Broadest online coverage: 5% on Amazon, Flipkart, Myntra, and independent websites",
      "Direct bill credit with no points conversion or redemption fees",
      "Low annual fee that is easily offset with ₹20,000 in annual online spending"
    ],
    cons: [
      "No cashback on Utility bills, Rent, Wallet loads, or Fuel",
      "Does not include airport lounge access"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=sbi_cashback_card&aff_id=YOUR_AFF_ID",
    campaignName: "SBI Card Partner Network"
  },
  {
    id: "hdfc-millennia",
    name: "HDFC Millennia Credit Card",
    bank: "HDFC Bank",
    network: "Mastercard",
    cardTheme: "hdfc-indigo",
    joiningFee: 1000,
    annualFee: 1000,
    feeWaiverSpend: 100000,
    isLifetimeFree: false,
    rating: 4.7,
    reviewsCount: 2310,
    primaryCategory: "Cashback",
    categories: ["Cashback", "Shopping", "Lounge", "Dining"],
    tag: "Top All-Rounder Pick",
    cashbackSummary: "5% on Amazon, Flipkart, Swiggy, Zomato, Uber & Cult.fit + 1% Offline",
    rewardStructure: {
      online: 5.0,
      dining: 5.0,
      grocery: 5.0,
      fuel: 0.0,
      travel: 5.0,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "5% CashPoints on Amazon, Flipkart, Swiggy, Zomato, Uber, BookMyShow & Cult.fit",
      "1% CashPoints on all other retail transactions & wallet reloads",
      "1:1 redemption ratio (1 CashPoint = ₹1 for statement cash balance)",
      "1 complimentary domestic airport lounge visit per quarter on spending ₹1 Lakh in previous quarter",
      "Up to 20% discount at partner restaurants via Swiggy Dineout"
    ],
    welcomeBonus: "1,000 CashPoints on realization of joining fee.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 domestic lounge visit per calendar quarter upon spending ₹1 Lakh in the preceding quarter."
    },
    milestoneRewards: "₹1,000 gift voucher on spending ₹1 Lakh in a calendar quarter.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹5,000 (Max ₹250/cycle).",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 35000,
      minAge: 21,
      minCibil: 750,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Direct 1:1 points-to-cash redemption value",
      "Covers the most popular lifestyle and food delivery apps",
      "Modest ₹1,00,000 annual spend threshold for fee waiver"
    ],
    cons: [
      "Lounge access requires meeting the quarterly spend criterion",
      "Monthly cap of 1,000 CashPoints on 5% partner transactions"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=hdfc_millennia&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Bank Credit Cards"
  },
  {
    id: "idfc-first-wow",
    name: "IDFC FIRST WOW Credit Card",
    bank: "IDFC FIRST Bank",
    network: "Visa Infinite",
    cardTheme: "idfc-wow",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.9,
    reviewsCount: 3120,
    primaryCategory: "Guaranteed Approval",
    categories: ["Guaranteed Approval", "Lifetime Free", "Travel & Miles"],
    tag: "100% Guaranteed Approval (FD-Backed)",
    cashbackSummary: "Zero Forex Markup + 100% approval against ₹2,000 Fixed Deposit (No CIBIL / Income proof)",
    rewardStructure: {
      online: 3.0,
      dining: 3.0,
      grocery: 3.0,
      fuel: 1.0,
      travel: 6.0,
      bills: 1.0,
      others: 1.5
    },
    keyPerks: [
      "100% Guaranteed Approval: Issued against a minimum ₹2,000 Fixed Deposit with zero income verification",
      "No credit score (CIBIL) required — ideal for students, freelancers, and first-time applicants",
      "0% Zero Forex Markup fee on international transactions worldwide",
      "100% Lifetime Free with zero joining and zero annual maintenance fees forever",
      "Earn up to 7.5% p.a. interest on your underlying Fixed Deposit while using the credit card limit"
    ],
    welcomeBonus: "5% cashback (up to ₹1,000) on first transaction value.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "4X reward points on all spends with zero points expiration.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver across petrol stations in India.",
    forexMarkup: "0.0% (Zero Forex Markup)",
    eligibility: {
      minIncome: 0,
      minAge: 18,
      minCibil: 0,
      employment: "Anyone (Students, Freelancers, Homemakers, Salaried)"
    },
    pros: [
      "Guaranteed 100% approval rate with zero rejection risk",
      "Zero forex markup fee makes it the best entry card for international travel and online subscriptions",
      "FD continues to earn high interest while building your CIBIL score"
    ],
    cons: [
      "Credit limit equals 100% of the deposited FD amount",
      "Does not include airport lounge access"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=idfc_first_wow&aff_id=YOUR_AFF_ID",
    campaignName: "IDFC FIRST Bank Cards"
  },
  {
    id: "icici-amazon-pay",
    name: "Amazon Pay ICICI Credit Card",
    bank: "ICICI Bank",
    network: "Visa",
    cardTheme: "amazon-dark",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.9,
    reviewsCount: 3890,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "Cashback", "Shopping"],
    tag: "Lifetime Free (No Conditions)",
    cashbackSummary: "5% unlimited for Prime / 3% non-Prime on Amazon + 2% on 100+ partners",
    rewardStructure: {
      online: 5.0,
      dining: 2.0,
      grocery: 2.0,
      fuel: 0.0,
      travel: 2.0,
      bills: 2.0,
      others: 1.0
    },
    keyPerks: [
      "Zero joining fee and zero annual renewal fee for life",
      "5% unlimited cashback on Amazon India for Prime members (3% for non-Prime)",
      "2% unlimited cashback on 100+ partner merchants (Swiggy, Uber, Zomato, utility bill payments via Amazon Pay)",
      "1% unlimited cashback on all other transactions",
      "Earnings automatically credited as Amazon Pay Balance monthly"
    ],
    welcomeBonus: "Up to ₹1,500 Amazon Pay gift voucher upon card approval.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "No milestone requirements; all rewards are earned directly on monthly spends.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver across petrol stations in India.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 25000,
      minAge: 21,
      minCibil: 720,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Completely free for life with no recurring maintenance fees",
      "No maximum monthly cap on cashback earned",
      "Reliable automatic balance crediting every billing cycle"
    ],
    cons: [
      "Does not include airport lounge access",
      "Offline non-Amazon spends earn a modest 1% rate"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=icici_amazon_pay&aff_id=YOUR_AFF_ID",
    campaignName: "ICICI Bank Credit Cards"
  },
  {
    id: "axis-myzone",
    name: "Axis Bank My Zone Credit Card",
    bank: "Axis Bank",
    network: "Visa / RuPay",
    cardTheme: "axis-myzone",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.7,
    reviewsCount: 2240,
    primaryCategory: "High Approval",
    categories: ["High Approval", "Dining & Food", "Lounge", "UPI & RuPay"],
    tag: "High Approval Starter Card",
    cashbackSummary: "Free SonyLIV Annual Subscription + Buy 1 Get 1 on Paytm Movies & Swiggy ₹120 Off",
    rewardStructure: {
      online: 2.0,
      dining: 6.0,
      grocery: 2.0,
      fuel: 0.0,
      travel: 2.0,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "Complimentary SonyLIV Premium annual subscription worth ₹1,499 upon first spend within 30 days",
      "Buy 1 Get 1 Free on Paytm Movie tickets (Up to ₹200 discount per calendar month)",
      "Flat ₹120 off on Swiggy on minimum order of ₹500 (twice a month with coupon AXISMYZONE)",
      "1 complimentary domestic airport lounge access per calendar quarter (spend based)",
      "4 EDGE Reward Points per ₹200 spent on all standard transactions"
    ],
    welcomeBonus: "Free 1-Year SonyLIV Premium subscription upon card activation.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 complimentary domestic airport lounge visit per calendar quarter upon spending ₹50,000 in previous 3 months."
    },
    milestoneRewards: "Annual fee waived on spending ₹2,00,000 in the anniversary year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹4,000.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 15000,
      minAge: 18,
      minCibil: 700,
      employment: "Salaried or Self-Employed (Very High Approval Rate)"
    },
    pros: [
      "Accessible entry-level eligibility criteria with high approval rates for young professionals",
      "SonyLIV subscription and movie discounts easily recover the ₹500 annual fee",
      "Available on RuPay network for UPI payments"
    ],
    cons: [
      "Reward point earning rate is relatively modest on general spends",
      "Swiggy discount has a ₹500 minimum order threshold"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=axis_my_zone&aff_id=YOUR_AFF_ID",
    campaignName: "Axis Bank Credit Cards"
  },
  {
    id: "indusind-legend",
    name: "IndusInd Bank Legend Credit Card",
    bank: "IndusInd Bank",
    network: "Visa Signature",
    cardTheme: "indusind-legend",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.8,
    reviewsCount: 1890,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "High Approval", "Lounge", "Shopping"],
    tag: "Lifetime Free with Lounge Access",
    cashbackSummary: "Lifetime Free + 1 Domestic Lounge/Quarter + Buy 1 Get 1 Movie Tickets",
    rewardStructure: {
      online: 2.0,
      dining: 2.0,
      grocery: 1.5,
      fuel: 0.0,
      travel: 3.0,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "100% Lifetime Free Card with zero annual maintenance fees on pre-approved issuance drives",
      "1 complimentary domestic airport lounge visit per calendar quarter across major Indian airports",
      "Buy 1 Get 1 Free on BookMyShow movie tickets (Up to ₹200 discount per ticket, twice a month)",
      "Earn 1 Reward Point per ₹100 on weekdays and 2 Reward Points per ₹100 on weekends",
      "1:1 cash conversion on reward points or airline voucher redemptions"
    ],
    welcomeBonus: "Discount vouchers on luxury retail brands upon card activation.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 complimentary domestic airport lounge visit per calendar quarter."
    },
    milestoneRewards: "4,000 bonus reward points on reaching ₹6 Lakh annual spend.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver across all fuel stations in India.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 25000,
      minAge: 21,
      minCibil: 720,
      employment: "Salaried or Self-Employed (High Pre-Approval Volume)"
    },
    pros: [
      "One of the few Lifetime Free cards providing complimentary domestic airport lounge access",
      "Reliable weekend reward point multiplier",
      "BOGO movie ticket savings of up to ₹4,800 annually on BookMyShow"
    ],
    cons: [
      "Base weekday reward rate of 1% is moderate",
      "Points redemption catalogue has minor processing fee"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=indusind_legend&aff_id=YOUR_AFF_ID",
    campaignName: "IndusInd Bank Partner Program"
  },
  {
    id: "hdfc-moneyback",
    name: "HDFC MoneyBack+ Credit Card",
    bank: "HDFC Bank",
    network: "Visa / RuPay",
    cardTheme: "hdfc-moneyback",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 50000,
    isLifetimeFree: false,
    rating: 4.6,
    reviewsCount: 3200,
    primaryCategory: "High Approval",
    categories: ["High Approval", "Shopping", "Cashback"],
    tag: "High Approval Entry Starter",
    cashbackSummary: "10X CashPoints on Amazon, Flipkart, Swiggy, Reliance Smart & BigBasket",
    rewardStructure: {
      online: 3.3,
      dining: 3.3,
      grocery: 3.3,
      fuel: 0.0,
      travel: 1.0,
      bills: 1.0,
      others: 0.7
    },
    keyPerks: [
      "10X CashPoints (3.3% return) on Amazon, Flipkart, Swiggy, BigBasket, and Reliance Smart",
      "5X CashPoints on EMI spends at merchant locations",
      "2 CashPoints per ₹150 on other retail spends",
      "Low ₹50,000 annual spend requirement to waive the ₹500 renewal fee",
      "₹500 gift voucher on spending ₹50,000 per calendar quarter"
    ],
    welcomeBonus: "500 CashPoints upon payment of joining fee.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "₹500 gift voucher every quarter on ₹50,000 spend (Up to ₹2,000 vouchers/year).",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹5,000 (Max ₹250/cycle).",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 20000,
      minAge: 21,
      minCibil: 700,
      employment: "Salaried or Self-Employed (Top Approval Rate in HDFC)"
    },
    pros: [
      "Highest approval rate among all HDFC retail credit cards",
      "Low ₹50,000 annual spend condition for fee waiver",
      "Quarterly voucher rewards offer an additional 1% return on spends"
    ],
    cons: [
      "CashPoints redemption value for statement balance is 1 CP = ₹0.25",
      "Does not include airport lounge access"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=hdfc_moneyback_plus&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Bank Credit Cards"
  },
  {
    id: "onecard-metal",
    name: "OneCard Metal Credit Card",
    bank: "Federal / SBM / South Indian Bank",
    network: "Visa Signature",
    cardTheme: "onecard-metal",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.8,
    reviewsCount: 2800,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "Guaranteed Approval", "Shopping", "Dining"],
    tag: "Lifetime Free Metal Card (FD & Unsecured)",
    cashbackSummary: "5X Rewards on top 2 monthly spend categories + 100% approval via FD option",
    rewardStructure: {
      online: 3.0,
      dining: 4.0,
      grocery: 3.0,
      fuel: 1.0,
      travel: 3.0,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "Premium metal credit card with zero joining fee and zero annual fee forever",
      "Guaranteed approval option available against a Fixed Deposit starting from ₹5,000",
      "5X Reward Points on your top 2 spending categories each month automatically",
      "Fractional reward points on every transaction with instant in-app points redemption",
      "1% fuel surcharge waiver up to ₹400 per month across petrol stations"
    ],
    welcomeBonus: "Welcome reward bonus points upon card activation in OneCard mobile app.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access on standard tier."
    },
    milestoneRewards: "Bonus points multipliers on achieving monthly category spend targets.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹4,000.",
    forexMarkup: "1.0% + GST (Very low international forex markup)",
    eligibility: {
      minIncome: 0,
      minAge: 18,
      minCibil: 0,
      employment: "Salaried, Self-Employed, Students, or Against FD"
    },
    pros: [
      "100% Lifetime Free metal card with sleek mobile app control",
      "Low 1.0% forex markup is substantially cheaper than traditional bank cards (3.5%)",
      "FD option guarantees 100% approval without requiring pay slips"
    ],
    cons: [
      "No complimentary domestic airport lounge access",
      "Reward rate outside the top 2 monthly categories is 0.2%"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=onecard_metal&aff_id=YOUR_AFF_ID",
    campaignName: "OneCard Partner Network"
  },
  {
    id: "kotak-811-dream",
    name: "Kotak 811 #DreamDifferent Card",
    bank: "Kotak Mahindra Bank",
    network: "Visa",
    cardTheme: "kotak-811",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.6,
    reviewsCount: 1650,
    primaryCategory: "Guaranteed Approval",
    categories: ["Guaranteed Approval", "Lifetime Free", "Shopping"],
    tag: "100% Approval Against FD",
    cashbackSummary: "100% guaranteed approval against ₹10,000 FD + 2X rewards on online spends",
    rewardStructure: {
      online: 2.0,
      dining: 1.5,
      grocery: 1.5,
      fuel: 1.0,
      travel: 1.5,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "100% Guaranteed Approval against a Fixed Deposit of ₹10,000 or more",
      "Zero income proof, no salary slips, and no prior CIBIL credit score required",
      "Credit limit up to 90% of your fixed deposit amount",
      "2X reward points on all online purchases with zero joining or annual maintenance fees",
      "Interest-free cash withdrawal from ATMs up to 48 days (only nominal transaction fee applies)"
    ],
    welcomeBonus: "500 bonus reward points upon card activation and initial spend.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "₹750 cashback on spending ₹75,000 in an anniversary year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹500 to ₹3,000 (Max ₹3,500/year).",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 0,
      minAge: 18,
      minCibil: 0,
      employment: "Anyone holding or opening a Kotak 811 Fixed Deposit"
    },
    pros: [
      "100% guaranteed approval for individuals without credit history or formal salary slips",
      "FD continues earning regular interest while you build credit score",
      "Completely Lifetime Free"
    ],
    cons: [
      "Requires minimum ₹10,000 fixed deposit lock-in",
      "Basic reward rate on offline retail spends"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=kotak_811_card&aff_id=YOUR_AFF_ID",
    campaignName: "Kotak Mahindra Bank Cards"
  },
  {
    id: "rbl-shoprite",
    name: "RBL Bank ShopRite Credit Card",
    bank: "RBL Bank",
    network: "Mastercard",
    cardTheme: "rbl-shoprite",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 150000,
    isLifetimeFree: false,
    rating: 4.6,
    reviewsCount: 1410,
    primaryCategory: "High Approval",
    categories: ["High Approval", "Shopping", "Dining"],
    tag: "High Approval in Tier 2/3 Cities",
    cashbackSummary: "5% valueback on grocery shopping + 10% off on BookMyShow movie tickets",
    rewardStructure: {
      online: 2.0,
      dining: 2.5,
      grocery: 5.0,
      fuel: 2.5,
      travel: 1.0,
      bills: 1.0,
      others: 1.0
    },
    keyPerks: [
      "High approval rate across Tier-1, Tier-2, and Tier-3 cities in India",
      "20 Reward Points per ₹100 spent on Grocery shopping (5% valueback, up to 1,000 points/month)",
      "10% discount on BookMyShow movie tickets (Up to ₹100 off, 15 times a year)",
      "1 Reward Point per ₹100 spent on all other standard retail categories",
      "Fuel surcharge waiver at all petrol stations across India"
    ],
    welcomeBonus: "2,000 reward points (worth ₹500) upon card fee payment and first transaction.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "Annual fee reversal on achieving ₹1,50,000 spend in a year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹500 to ₹4,000 (Max ₹100/month).",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 20000,
      minAge: 21,
      minCibil: 700,
      employment: "Salaried or Self-Employed (Broad City Serviceability)"
    },
    pros: [
      "5% valueback return on routine supermarket and grocery shopping",
      "BookMyShow discount can be used up to 15 times a year (saving up to ₹1,500)",
      "Flexible approval underwriting for self-employed and small business owners"
    ],
    cons: [
      "Monthly cap on grocery accelerated reward points",
      "No complimentary airport lounge access"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=rbl_shoprite&aff_id=YOUR_AFF_ID",
    campaignName: "RBL Bank Partner Program"
  },
  {
    id: "axis-airtel",
    name: "Airtel Axis Bank Credit Card",
    bank: "Axis Bank",
    network: "Mastercard",
    cardTheme: "airtel-red",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 1650,
    primaryCategory: "Utility & Bills",
    categories: ["Utility & Bills", "Cashback", "Dining", "Lounge"],
    tag: "Best for Utilities & Recharges",
    cashbackSummary: "25% on Airtel recharges + 10% on utilities, BigBasket, Swiggy & Zomato",
    rewardStructure: {
      online: 1.0,
      dining: 10.0,
      grocery: 10.0,
      fuel: 0.0,
      travel: 1.0,
      bills: 10.0,
      others: 1.0
    },
    keyPerks: [
      "25% cashback on Airtel Mobile, Broadband, DTH, and Wi-Fi payments via Airtel Thanks app",
      "10% cashback on Electricity, Water, and Gas bill payments via Airtel Thanks App (Max ₹300/mo)",
      "10% cashback on Swiggy, Zomato, and BigBasket (Max ₹500/mo combined)",
      "4 complimentary domestic airport lounge visits per year (1 per quarter)",
      "1% unlimited cashback on all other transactions"
    ],
    welcomeBonus: "₹500 Amazon e-voucher upon first transaction within 30 days.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 complimentary domestic airport lounge visit per calendar quarter."
    },
    milestoneRewards: "Annual fee waiver on ₹2,00,000 spend in a year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹4,000.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 25000,
      minAge: 21,
      minCibil: 740,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "25% return on Airtel telecommunication and broadband bills",
      "High 10% saving on routine household utility bills",
      "Complimentary domestic lounge access included for a ₹500 annual fee"
    ],
    cons: [
      "Utility discounts require payment through the Airtel Thanks app",
      "Monthly caps apply on utility and dining cashback"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=axis_airtel_card&aff_id=YOUR_AFF_ID",
    campaignName: "Axis Bank Partner Cards"
  },
  {
    id: "axis-flipkart",
    name: "Flipkart Axis Bank Credit Card",
    bank: "Axis Bank",
    network: "Visa",
    cardTheme: "flipkart-yellow",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 350000,
    isLifetimeFree: false,
    rating: 4.6,
    reviewsCount: 2900,
    primaryCategory: "Shopping",
    categories: ["Shopping", "Cashback", "Dining"],
    tag: "Best for Flipkart Shoppers",
    cashbackSummary: "5% unlimited on Flipkart + 4% on preferred partners (Swiggy, Uber, PVR)",
    rewardStructure: {
      online: 5.0,
      dining: 4.0,
      grocery: 4.0,
      fuel: 0.0,
      travel: 4.0,
      bills: 1.5,
      others: 1.5
    },
    keyPerks: [
      "5% unlimited cashback on Flipkart and Cleartrip",
      "4% cashback on partner apps: Swiggy, Uber, PVR, and Cult.fit",
      "1.5% unlimited cashback on all other online and offline transactions",
      "Direct monthly statement credit",
      "Up to 15% dining discount under Axis Bank Dining Delights"
    ],
    welcomeBonus: "₹600 joining vouchers (Flipkart + Swiggy) on first spend within 30 days.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "Annual fee waiver on ₹3.5 Lakh annual retail spends.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver for spends ₹400 to ₹4,000 (Max ₹400/month).",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 20000,
      minAge: 18,
      minCibil: 720,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Unlimited 5% cashback on Flipkart with no monthly ceiling",
      "1.5% base reward on all general transactions",
      "Low annual fee easily recovered with regular shopping"
    ],
    cons: [
      "No complimentary airport lounge access",
      "High ₹3.5 Lakh spend threshold for fee waiver"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=axis_flipkart&aff_id=YOUR_AFF_ID",
    campaignName: "Axis Bank Credit Cards"
  },
  {
    id: "axis-atlas",
    name: "Axis Bank Atlas Credit Card",
    bank: "Axis Bank",
    network: "Visa Signature",
    cardTheme: "atlas-gold",
    joiningFee: 5000,
    annualFee: 5000,
    feeWaiverSpend: 0,
    isLifetimeFree: false,
    rating: 4.9,
    reviewsCount: 1100,
    primaryCategory: "Travel & Miles",
    categories: ["Travel & Miles", "Lounge", "Luxury", "Dining"],
    tag: "Top Pick for Air Miles & Travel",
    cashbackSummary: "5 EDGE Miles per ₹100 on airlines/hotels (1:2 transfer ratio = up to 10% return)",
    rewardStructure: {
      online: 2.0,
      dining: 4.0,
      grocery: 2.0,
      fuel: 0.0,
      travel: 10.0,
      bills: 0.0,
      others: 2.0
    },
    keyPerks: [
      "5 EDGE Miles per ₹100 spent directly on Airlines & Hotel websites",
      "2 EDGE Miles per ₹100 on all other eligible retail transactions",
      "1:2 transfer ratio (1 EDGE Mile = 2 Partner Miles with Singapore Airlines KrisFlyer, Accor, Qatar Airways, etc.)",
      "Tier-based domestic (up to 18) and international (up to 12) airport lounge access",
      "Milestone bonus miles on reaching annual spend targets"
    ],
    welcomeBonus: "5,000 EDGE Miles (worth ₹10,000 in hotel redemption) upon first transaction within 30 days.",
    loungeAccess: {
      domestic: 12,
      international: 6,
      details: "Tier-based domestic (8 to 18) and international (4 to 12) lounge visits per year."
    },
    milestoneRewards: "2,500 bonus miles at ₹3L, 5,000 miles at ₹7.5L, and 10,000 miles at ₹15L annual spends.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver up to ₹400/month.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 100000,
      minAge: 21,
      minCibil: 760,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Market-leading 1:2 partner transfer ratio to international airlines and Accor Hotels",
      "Welcome bonus completely offsets the ₹5,000 annual fee",
      "Comprehensive airport lounge access for domestic and international departures"
    ],
    cons: [
      "Annual fee of ₹5,000 is not waivable (renewed with 2,500 bonus miles)",
      "Strict merchant categorization on airline booking portals"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=axis_atlas&aff_id=YOUR_AFF_ID",
    campaignName: "Axis Bank Premium Cards"
  },
  {
    id: "hdfc-regalia-gold",
    name: "HDFC Regalia Gold Credit Card",
    bank: "HDFC Bank",
    network: "Visa Signature",
    cardTheme: "regalia-gold",
    joiningFee: 2500,
    annualFee: 2500,
    feeWaiverSpend: 400000,
    isLifetimeFree: false,
    rating: 4.7,
    reviewsCount: 1980,
    primaryCategory: "Travel & Miles",
    categories: ["Travel & Miles", "Lounge", "Shopping", "Dining"],
    tag: "Premium Travel & Lifestyle",
    cashbackSummary: "4 Reward Points per ₹150 + 5X on Marks & Spencer, Myntra, Nykaa & Reliance Digital",
    rewardStructure: {
      online: 3.5,
      dining: 4.0,
      grocery: 2.5,
      fuel: 0.0,
      travel: 6.5,
      bills: 1.0,
      others: 1.5
    },
    keyPerks: [
      "12 complimentary domestic airport lounge visits per calendar year",
      "6 complimentary international airport lounge visits using Priority Pass",
      "5X Reward Points on leading retail partners (Myntra, Nykaa, M&S, Reliance Digital)",
      "SmartBuy flight & hotel redemption value of 1 RP = ₹0.50",
      "₹1,500 flight voucher every quarter on ₹1.5 Lakh spend"
    ],
    welcomeBonus: "Club Marriott membership + ₹2,500 shopping vouchers upon fee payment.",
    loungeAccess: {
      domestic: 12,
      international: 6,
      details: "12 domestic visits/year + 6 international visits via complimentary Priority Pass."
    },
    milestoneRewards: "₹1,500 quarterly flight voucher + ₹5,000 flight voucher on ₹5 Lakh annual spend.",
    fuelSurchargeWaiver: "1% waiver for transactions ₹400 to ₹5,000 (Max ₹500/month).",
    forexMarkup: "2.0% + GST (Low markup with Global Value Program)",
    eligibility: {
      minIncome: 100000,
      minAge: 21,
      minCibil: 760,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "12 domestic and 6 international lounge accesses with Priority Pass",
      "Accelerated 5X rewards on everyday premium fashion and electronics brands",
      "Substantial flight voucher milestone bonuses"
    ],
    cons: [
      "SmartBuy point redemptions are subject to a 70% points / 30% cash rule",
      "₹4 Lakh annual spend required for fee waiver"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=hdfc_regalia_gold&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Bank Credit Cards"
  },
  {
    id: "tata-neu-infinity",
    name: "Tata Neu Infinity HDFC Credit Card",
    bank: "HDFC Bank",
    network: "RuPay",
    cardTheme: "tata-neu",
    joiningFee: 1499,
    annualFee: 1499,
    feeWaiverSpend: 300000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 1540,
    primaryCategory: "UPI & RuPay",
    categories: ["UPI & RuPay", "Shopping", "Lounge", "Cashback"],
    tag: "Best for RuPay UPI & Tata Brands",
    cashbackSummary: "10% NeuCoins on Tata Neu ecosystem + 1.5% on RuPay UPI merchant QR payments",
    rewardStructure: {
      online: 10.0,
      dining: 5.0,
      grocery: 10.0,
      fuel: 0.0,
      travel: 10.0,
      bills: 5.0,
      others: 1.5
    },
    keyPerks: [
      "10% NeuCoins (5% on Card + 5% with NeuPass) on BigBasket, Air India, Tata 1mg, Croma, IHCL, Westside & Titan",
      "1.5% NeuCoins on all RuPay UPI QR payments (BHIM, Google Pay, PhonePe, Paytm)",
      "1 NeuCoin = ₹1 exact redemption value across Tata ecosystem apps and physical stores",
      "8 complimentary domestic lounge visits + 4 international lounge visits per year with Priority Pass",
      "Zero lost card liability protection"
    ],
    welcomeBonus: "1,499 NeuCoins upon first transaction within 30 days of issuance.",
    loungeAccess: {
      domestic: 8,
      international: 4,
      details: "2 domestic visits per quarter + 4 international visits per year via Priority Pass."
    },
    milestoneRewards: "Annual fee waiver on ₹3,00,000 spend in the preceding year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver (Max ₹500/month).",
    forexMarkup: "2.0% + GST",
    eligibility: {
      minIncome: 100000,
      minAge: 21,
      minCibil: 750,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "1.5% rewards on UPI QR merchant transactions",
      "10% direct value back on BigBasket groceries, Croma electronics, and Air India flights",
      "1:1 redemption ratio without expiration when active"
    ],
    cons: [
      "NeuCoins are redeemable exclusively within the Tata brand network",
      "₹1,499 annual fee is higher than standard cashback cards"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=tata_neu_infinity&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Bank RuPay Cards"
  },
  {
    id: "swiggy-hdfc",
    name: "Swiggy HDFC Bank Credit Card",
    bank: "HDFC Bank",
    network: "Mastercard",
    cardTheme: "swiggy-orange",
    joiningFee: 500,
    annualFee: 500,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 1750,
    primaryCategory: "Dining & Food",
    categories: ["Dining & Food", "Cashback", "Shopping"],
    tag: "Best for Food Delivery & Dining",
    cashbackSummary: "10% on Swiggy, Instamart & Dineout + 5% on 1,000+ top online stores",
    rewardStructure: {
      online: 5.0,
      dining: 10.0,
      grocery: 10.0,
      fuel: 0.0,
      travel: 1.0,
      bills: 0.0,
      others: 1.0
    },
    keyPerks: [
      "10% cashback on Swiggy Food Delivery, Instamart grocery, Dineout & Genie (Max ₹1,500/month)",
      "5% cashback on Amazon, Flipkart, Myntra, Nykaa, Zara, Uber, Nike & 1,000+ online stores (Max ₹1,500/month)",
      "1% cashback on all other retail transactions",
      "Cashback credited directly to your monthly bill statement or Swiggy Money",
      "Complimentary 3-month Swiggy One membership"
    ],
    welcomeBonus: "Complimentary 3-month Swiggy One membership upon activation.",
    loungeAccess: {
      domestic: 0,
      international: 0,
      details: "No airport lounge access."
    },
    milestoneRewards: "Annual fee reversal on achieving ₹2,00,000 spend in a year.",
    fuelSurchargeWaiver: "No fuel surcharge waiver.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 25000,
      minAge: 21,
      minCibil: 740,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "10% direct savings on daily food and grocery deliveries",
      "5% cashback across top online fashion and ecommerce platforms",
      "Generous combined monthly cashback ceiling of ₹3,000/month"
    ],
    cons: [
      "No airport lounge access",
      "Excludes fuel, wallet reloads, and government/utility payments"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=swiggy_hdfc&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Co-brand Cards"
  },
  {
    id: "amex-platinum-travel",
    name: "American Express Platinum Travel Card",
    bank: "American Express",
    network: "American Express",
    cardTheme: "amex-platinum",
    joiningFee: 3500,
    annualFee: 5000,
    feeWaiverSpend: 0,
    isLifetimeFree: false,
    rating: 4.9,
    reviewsCount: 1840,
    primaryCategory: "Travel & Miles",
    categories: ["Travel & Miles", "Luxury", "Lounge"],
    tag: "Luxury Travel Milestones",
    cashbackSummary: "Up to 10-12% return via Taj Hotel vouchers & Marriott Bonvoy points on ₹4L annual spend",
    rewardStructure: {
      online: 3.0,
      dining: 4.0,
      grocery: 3.0,
      fuel: 1.0,
      travel: 12.0,
      bills: 2.0,
      others: 2.0
    },
    keyPerks: [
      "1 Membership Rewards Point for every ₹50 spent across categories",
      "15,000 bonus points on reaching ₹1.9 Lakh annual spend",
      "25,000 bonus points + ₹10,000 Taj Experiences Hotel voucher on reaching ₹4 Lakh spend",
      "8 complimentary domestic airport lounge visits per year (2 per quarter)",
      "Transfer points 1:1 to Marriott Bonvoy for premium hotel night stays"
    ],
    welcomeBonus: "10,000 Membership Rewards points on spending ₹15,000 in first 90 days.",
    loungeAccess: {
      domestic: 8,
      international: 0,
      details: "2 complimentary domestic lounge visits per calendar quarter."
    },
    milestoneRewards: "15,000 points at ₹1.9L + 25,000 points and ₹10,000 Taj Voucher at ₹4L spends.",
    fuelSurchargeWaiver: "0% fuel convenience fee at HPCL petrol pumps for transactions under ₹5,000.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 50000,
      minAge: 21,
      minCibil: 760,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "10-12% reward rate when reaching the ₹4 Lakh annual spend milestone",
      "Taj Experiences voucher included with milestone achievement",
      "24/7 dedicated American Express customer service and dispute protection"
    ],
    cons: [
      "₹5,000 annual fee is non-waivable",
      "American Express offline acceptance is lower in Tier-2 and Tier-3 cities"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=amex_platinum_travel&aff_id=YOUR_AFF_ID",
    campaignName: "American Express India"
  },
  {
    id: "scapia-federal",
    name: "Scapia Federal Credit Card",
    bank: "Federal Bank",
    network: "Visa Signature",
    cardTheme: "scapia-green",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.8,
    reviewsCount: 1220,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "Travel & Miles", "Lounge"],
    tag: "Zero Forex & Free Lounge",
    cashbackSummary: "0% Forex markup globally + unlimited domestic lounge access on ₹5,000 monthly spend",
    rewardStructure: {
      online: 2.0,
      dining: 4.0,
      grocery: 2.0,
      fuel: 0.0,
      travel: 10.0,
      bills: 1.0,
      others: 2.0
    },
    keyPerks: [
      "0% zero forex markup fee on all international payments worldwide",
      "Unlimited domestic airport lounge visits with minimum ₹5,000 spend in preceding month",
      "20% Scapia Coins on all flight and hotel bookings in the Scapia App",
      "10% Scapia Coins on all other eligible daily transactions",
      "Lifetime Free card with no joining or annual fees"
    ],
    welcomeBonus: "Instant travel booking perks in the Scapia mobile application.",
    loungeAccess: {
      domestic: 999,
      international: 0,
      details: "Unlimited domestic lounge access with minimum ₹5,000 spend in previous billing cycle."
    },
    milestoneRewards: "Travel reward boosters for frequent flyers.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver.",
    forexMarkup: "0.0% (Zero Forex Markup)",
    eligibility: {
      minIncome: 30000,
      minAge: 23,
      minCibil: 750,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "Zero forex markup eliminates the standard 3.5% foreign exchange surcharge",
      "Low monthly spend requirement (₹5,000) to qualify for airport lounge access",
      "Instant flight and hotel coin redemptions in app"
    ],
    cons: [
      "Approvals depend on Federal Bank internal serviceable location guidelines",
      "Scapia coins are redeemable only for travel bookings inside the Scapia app"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=scapia_federal&aff_id=YOUR_AFF_ID",
    campaignName: "Scapia Travel Cards"
  },
  {
    id: "au-lit",
    name: "AU LIT Credit Card",
    bank: "AU Small Finance Bank",
    network: "Visa",
    cardTheme: "au-lit",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.7,
    reviewsCount: 980,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "Cashback", "Lounge", "High Approval"],
    tag: "Customizable Feature Model",
    cashbackSummary: "Activate 5% cashback or airport lounge visits on-demand via mobile app",
    rewardStructure: {
      online: 5.0,
      dining: 5.0,
      grocery: 5.0,
      fuel: 1.0,
      travel: 5.0,
      bills: 2.0,
      others: 1.0
    },
    keyPerks: [
      "Customizable credit card: Turn specific feature packs ON or OFF via the mobile app",
      "Lifetime Free base card with zero fixed annual charges",
      "Add 5% cashback on travel, grocery, dining, or electronics for 30/90 day periods as needed",
      "Add domestic airport lounge access packs for nominal micro-fees during travel months",
      "Activate 10X / 5X reward point boosters during festival spending periods"
    ],
    welcomeBonus: "Free 15-day introductory feature pack on card activation.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "On-demand domestic lounge access available to activate via AU 0101 app."
    },
    milestoneRewards: "Bonus milestone cashback passes upon quarterly spend targets.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver feature available.",
    forexMarkup: "1.99% + GST (when forex booster feature is active)",
    eligibility: {
      minIncome: 20000,
      minAge: 21,
      minCibil: 720,
      employment: "Salaried or Self-Employed (High Approval in Tier 2/3 Cities)"
    },
    pros: [
      "Zero fixed annual overhead: Pay small feature fees only in months you use them",
      "Enable 5% cashback ahead of major shopping events",
      "Accessible entry point for building a strong credit history"
    ],
    cons: [
      "Feature packs require manual renewal in the app after expiration",
      "Requires active management through mobile banking"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=au_lit_card&aff_id=YOUR_AFF_ID",
    campaignName: "AU Small Finance Bank Cards"
  },
  {
    id: "sbi-bpcl-octane",
    name: "BPCL SBI Card Octane",
    bank: "SBI Card",
    network: "Visa",
    cardTheme: "sbi-fuel",
    joiningFee: 1499,
    annualFee: 1499,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 1340,
    primaryCategory: "Fuel Savers",
    categories: ["Fuel Savers", "Cashback", "Lounge"],
    tag: "Highest Fuel Valueback",
    cashbackSummary: "7.25% valueback (25X reward points + 1% surcharge waiver) at BPCL stations",
    rewardStructure: {
      online: 2.5,
      dining: 2.5,
      grocery: 2.5,
      fuel: 7.25,
      travel: 1.0,
      bills: 2.5,
      others: 1.0
    },
    keyPerks: [
      "7.25% valueback (6.25% reward points + 1% fuel surcharge waiver) on BPCL fuel, lubricants, and Bharatgas",
      "25 reward points per ₹100 spent at BPCL petrol pumps (Max 2,500 points/month)",
      "10X reward points on dining, groceries, departmental stores, and movies",
      "4 complimentary domestic airport lounge visits per calendar year (1 per quarter)",
      "Instant reward point redemption for free fuel at BPCL outlets"
    ],
    welcomeBonus: "6,000 bonus reward points (worth ₹1,500 fuel) upon annual fee realization.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 complimentary domestic airport lounge visit per calendar quarter."
    },
    milestoneRewards: "Annual fee reversal on achieving ₹2,00,000 annual spend.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver on transactions up to ₹4,000.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 30000,
      minAge: 21,
      minCibil: 740,
      employment: "Salaried or Self-Employed"
    },
    pros: [
      "7.25% return on petrol and diesel purchases",
      "Welcome bonus of 6,000 points matches the ₹1,499 joining fee",
      "Includes 4 domestic airport lounge visits per year"
    ],
    cons: [
      "Fuel benefits apply exclusively at BPCL petrol stations",
      "Monthly ceiling of 2,500 bonus reward points on fuel purchases"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=sbi_bpcl_octane&aff_id=YOUR_AFF_ID",
    campaignName: "SBI Card Affiliate Program"
  },
  {
    id: "hsbc-cashback",
    name: "HSBC Live+ Credit Card",
    bank: "HSBC Bank",
    network: "Visa Platinum",
    cardTheme: "hsbc-red",
    joiningFee: 999,
    annualFee: 999,
    feeWaiverSpend: 200000,
    isLifetimeFree: false,
    rating: 4.8,
    reviewsCount: 890,
    primaryCategory: "Dining & Food",
    categories: ["Dining & Food", "Cashback", "Lounge", "Shopping"],
    tag: "10% on Dining & Supermarkets",
    cashbackSummary: "10% accelerated cashback on dining, food delivery & grocery supermarkets",
    rewardStructure: {
      online: 1.5,
      dining: 10.0,
      grocery: 10.0,
      fuel: 0.0,
      travel: 1.5,
      bills: 1.5,
      others: 1.5
    },
    keyPerks: [
      "10% cashback on Dining, Food Delivery (Swiggy, Zomato) & Supermarkets (Blinkit, Zepto, DMart, Nature's Basket)",
      "1.5% unlimited cashback on all other retail transactions",
      "4 complimentary domestic airport lounge visits per year (1 per quarter)",
      "Maximum accelerated cashback up to ₹1,000 per billing month",
      "Direct cashback credited to your statement balance"
    ],
    welcomeBonus: "₹1,000 Amazon voucher on ₹10,000 spend in first 30 days.",
    loungeAccess: {
      domestic: 4,
      international: 0,
      details: "1 complimentary domestic airport lounge visit per calendar quarter."
    },
    milestoneRewards: "Annual fee reversal on ₹2,00,000 spend in a year.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver up to ₹250/month.",
    forexMarkup: "3.5% + GST",
    eligibility: {
      minIncome: 40000,
      minAge: 21,
      minCibil: 750,
      employment: "Salaried only (Select Tier 1 Cities)"
    },
    pros: [
      "Includes offline supermarket grocery purchases (DMart, Reliance Smart) in the 10% cashback tier",
      "1.5% base cashback on all standard transactions",
      "Includes domestic airport lounge access"
    ],
    cons: [
      "Accelerated 10% cashback is capped at ₹1,000 per month",
      "Strict city serviceable requirements for HSBC approvals"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=hsbc_live_plus&aff_id=YOUR_AFF_ID",
    campaignName: "HSBC Bank Cards"
  },
  {
    id: "hdfc-infinia-metal",
    name: "HDFC Infinia Credit Card (Metal Edition)",
    bank: "HDFC Bank",
    network: "Visa Infinite",
    cardTheme: "infinia-black",
    joiningFee: 12500,
    annualFee: 12500,
    feeWaiverSpend: 1000000,
    isLifetimeFree: false,
    rating: 5.0,
    reviewsCount: 3100,
    primaryCategory: "Super Premium",
    categories: ["Super Premium", "Travel & Miles", "Luxury", "Lounge", "Dining"],
    tag: "Super Premium Flagship",
    cashbackSummary: "33.3% reward rate via SmartBuy flights/hotels + unlimited worldwide lounges",
    rewardStructure: {
      online: 3.3,
      dining: 6.6,
      grocery: 3.3,
      fuel: 0.0,
      travel: 33.3,
      bills: 3.3,
      others: 3.3
    },
    keyPerks: [
      "5 Reward Points per ₹150 spent (3.3% base reward rate across categories)",
      "Up to 10X Reward Points on SmartBuy flights, hotels, and vouchers (33.3% reward rate)",
      "1 Reward Point = ₹1.00 on SmartBuy flight and 5-star hotel bookings or Apple products",
      "Unlimited domestic and international airport lounge access with Priority Pass for primary and add-on cardholders",
      "Complimentary Club Marriott membership and dining privileges at luxury partner hotels"
    ],
    welcomeBonus: "12,500 Reward Points upon card fee realization.",
    loungeAccess: {
      domestic: 999,
      international: 999,
      details: "Unlimited complimentary domestic and international lounge access for both primary and add-on cardholders."
    },
    milestoneRewards: "Annual fee reversal on achieving ₹10 Lakh annual spend.",
    fuelSurchargeWaiver: "1% waiver on fuel spends (Max ₹1,000/month).",
    forexMarkup: "2.0% + GST",
    eligibility: {
      minIncome: 250000,
      minAge: 21,
      minCibil: 780,
      employment: "Invitation Only / High Net Worth (ITR ₹36L+)"
    },
    pros: [
      "33.3% return on flight and hotel bookings through SmartBuy",
      "1:1 cash-equivalent redemption value on travel bookings",
      "Unlimited worldwide airport lounge access with add-on cardholder privileges"
    ],
    cons: [
      "Strict invitation-only income and credit criteria",
      "₹12,500 annual maintenance fee"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=hdfc_infinia&aff_id=YOUR_AFF_ID",
    campaignName: "HDFC Super Premium Cards"
  },
  {
    id: "idfc-first-wealth",
    name: "IDFC FIRST Wealth Credit Card",
    bank: "IDFC FIRST Bank",
    network: "Visa Infinite",
    cardTheme: "idfc-wealth",
    joiningFee: 0,
    annualFee: 0,
    feeWaiverSpend: 0,
    isLifetimeFree: true,
    rating: 4.8,
    reviewsCount: 1620,
    primaryCategory: "Lifetime Free",
    categories: ["Lifetime Free", "Luxury", "Lounge", "Travel & Miles"],
    tag: "Lifetime Free Wealth Card",
    cashbackSummary: "Lifetime free with international lounges, airport spa visits & low forex",
    rewardStructure: {
      online: 2.5,
      dining: 2.5,
      grocery: 1.5,
      fuel: 0.0,
      travel: 5.0,
      bills: 1.0,
      others: 1.5
    },
    keyPerks: [
      "100% Lifetime Free with zero joining or annual renewal fees",
      "4 complimentary domestic & international airport lounge visits + 4 airport spa visits per quarter",
      "Buy 1 Get 1 Free movie tickets on Paytm (Up to ₹500 discount twice a month)",
      "Dynamic interest rates starting from 9% p.a.",
      "Zero interest fee on ATM cash withdrawals until the billing due date"
    ],
    welcomeBonus: "Gift vouchers worth ₹500 upon initial spend of ₹15,000.",
    loungeAccess: {
      domestic: 16,
      international: 16,
      details: "4 complimentary domestic/international lounge visits + 4 spa visits per quarter on ₹20,000 monthly spend."
    },
    milestoneRewards: "10X reward points on incremental spends above ₹30,000 in a billing cycle.",
    fuelSurchargeWaiver: "1% fuel surcharge waiver up to ₹400/month.",
    forexMarkup: "1.5% + GST (Low international markup)",
    eligibility: {
      minIncome: 150000,
      minAge: 21,
      minCibil: 750,
      employment: "Salaried (₹36L+ CTC) or IDFC Wealth Banking Customer"
    },
    pros: [
      "Rare combination of Lifetime Free status with airport spa and international lounge benefits",
      "1.5% low foreign currency markup fee",
      "Reward points that never expire"
    ],
    cons: [
      "Requires ₹20,000 spend in previous month to unlock quarterly lounge and spa access",
      "High qualification requirements for the Wealth tier"
    ],
    affiliateUrl: "https://tracking.vcommission.com/aff_c?offer_id=idfc_first_wealth&aff_id=YOUR_AFF_ID",
    campaignName: "IDFC FIRST Bank Cards"
  }
];

export const CATEGORIES = [
  { id: "all", label: "All Cards" },
  { id: "Guaranteed Approval", label: "100% Guaranteed Approval (FD)" },
  { id: "High Approval", label: "High Approval Starters" },
  { id: "Cashback", label: "Cashback" },
  { id: "Lifetime Free", label: "Lifetime Free" },
  { id: "Travel & Miles", label: "Travel & Miles" },
  { id: "Lounge", label: "Airport Lounge" },
  { id: "Dining & Food", label: "Food & Dining" },
  { id: "Shopping", label: "Shopping" },
  { id: "UPI & RuPay", label: "RuPay UPI" },
  { id: "Fuel Savers", label: "Fuel Savers" },
  { id: "Super Premium", label: "Super Premium" }
];

export const BANKS = [
  "HDFC Bank",
  "SBI Card",
  "Axis Bank",
  "ICICI Bank",
  "IDFC FIRST Bank",
  "IndusInd Bank",
  "Kotak Mahindra Bank",
  "RBL Bank",
  "Federal / SBM / OneCard",
  "American Express",
  "AU Small Finance Bank",
  "HSBC Bank"
];

export const NETWORKS = ["Visa", "Mastercard", "RuPay", "American Express"];
