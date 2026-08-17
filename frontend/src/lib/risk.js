// Risk tiering shared by region-level index (0-100) and AI business scores (1-10).
// Modern, harmonious color system with Light Mint Green, Light Sky Blue, Amber, and Coral/Rose.

export const INDEX_TIERS = [
  { max: 39, label: "Low", variant: "outline", colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { max: 54, label: "Moderate", variant: "secondary", colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  { max: 69, label: "Elevated", variant: "default", colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { max: 100, label: "Critical", variant: "destructive", colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
]

export const SCORE_TIERS = [
  { max: 3, label: "Low", variant: "outline", colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { max: 6, label: "Moderate", variant: "secondary", colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  { max: 8, label: "Elevated", variant: "default", colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { max: 10, label: "Critical", variant: "destructive", colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" },
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
  Low: "#10b981",       // Light Mint / Emerald Green
  Moderate: "#0ea5e9",  // Light Sky / Cyan Blue
  Elevated: "#f59e0b",  // Amber
  Critical: "#f43f5e",  // Rose / Coral
}
