// Weight-of-Evidence (WoE) Scorecard & Decoupled Confidence Engine (Layers B & C)
// Implements the exact formulas from the Shadow Index working paper.

import { evaluateForensicSignals } from "./forensics"

const PRIOR_TABLE = {
  Low: { priorP: 0.04, logit: -3.178 },
  Moderate: { priorP: 0.10, logit: -2.197 },
  Elevated: { priorP: 0.20, logit: -1.386 },
  Critical: { priorP: 0.33, logit: -0.708 },
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function clip(val, min, max) {
  return Math.min(max, Math.max(min, val))
}

export function computeShadowScore(business) {
  const tier = business.baselineRisk || "Moderate"
  const prior = PRIOR_TABLE[tier] || PRIOR_TABLE.Moderate
  const signals = evaluateForensicSignals(business)

  const applicableSignals = signals.filter((s) => s.applicable)
  const flaggedSignals = applicableSignals.filter((s) => s.flagged)

  // 1. Layer B: Weight-of-Evidence Scorecard
  const sumContribution = applicableSignals.reduce((acc, s) => acc + s.contribution, 0)
  const logOdds = prior.logit + sumContribution
  const rawP = sigmoid(logOdds)
  const probabilityClamped = clip(rawP, 0.01, 0.99)
  const score = clip(Math.round(1 + 9 * probabilityClamped), 1, 10)

  // 2. Layer C: Decoupled Confidence Metric
  const coverage = applicableSignals.length / 7.0
  const avgDecisiveness = applicableSignals.length > 0
    ? applicableSignals.reduce((acc, s) => acc + s.decisiveness, 0) / applicableSignals.length
    : 0.5

  const confidence = clip(
    Math.round(100 * (0.30 * coverage + 0.70 * avgDecisiveness)),
    10,
    96
  )

  // Contributing reasons formatted for UI
  const reasons = flaggedSignals.map((s) => ({
    id: s.id,
    title: `${s.name} (${s.formatted})`,
    description: s.flagDescription,
    category: s.category,
    contribution: s.contribution,
    z: s.z,
  }))

  return {
    score,
    probability: Math.round(probabilityClamped * 100),
    confidence,
    flagged: score >= 6 || flaggedSignals.length >= 2,
    priorLogit: prior.logit,
    priorP: Math.round(prior.priorP * 100),
    logOdds: Math.round(logOdds * 1000) / 1000,
    sumContribution: Math.round(sumContribution * 1000) / 1000,
    coveragePercent: Math.round(coverage * 100),
    avgDecisivenessPercent: Math.round(avgDecisiveness * 100),
    signals,
    applicableCount: applicableSignals.length,
    flaggedCount: flaggedSignals.length,
    reasons,
    generatedAt: new Date().toISOString(),
  }
}
