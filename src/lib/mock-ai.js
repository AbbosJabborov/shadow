// Simulated AI analysis. No real model runs here — this produces a
// plausible-looking result so the UI/UX can be wired up ahead of the
// real scoring API being connected.

const REASON_POOL = [
  {
    id: "cash-ratio",
    title: "High cash-transaction ratio",
    description:
      "A large share of recorded transactions were settled in cash rather than through bank channels, above the sector average for this region.",
  },
  {
    id: "revenue-tax-gap",
    title: "Revenue-to-tax ratio below median",
    description:
      "Declared tax paid relative to reported revenue is lower than similar businesses in the same sector and region.",
  },
  {
    id: "wage-gap",
    title: "Wage bill below sector minimum",
    description:
      "Average declared salary per employee falls below the regional sector average, consistent with possible unreported compensation.",
  },
  {
    id: "utility-mismatch",
    title: "Utility consumption inconsistent with output",
    description:
      "Electricity and water usage patterns do not fully align with the production volume declared in recent filings.",
  },
  {
    id: "related-party",
    title: "Frequent related-party transactions",
    description:
      "A notable share of transactions involve other entities that share founders or a registered address with this business.",
  },
  {
    id: "address-changes",
    title: "Multiple legal address changes",
    description:
      "The business has changed its registered legal address more than once within the past 18 months.",
  },
  {
    id: "import-gap",
    title: "Import volume exceeds retail capacity",
    description:
      "Declared import volumes appear inconsistent with the retail footprint and staff count reported for this business.",
  },
  {
    id: "dormant-links",
    title: "Founder linked to dormant entities",
    description:
      "One or more founders are also listed on other entities with little or no recent reporting activity.",
  },
  {
    id: "late-filings",
    title: "Pattern of delayed filings",
    description:
      "Tax and statistical filings have been submitted late in several of the last eight reporting periods.",
  },
  {
    id: "cash-intensive-sector",
    title: "Cash-intensive sector baseline",
    description:
      "This business operates in a sector with a historically elevated informal-activity baseline in this region.",
  },
  {
    id: "employee-turnover",
    title: "Unusually high declared employee turnover",
    description:
      "Declared headcount fluctuates significantly between quarters without a clear seasonal driver.",
  },
  {
    id: "pos-gap",
    title: "Low point-of-sale terminal usage",
    description:
      "Card-payment terminal activity is disproportionately low relative to declared revenue.",
  },
]

const RISK_RANGES = {
  Low: [1, 4],
  Moderate: [3, 6],
  Elevated: [5, 8],
  Critical: [7, 10],
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pickRandom(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function runAIAnalysis(business) {
  const [min, max] = RISK_RANGES[business.baselineRisk] ?? [1, 10]
  const score = clamp(Math.round(min + Math.random() * (max - min)), 1, 10)
  const probability = clamp(Math.round(score * 8 + Math.random() * 14), 5, 98)
  const flagged = score >= 6
  const reasonCount = !flagged ? 0 : score >= 9 ? 4 : 3
  const reasons = pickRandom(REASON_POOL, reasonCount)

  return {
    score,
    probability,
    flagged,
    reasons,
    generatedAt: new Date().toISOString(),
  }
}
