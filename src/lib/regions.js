// Mock data — illustrative only, not a real economic assessment of these regions.
export const REGIONS = [
  { id: "tashkent-city", name: "Tashkent City", code: "TSH-C", shadowIndex: 31, delta: -1.4 },
  { id: "tashkent-region", name: "Tashkent Region", code: "TSH", shadowIndex: 46, delta: 0.6 },
  { id: "andijan", name: "Andijan Region", code: "AND", shadowIndex: 57, delta: 1.3 },
  { id: "bukhara", name: "Bukhara Region", code: "BUX", shadowIndex: 43, delta: -0.5 },
  { id: "fergana", name: "Fergana Region", code: "FAR", shadowIndex: 60, delta: 1.8 },
  { id: "jizzakh", name: "Jizzakh Region", code: "JIZ", shadowIndex: 51, delta: 0.2 },
  { id: "namangan", name: "Namangan Region", code: "NAM", shadowIndex: 56, delta: 1.0 },
  { id: "navoiy", name: "Navoiy Region", code: "NAV", shadowIndex: 38, delta: -1.1 },
  { id: "qashqadaryo", name: "Qashqadaryo Region", code: "QAS", shadowIndex: 65, delta: 2.4 },
  { id: "samarqand", name: "Samarqand Region", code: "SAM", shadowIndex: 54, delta: 0.3 },
  { id: "sirdaryo", name: "Sirdaryo Region", code: "SIR", shadowIndex: 48, delta: -0.3 },
  { id: "surxondaryo", name: "Surxondaryo Region", code: "SUR", shadowIndex: 71, delta: 3.2 },
  { id: "xorazm", name: "Xorazm Region", code: "XOR", shadowIndex: 52, delta: 0.5 },
  { id: "qoraqalpogiston", name: "Republic of Karakalpakstan", code: "QQR", shadowIndex: 62, delta: 1.6 },
]

export function getRegion(id) {
  return REGIONS.find((region) => region.id === id)
}

export function getNationalIndex() {
  const total = REGIONS.reduce((sum, region) => sum + region.shadowIndex, 0)
  return Math.round((total / REGIONS.length) * 10) / 10
}
