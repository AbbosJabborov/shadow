// Risk tiering shared by region-level index (0-100) and AI business scores (1-10).
// Kept color-free on purpose: severity reads through label + badge variant + icon, not hue.

export const INDEX_TIERS = [
  { max: 39, label: "Low", variant: "outline" },
  { max: 54, label: "Moderate", variant: "secondary" },
  { max: 69, label: "Elevated", variant: "default" },
  { max: 100, label: "Critical", variant: "destructive" },
]

export const SCORE_TIERS = [
  { max: 3, label: "Low", variant: "outline" },
  { max: 6, label: "Moderate", variant: "secondary" },
  { max: 8, label: "Elevated", variant: "default" },
  { max: 10, label: "Critical", variant: "destructive" },
]

export function getIndexTier(index) {
  return INDEX_TIERS.find((tier) => index <= tier.max) ?? INDEX_TIERS[INDEX_TIERS.length - 1]
}

export function getScoreTier(score) {
  return SCORE_TIERS.find((tier) => score <= tier.max) ?? SCORE_TIERS[SCORE_TIERS.length - 1]
}

export const STATUS_BADGE = {
  Active: "secondary",
  "Under Review": "default",
  Suspended: "destructive",
}

export const TIER_VARIANT = {
  Low: "outline",
  Moderate: "secondary",
  Elevated: "default",
  Critical: "destructive",
}

export const TIER_CHART_FILL = {
  Low: "var(--severity-low)",
  Moderate: "var(--severity-moderate)",
  Elevated: "var(--severity-elevated)",
  Critical: "var(--severity-critical)",
}
