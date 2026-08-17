// Mock data — national baseline shadow economy propensity per industry.
// Illustrative only, blended with a region's index to estimate a
// region-specific industry index (see getRegionIndustryIndex below).
export const INDUSTRIES = [
  { id: "wholesale-retail-trade", code: "TRADE", name: "Wholesale & Retail Trade", nationalIndex: 58 },
  { id: "construction-materials", code: "CONSTR", name: "Construction & Materials", nationalIndex: 61 },
  { id: "textile-apparel", code: "TEXTILE", name: "Textile & Apparel", nationalIndex: 54 },
  { id: "food-processing", code: "FOOD", name: "Food Processing", nationalIndex: 50 },
  { id: "agriculture-fisheries", code: "AGRI", name: "Agriculture & Fisheries", nationalIndex: 66 },
  { id: "mining-metallurgy", code: "MINING", name: "Mining & Metallurgy", nationalIndex: 45 },
  { id: "manufacturing", code: "MFG", name: "Manufacturing", nationalIndex: 48 },
  { id: "logistics-transport", code: "LOGIST", name: "Logistics & Transport", nationalIndex: 63 },
  { id: "technology-ai", code: "TECH", name: "Technology & AI", nationalIndex: 22 },
  { id: "energy-utilities", code: "ENERGY", name: "Energy & Utilities", nationalIndex: 40 },
  { id: "startups-innovation", code: "STARTUP", name: "Startups & Innovation", nationalIndex: 28 },
  { id: "healthcare-pharma", code: "HEALTH", name: "Healthcare & Pharmaceuticals", nationalIndex: 35 },
  { id: "education-training", code: "EDU", name: "Education & Training", nationalIndex: 32 },
  { id: "tourism-hospitality", code: "TOURISM", name: "Tourism & Hospitality", nationalIndex: 55 },
  { id: "financial-services", code: "FINANCE", name: "Financial Services", nationalIndex: 26 },
  { id: "real-estate", code: "REALEST", name: "Real Estate", nationalIndex: 64 },
  { id: "telecommunications", code: "TELECOM", name: "Telecommunications", nationalIndex: 24 },
  { id: "media-entertainment", code: "MEDIA", name: "Media & Entertainment", nationalIndex: 46 },
  { id: "professional-services", code: "PROF", name: "Professional Services", nationalIndex: 33 },
  { id: "automotive-machinery-trade", code: "AUTO", name: "Automotive & Machinery Trade", nationalIndex: 59 },
]

export function getIndustry(id) {
  return INDUSTRIES.find((industry) => industry.id === id)
}

export function getIndustryByName(name) {
  return INDUSTRIES.find((industry) => industry.name === name)
}

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

// Deterministic, illustrative blend of a region's overall index and an
// industry's national baseline — not a real computed statistic. Stable
// across renders since it hashes the region/industry pair instead of
// using randomness.
export function getRegionIndustryIndex(regionId, industryId, regionIndex, industryBaseline) {
  const variance = (hashString(`${regionId}:${industryId}`) % 17) - 8
  const blended = regionIndex * 0.55 + industryBaseline * 0.45 + variance
  return Math.min(100, Math.max(1, Math.round(blended)))
}
