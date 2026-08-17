// Forensic Contradiction Rules (Layer A)
// Tests same-firm filings and telemetry against independent physical & fiscal records.

const TRADE_EXPOSED_SECTORS = new Set([
  "Wholesale & Retail Trade",
  "Transportation & Logistics",
  "Manufacturing & Heavy Industry",
  "Construction & Real Estate",
  "Light Industry & Textiles",
  "Agriculture & Food Processing",
  "Healthcare & Pharmaceuticals",
])

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export const FORENSIC_DEFINITIONS = [
  {
    id: "pos-vs-revenue",
    name: "POS & Terminal Receipts vs. Declared Revenue",
    category: "Fiscal Settlement",
    threshold: 1.40,
    scale: 0.40,
    weight: 1.1,
    unit: "ratio",
    flagDescription: "Fiscal card/terminal turnover substantially exceeds declared gross revenue in official tax filings.",
    cleanDescription: "Terminal settlement reconciles within normal bounds of declared income.",
    isApplicable: () => true,
  },
  {
    id: "vat-invoice-chain",
    name: "VAT E-Invoice Reconciliation Gap",
    category: "Electronic Invoicing (EHF)",
    threshold: 0.15,
    scale: 0.15,
    weight: 0.9,
    unit: "% gap",
    flagDescription: "Discrepancy detected between declared sales invoices and buyer counterparty claim filings.",
    cleanDescription: "Symmetric e-invoice matching confirmed across supply chain counterparties.",
    isApplicable: () => true,
  },
  {
    id: "customs-vs-cogs",
    name: "Customs Declared Import Value vs. COGS",
    category: "Import Valuation",
    threshold: 0.20,
    scale: 0.20,
    weight: 0.8,
    unit: "% gap",
    flagDescription: "Declared cost of goods sold is incongruent with border customs valuation records.",
    cleanDescription: "Customs clearance import invoices reconcile against inventory COGS.",
    isApplicable: (business) => TRADE_EXPOSED_SECTORS.has(business.sector),
  },
  {
    id: "mirror-trade",
    name: "UN Comtrade Partner Country Mirror Gap",
    category: "Cross-Border Trade",
    threshold: 0.20,
    scale: 0.20,
    weight: 0.7,
    unit: "% gap",
    flagDescription: "Declared bilateral import values diverge significantly from partner country export registry.",
    cleanDescription: "Bilateral trade records align with destination customs manifests.",
    isApplicable: (business) => TRADE_EXPOSED_SECTORS.has(business.sector),
  },
  {
    id: "wage-bunching",
    name: "Minimum Wage Bunching Distribution",
    category: "Payroll & Social Security",
    threshold: 0.30,
    scale: 0.20,
    weight: 0.5,
    unit: "% of staff",
    flagDescription: "Abnormal concentration of staff registered exactly at statutory minimum wage (1.05M UZS/mo), suggesting envelope compensation.",
    cleanDescription: "Payroll distribution reflects expected organic wage variance.",
    isApplicable: () => true,
  },
  {
    id: "night-day-electricity",
    name: "Off-Hours Industrial Power Draw (ASKUE Telemetry)",
    category: "Physical Telemetry",
    threshold: 0.55,
    scale: 0.20,
    weight: 0.5,
    unit: "night/day ratio",
    flagDescription: "Elevated night-shift kilowatt-hour consumption inconsistent with declared single-shift workforce.",
    cleanDescription: "Power draw footprint matches declared operational schedule.",
    isApplicable: () => true,
  },
  {
    id: "persistent-losses",
    name: "Persistent Operating Losses with Active Status",
    category: "Solvency & Operations",
    threshold: 3,
    scale: 2,
    weight: 0.4,
    unit: "years",
    flagDescription: "Entity reports consecutive loss-making fiscal years while maintaining active expansion and hiring.",
    cleanDescription: "Financial performance demonstrates sustainable operating margins.",
    isApplicable: (business) => (business.status || "").toLowerCase() === "active",
  },
]

export function evaluateForensicSignals(business) {
  const hash = hashString(business.id || business.name || "")
  const tier = business.baselineRisk || "Moderate"

  // Base raw generator deterministically calibrated to company profile
  return FORENSIC_DEFINITIONS.map((def, idx) => {
    const applicable = def.isApplicable(business)
    if (!applicable) {
      return {
        ...def,
        applicable: false,
        raw: null,
        formatted: "N/A (Sector Exempt)",
        flagged: false,
        excess: 0,
        z: 0,
        contribution: 0,
        decisiveness: 0,
      }
    }

    // Deterministic parameter derivation
    const seed = (hash + idx * 7919) % 1000 / 1000
    let raw = 0

    if (def.id === "pos-vs-revenue") {
      const base = tier === "Critical" ? 2.4 : tier === "Elevated" ? 1.6 : tier === "Moderate" ? 1.1 : 0.8
      raw = Math.round((base + seed * 0.9) * 100) / 100
    } else if (def.id === "vat-invoice-chain") {
      const base = tier === "Critical" ? 0.35 : tier === "Elevated" ? 0.20 : tier === "Moderate" ? 0.08 : 0.03
      raw = Math.round((base + seed * 0.18) * 100) / 100
    } else if (def.id === "customs-vs-cogs") {
      const base = tier === "Critical" ? 0.40 : tier === "Elevated" ? 0.24 : tier === "Moderate" ? 0.10 : 0.04
      raw = Math.round((base + seed * 0.15) * 100) / 100
    } else if (def.id === "mirror-trade") {
      const base = tier === "Critical" ? 0.38 : tier === "Elevated" ? 0.22 : tier === "Moderate" ? 0.09 : 0.02
      raw = Math.round((base + seed * 0.14) * 100) / 100
    } else if (def.id === "wage-bunching") {
      const base = tier === "Critical" ? 0.55 : tier === "Elevated" ? 0.36 : tier === "Moderate" ? 0.18 : 0.08
      raw = Math.round((base + seed * 0.25) * 100) / 100
    } else if (def.id === "night-day-electricity") {
      const base = tier === "Critical" ? 0.72 : tier === "Elevated" ? 0.58 : tier === "Moderate" ? 0.42 : 0.25
      raw = Math.round((base + seed * 0.20) * 100) / 100
    } else if (def.id === "persistent-losses") {
      const baseYears = tier === "Critical" ? 4 : tier === "Elevated" ? 3 : tier === "Moderate" ? 1 : 0
      raw = Math.max(0, baseYears + (seed > 0.65 ? 1 : 0))
    }

    const flagged = raw > def.threshold
    const excess = Math.max(0, raw - def.threshold)
    const z = Math.min(3, Math.max(0, excess / def.scale))
    const contribution = Math.round(def.weight * z * 1000) / 1000

    const distance = Math.abs(raw - def.threshold) / def.scale
    const decisiveness = Math.round((1 - Math.exp(-distance)) * 1000) / 1000

    let formatted = `${raw}`
    if (def.unit === "ratio" || def.unit.includes("ratio")) formatted = `${raw.toFixed(2)}×`
    else if (def.unit.startsWith("%")) formatted = `${(raw * 100).toFixed(1)}%`
    else if (def.unit === "years") formatted = `${raw} yrs`

    return {
      ...def,
      applicable: true,
      raw,
      formatted,
      flagged,
      excess,
      z,
      contribution,
      decisiveness,
    }
  })
}
