// Deterministic & Explainable Econometric Screening Engine
// Combines micro enterprise indicators with regional baseline metrics.

const SECTOR_BENCHMARKS = {
  "Wholesale & Retail Trade": { revPerEmp: 120_000_000, cashWeight: 0.8 },
  "Transportation & Logistics": { revPerEmp: 90_000_000, cashWeight: 0.65 },
  "Construction & Real Estate": { revPerEmp: 150_000_000, cashWeight: 0.75 },
  "Agriculture & Food Processing": { revPerEmp: 60_000_000, cashWeight: 0.6 },
  "Light Industry & Textiles": { revPerEmp: 75_000_000, cashWeight: 0.55 },
  "Information Technology": { revPerEmp: 200_000_000, cashWeight: 0.15 },
  "Hospitality & Food Services": { revPerEmp: 45_000_000, cashWeight: 0.85 },
  "Healthcare & Pharmaceuticals": { revPerEmp: 110_000_000, cashWeight: 0.3 },
  "Professional Services & Consulting": { revPerEmp: 130_000_000, cashWeight: 0.25 },
  "Manufacturing & Heavy Industry": { revPerEmp: 180_000_000, cashWeight: 0.4 },
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function runAIAnalysis(business) {
  const sectorData = SECTOR_BENCHMARKS[business.sector] || { revPerEmp: 90_000_000, cashWeight: 0.5 }
  const revPerEmp = (business.revenue || 0) / Math.max(1, business.employees || 1)
  
  const reasons = []
  let riskScorePoints = 0

  // 1. Baseline Risk tier initial weight
  const baselineWeights = { Low: 2, Moderate: 5, Elevated: 7, Critical: 9 }
  riskScorePoints += baselineWeights[business.baselineRisk] || 4

  // 2. Revenue-to-employee ratio discrepancy
  if (revPerEmp < sectorData.revPerEmp * 0.6) {
    riskScorePoints += 1.5
    reasons.push({
      id: "revenue-tax-gap",
      title: "Revenue per employee below sector norm",
      description: `Declared revenue per employee (${Math.round(revPerEmp / 1_000_000)}M UZS) is significantly below the expected sector median (${Math.round(sectorData.revPerEmp / 1_000_000)}M UZS), indicating potential off-the-books revenue.`
    })
  }

  // 3. Sector cash-intensity factor
  if (sectorData.cashWeight >= 0.7) {
    riskScorePoints += 0.8
    reasons.push({
      id: "cash-intensive-sector",
      title: "Cash-intensive retail & trade sector",
      description: "Operates in a high cash-velocity sector with elevated regional informality risk."
    })
  }

  // 4. Registration Age Risk (newer businesses have less audit history)
  const regYear = parseInt((business.registered || "2020").split("-")[0], 10)
  if (regYear >= 2023) {
    riskScorePoints += 0.5
    reasons.push({
      id: "recent-registration",
      title: "Short filing history (<24 months)",
      description: "Limited longitudinal tax filing record; operational baseline still stabilizing."
    })
  }

  // 5. Headcount / scale anomaly
  if (business.employees > 60 && revPerEmp < sectorData.revPerEmp * 0.75) {
    riskScorePoints += 0.8
    reasons.push({
      id: "wage-gap",
      title: "Wage bill & payroll strain indicator",
      description: "Large workforce with suppressed declared gross output suggests possible envelope wage agreements."
    })
  }

  // Deterministic micro-jitter (+/- 0.3) based on company name/ID
  const nameHash = hashString(business.name || "")
  const jitter = ((nameHash % 100) / 100 - 0.5) * 0.6

  const finalScore = Math.min(10, Math.max(1, Math.round(riskScorePoints + jitter)))
  const probability = Math.min(96, Math.max(8, Math.round(finalScore * 9.4 + ((nameHash % 20) - 10) * 0.3)))
  const flagged = finalScore >= 6

  return {
    score: finalScore,
    probability,
    flagged,
    reasons: flagged ? reasons : [],
    generatedAt: new Date().toISOString(),
  }
}
