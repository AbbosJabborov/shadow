// Backward-compatible interface delegating to the Weight-of-Evidence scorecard
import { computeShadowScore } from "./shadow-score"

export function runAIAnalysis(business) {
  return computeShadowScore(business)
}
