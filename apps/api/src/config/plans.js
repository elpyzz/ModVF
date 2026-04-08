const SUBSCRIPTION_PLANS = {
  starter_monthly: {
    name: 'Starter Mensuel',
    priceId: 'price_1TJyu5Hz8fVVNyb1GCUwm3Bg',
    price: 4.99,
    interval: 'month',
    maxModpacks: 3,
    maxModsPerDay: Infinity,
    downloadExpiryHours: 72,
  },
  pack_monthly: {
    name: 'Pack Mensuel',
    priceId: 'price_1TJyvIHz8fVVNyb1aOSLkNA3',
    price: 9.99,
    interval: 'month',
    maxModpacks: 10,
    maxModsPerDay: Infinity,
    downloadExpiryHours: 168, // 7 jours
  },
  pack_annual: {
    name: 'Pack Annuel',
    priceId: 'price_1TJyw8Hz8fVVNyb1Y9n6g756',
    price: 89.0,
    interval: 'year',
    maxModpacks: 10,
    maxModsPerDay: Infinity,
    downloadExpiryHours: 168,
  },
}

// Map inverse : price_id → plan key
const PRICE_TO_PLAN = Object.fromEntries(
  Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => [plan.priceId, key]),
)

// Liste des price_id autorisés pour les subscriptions
const VALID_SUBSCRIPTION_PRICES = Object.values(SUBSCRIPTION_PLANS).map((p) => p.priceId)

export { SUBSCRIPTION_PLANS, PRICE_TO_PLAN, VALID_SUBSCRIPTION_PRICES }
