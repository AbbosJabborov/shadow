import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
} from "recharts"
import {
  Scale,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  BookOpen,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FORENSIC_DEFINITIONS } from "@/lib/forensics"
import { REGIONS } from "@/lib/regions"

// Prior logit constants
const PRIOR_TABLE = {
  Low: { priorP: 0.04, logit: -3.178 },
  Moderate: { priorP: 0.10, logit: -2.197 },
  Elevated: { priorP: 0.20, logit: -1.386 },
  Critical: { priorP: 0.33, logit: -0.708 },
}

// Preset businesses from working paper
const PRESETS = {
  toshkent: {
    name: "Toshkent Metall Profil",
    tag: "All 7 checks clean",
    tier: "Moderate",
    values: {
      "pos-vs-revenue": 0.85,
      "vat-invoice-chain": 0.04,
      "customs-vs-cogs": 0.05,
      "mirror-trade": 0.03,
      "wage-bunching": 0.12,
      "night-day-electricity": 0.32,
      "persistent-losses": 0,
    },
  },
  andijon: {
    name: "Andijon Mashinasozlik Zavodi",
    tag: "Flagged, but marginally",
    tier: "Elevated",
    values: {
      "pos-vs-revenue": 1.25,
      "vat-invoice-chain": 0.12,
      "customs-vs-cogs": 0.203,
      "mirror-trade": 0.18,
      "wage-bunching": 0.309,
      "night-day-electricity": 0.52,
      "persistent-losses": 2,
    },
  },
  termiz: {
    name: "Termiz Chegara Logistika",
    tag: "All 7 checks decisively flagged",
    tier: "Critical",
    values: {
      "pos-vs-revenue": 3.31,
      "vat-invoice-chain": 0.55,
      "customs-vs-cogs": 0.49,
      "mirror-trade": 0.451,
      "wage-bunching": 0.758,
      "night-day-electricity": 0.91,
      "persistent-losses": 6,
    },
  },
}

export default function MethodologyPage() {
  const [selectedLayer, setSelectedLayer] = useState("b")
  const [simulatorTier, setSimulatorTier] = useState("Critical")
  const [signalValues, setSignalValues] = useState(PRESETS.termiz.values)
  const [conflationComparisonMode, setConflationComparisonMode] = useState("decoupled") // "conflated" vs "decoupled"

  // Live calculation for the Simulator
  const simCalculation = useMemo(() => {
    const prior = PRIOR_TABLE[simulatorTier] || PRIOR_TABLE.Moderate
    let sumContribution = 0
    let totalDecisiveness = 0

    const computedSignals = FORENSIC_DEFINITIONS.map((def) => {
      const raw = signalValues[def.id] ?? def.threshold
      const excess = Math.max(0, raw - def.threshold)
      const z = Math.min(3, Math.max(0, excess / def.scale))
      const contribution = def.weight * z
      sumContribution += contribution

      const distance = Math.abs(raw - def.threshold) / def.scale
      const decisiveness = 1 - Math.exp(-distance)
      totalDecisiveness += decisiveness

      return {
        id: def.id,
        name: def.name.split(" vs.")[0].split(" (")[0],
        raw,
        threshold: def.threshold,
        scale: def.scale,
        weight: def.weight,
        unit: def.unit,
        flagged: raw > def.threshold,
        z: Number(z.toFixed(2)),
        contribution: Number(contribution.toFixed(3)),
        decisiveness: Number(decisiveness.toFixed(3)),
      }
    })

    const logOdds = prior.logit + sumContribution
    const rawP = 1 / (1 + Math.exp(-logOdds))
    const pClamped = Math.min(0.99, Math.max(0.01, rawP))
    const score = Math.min(10, Math.max(1, Math.round(1 + 9 * pClamped)))

    const coverage = 1.0 // 7 of 7 in simulator
    const avgDecisiveness = totalDecisiveness / 7
    const confidence = Math.min(96, Math.max(10, Math.round(100 * (0.3 * coverage + 0.7 * avgDecisiveness))))

    return {
      prior,
      computedSignals,
      sumContribution: Number(sumContribution.toFixed(3)),
      logOdds: Number(logOdds.toFixed(3)),
      probability: Math.round(pClamped * 100),
      score,
      confidence,
      avgDecisiveness: Math.round(avgDecisiveness * 100),
    }
  }, [simulatorTier, signalValues])

  // Chart Data 1: Waterfall / Signal Contribution
  const waterfallData = useMemo(() => {
    return [
      { name: "Prior Logit", value: simCalculation.prior.logit, fill: "var(--muted-foreground)" },
      ...simCalculation.computedSignals.map((s) => ({
        name: s.name.length > 14 ? `${s.name.slice(0, 12)}..` : s.name,
        value: s.contribution,
        fill: s.contribution > 0 ? "var(--destructive)" : "var(--primary)",
      })),
      { name: "Total Log-Odds", value: simCalculation.logOdds, fill: "var(--primary)" },
    ]
  }, [simCalculation])

  // Chart Data 2: Sigmoid Curve with dynamic point
  const sigmoidCurveData = useMemo(() => {
    const pts = []
    for (let x = -5; x <= 6; x += 0.4) {
      const p = 1 / (1 + Math.exp(-x))
      pts.push({
        x: Number(x.toFixed(1)),
        p: Math.round(p * 100),
        active: Math.abs(x - simCalculation.logOdds) < 0.3,
      })
    }
    return pts
  }, [simCalculation.logOdds])

  // Chart Data 3: Comparison of Conflated vs Decoupled
  const comparisonData = [
    {
      name: "Toshkent (Clean)",
      prob: 10,
      oldConf: 10, // Conflated with probability
      newConf: 59, // Decoupled
    },
    {
      name: "Andijon (Marginal 9/10)",
      prob: 84,
      oldConf: 84, // Conflated
      newConf: 54, // Lower due to borderline decisiveness
    },
    {
      name: "Termiz (Critical 10/10)",
      prob: 99,
      oldConf: 99, // Conflated
      newConf: 89, // Decisive
    },
  ]

  // Chart Data 4: Decisiveness Function 1 - e^-x
  const decisivenessCurveData = useMemo(() => {
    const pts = []
    for (let d = 0; d <= 4; d += 0.2) {
      pts.push({
        distance: Number(d.toFixed(1)),
        decisiveness: Math.round((1 - Math.exp(-d)) * 100),
      })
    }
    return pts
  }, [])

  // Chart Data 5: Prior Logits Bar
  const priorTierData = [
    { tier: "Low", p: 4, logit: -3.178 },
    { tier: "Moderate", p: 10, logit: -2.197 },
    { tier: "Elevated", p: 20, logit: -1.386 },
    { tier: "Critical", p: 33, logit: -0.708 },
  ]

  // Chart Data 6: 2D Decoupled Phase Plane
  const phasePlanePoints = [
    { name: "Clean Case", prob: 8, conf: 86, type: "clean" },
    { name: "Slight Noise", prob: 18, conf: 65, type: "clean" },
    { name: "Borderline Case", prob: 78, conf: 52, type: "marginal" },
    { name: "Ambiguous Watch", prob: 50, conf: 38, type: "marginal" },
    { name: "Flagged High", prob: 92, conf: 84, type: "critical" },
    { name: "Critical Extremity", prob: 99, conf: 92, type: "critical" },
  ]

  const loadPreset = (key) => {
    const p = PRESETS[key]
    if (!p) return
    setSimulatorTier(p.tier)
    setSignalValues(p.values)
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20 pt-2 font-sans">
      {/* Article Header / Masthead */}
      <div className="border-b pb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
            <BookOpen className="size-3.5 text-primary" />
            Working Paper &bull; Technical Specification v3
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            Traced Line-by-Line to Running Engine
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          A Deterministic Weight-of-Evidence Framework for Firm-Level Shadow Economy Risk, with Confidence Decoupled from Direction
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed italic max-w-4xl">
          How the scorecard, the confidence metric, and the LLM narrative layer actually work — featuring 6 interactive econometric diagrams and a real-time live scorecard simulator.
        </p>

        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-muted-foreground border-t">
          <span><strong>System:</strong> Shadow Index</span>
          <span><strong>Scorecard:</strong> Live Deterministic</span>
          <span><strong>Calibration:</strong> OECD Pre-Fit Defaults</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="p-4 sm:p-5 rounded-lg border bg-muted/30 border-l-4 border-l-primary flex flex-col gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Abstract</span>
        <p className="text-sm leading-relaxed text-foreground/90">
          We describe a multi-tier system for flagging firm-level involvement in Uzbekistan&apos;s shadow economy: a deterministic <strong>weight-of-evidence (WoE) scorecard</strong> that converts seven firm-level forensic contradiction checks into a probability, a risk score, and a <strong>confidence</strong> figure computed independently of the probability&apos;s direction; and a downstream LLM layer that turns the scorecard&apos;s output into an audit narrative without touching the arithmetic.
        </p>
      </div>

      {/* SECTION 1: The Problem with One Number */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§1</span>
          <h2 className="text-xl font-bold tracking-tight">The Problem with One Number</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every firm-level risk system must answer two separate questions: <em>how likely is this firm involved in the shadow economy</em>, and <em>how sure are we</em>? Conflating both into a single number creates severe failure modes. A clean firm with 7 compliant checks would report low probability alongside low &ldquo;confidence&rdquo; — as if having complete evidence that a firm is compliant made the system uncertain.
        </p>

        {/* GRAPH 1: Conflation Failure vs Decoupled Solution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">Graph 1 &bull; Old Conflated Metric vs. Decoupled Confidence</CardTitle>
                <CardDescription>Toggle between the old conflation flaw and the decoupled solution across 3 cases</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-muted p-1 rounded-md border text-xs">
                <button
                  onClick={() => setConflationComparisonMode("conflated")}
                  className={`px-2.5 py-1 rounded transition-colors ${conflationComparisonMode === "conflated" ? "bg-background font-bold shadow-sm" : "text-muted-foreground"}`}
                >
                  Old (Conflated)
                </button>
                <button
                  onClick={() => setConflationComparisonMode("decoupled")}
                  className={`px-2.5 py-1 rounded transition-colors ${conflationComparisonMode === "decoupled" ? "bg-background font-bold text-primary shadow-sm" : "text-muted-foreground"}`}
                >
                  New (Decoupled)
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                    formatter={(val, name) => [`${val}%`, name]}
                  />
                  <Bar dataKey="prob" name="Risk Probability (P)" fill="var(--muted-foreground)" opacity={0.6} radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey={conflationComparisonMode === "conflated" ? "oldConf" : "newConf"}
                    name={conflationComparisonMode === "conflated" ? "Old Flawed Confidence" : "Decoupled Confidence"}
                    fill={conflationComparisonMode === "conflated" ? "var(--destructive)" : "var(--primary)"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic text-center">
              {conflationComparisonMode === "conflated"
                ? "Flaw: Clean firm (Toshkent) shows only 10% confidence, while unstable borderline 9/10 shows 84% confidence."
                : "Fixed: Clean and Critical firms both earn ~60-90% high confidence because evidence is unambiguous; borderline firm drops to 54%."}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 2: System Architecture & Interactive Flow */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§2</span>
          <h2 className="text-xl font-bold tracking-tight">System Architecture (Five-Layer Pipeline)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Four layers execute deterministic mathematics; the fifth is a schema-constrained Google Gemini LLM synthesis strictly forbidden from altering numeric calculations.
        </p>

        {/* GRAPH 2: Interactive Clickable Pipeline Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            onClick={() => setSelectedLayer("a")}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLayer === "a" ? "border-primary bg-primary/10 shadow-sm" : "bg-card hover:bg-muted/50"}`}
          >
            <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer A</span>
            <h4 className="text-xs font-bold mt-0.5">Forensics Rules</h4>
            <span className="text-[11px] text-muted-foreground">7 consistency checks</span>
          </div>

          <div
            onClick={() => setSelectedLayer("b")}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLayer === "b" ? "border-primary bg-primary/10 shadow-sm" : "bg-card hover:bg-muted/50"}`}
          >
            <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer B & C</span>
            <h4 className="text-xs font-bold mt-0.5">WoE Scorecard</h4>
            <span className="text-[11px] text-muted-foreground">Logit + Decoupled Conf</span>
          </div>

          <div
            onClick={() => setSelectedLayer("d")}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLayer === "d" ? "border-primary bg-primary/10 shadow-sm" : "bg-card hover:bg-muted/50"}`}
          >
            <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer D</span>
            <h4 className="text-xs font-bold mt-0.5">Regional MIMIC</h4>
            <span className="text-[11px] text-muted-foreground">11 Causes + 6 Indicators</span>
          </div>

          <div
            onClick={() => setSelectedLayer("e")}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLayer === "e" ? "border-primary bg-primary/10 shadow-sm" : "bg-card hover:bg-muted/50"}`}
          >
            <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer E</span>
            <h4 className="text-xs font-bold mt-0.5">LLM Narrative</h4>
            <span className="text-[11px] text-muted-foreground">Gemini JSON Synthesis</span>
          </div>
        </div>

        <div className="p-4 rounded-md border bg-card text-xs leading-relaxed">
          {selectedLayer === "a" && (
            <p><strong>Layer A (forensics.js):</strong> Tests same-firm arithmetic facts across electronic VAT invoices, POS card turnover, payroll wage bunching, electricity telemetry, and customs declarations. Never compares against peer averages.</p>
          )}
          {selectedLayer === "b" && (
            <p><strong>Layer B & C (shadow-score.js):</strong> Single pass over the 7 signals. Computes <code>logit(prior) + &Sigma; w&middot;z</code> for probability, and <code>coverage &times; decisiveness</code> for independent confidence.</p>
          )}
          {selectedLayer === "d" && (
            <p><strong>Layer D (mimic_data.py):</strong> Regional macro context for Uzbekistan&apos;s 14 regions. Instructed by prompt never to treat macro variables alone as evidence against an individual firm.</p>
          )}
          {selectedLayer === "e" && (
            <p><strong>Layer E (gemini.py):</strong> Constrained Gemini 2.5 Flash call producing narrative synthesis into PostgreSQL and client-side PDF export.</p>
          )}
        </div>
      </section>

      {/* SECTION 3 & 4: Scorecard Formulation & Table of 7 Signals */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§3–4</span>
          <h2 className="text-xl font-bold tracking-tight">Forensic Contradiction Signals & WoE Formulation</h2>
        </div>

        {/* Table 1: Exact Parameters */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left font-mono text-muted-foreground">
                <th className="p-2.5">Signal</th>
                <th className="p-2.5">Tests</th>
                <th className="p-2.5 font-bold">Threshold</th>
                <th className="p-2.5">Scale</th>
                <th className="p-2.5 font-bold">Weight (w)</th>
                <th className="p-2.5">Gating</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {FORENSIC_DEFINITIONS.map((s) => (
                <tr key={s.id} className="hover:bg-muted/10">
                  <td className="p-2.5 font-medium">{s.name}</td>
                  <td className="p-2.5 text-muted-foreground">{s.category}</td>
                  <td className="p-2.5 font-mono font-bold text-primary">
                    {s.unit === "ratio" ? `${s.threshold}×` : s.unit.startsWith("%") ? `${s.threshold * 100}%` : `${s.threshold} yrs`}
                  </td>
                  <td className="p-2.5 font-mono">{s.scale}</td>
                  <td className="p-2.5 font-mono font-bold">{s.weight}</td>
                  <td className="p-2.5">
                    <Badge variant="outline" className="text-[10px]">
                      {s.id.includes("customs") || s.id.includes("mirror") ? "Trade Sectors" : "All Sectors"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 5: LIVE SCORECARD SIMULATOR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-lg text-primary">§5</span>
            <h2 className="text-xl font-bold tracking-tight">Interactive Live Scorecard Simulator</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("toshkent")}>Toshkent (Clean)</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("andijon")}>Andijon (Marginal)</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("termiz")}>Termiz (Critical)</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Sliders */}
          <div className="lg:col-span-7 flex flex-col gap-4 border p-4 rounded-lg bg-card">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Layer A: Raw Signal Telemetry</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Prior Tier:</span>
                <select
                  value={simulatorTier}
                  onChange={(e) => setSimulatorTier(e.target.value)}
                  className="text-xs bg-background border rounded px-2 py-1 font-mono"
                >
                  <option value="Low">Low (P=4%)</option>
                  <option value="Moderate">Moderate (P=10%)</option>
                  <option value="Elevated">Elevated (P=20%)</option>
                  <option value="Critical">Critical (P=33%)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {FORENSIC_DEFINITIONS.map((def) => {
                const val = signalValues[def.id] ?? def.threshold
                const isFlagged = val > def.threshold
                const maxVal = def.unit === "years" ? 8 : def.unit === "ratio" ? 4.0 : 1.0
                const step = def.unit === "years" ? 1 : 0.01

                return (
                  <div key={def.id} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{def.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">
                          {def.unit === "ratio" ? `${val.toFixed(2)}×` : def.unit.startsWith("%") ? `${(val * 100).toFixed(1)}%` : `${val} yrs`}
                        </span>
                        <Badge variant={isFlagged ? "destructive" : "secondary"} className="text-[10px] h-4 py-0">
                          {isFlagged ? "Flagged" : "Clean"}
                        </Badge>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxVal}
                      step={step}
                      value={val}
                      onChange={(e) =>
                        setSignalValues({
                          ...signalValues,
                          [def.id]: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Live Computation Outputs */}
          <div className="lg:col-span-5 flex flex-col gap-4 border p-4 rounded-lg bg-primary/5 border-primary/20">
            <span className="text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
              Live Layer B & C Calculation Output
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-card rounded-md border flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground font-semibold">Shadow Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-primary">{simCalculation.score}</span>
                  <span className="text-xs text-muted-foreground">/ 10</span>
                </div>
              </div>

              <div className="p-3 bg-card rounded-md border flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground font-semibold">Probability (P)</span>
                <span className="text-3xl font-black font-mono">{simCalculation.probability}%</span>
              </div>
            </div>

            <div className="p-3 bg-card rounded-md border flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-primary">Decoupled Confidence</span>
                <span className="font-mono font-bold text-base">{simCalculation.confidence}%</span>
              </div>
              <Progress value={simCalculation.confidence} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Coverage: 100% (7/7)</span>
                <span>Avg Decisiveness: {simCalculation.avgDecisiveness}%</span>
              </div>
            </div>

            <div className="p-3 bg-card rounded-md border font-mono text-[11px] flex flex-col gap-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Prior logit ({simulatorTier}):</span>
                <span className="text-foreground">{simCalculation.prior.logit}</span>
              </div>
              <div className="flex justify-between">
                <span>&Sigma; (weight &times; z):</span>
                <span className="text-foreground">+{simCalculation.sumContribution}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold text-foreground">
                <span>Total Log-Odds:</span>
                <span className="text-primary">{simCalculation.logOdds}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Econometric Graphs Grid (Waterfall + Sigmoid + Decisiveness + 2D Phase Plane) */}
      <section className="flex flex-col gap-6">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§6</span>
          <h2 className="text-xl font-bold tracking-tight">Mathematical Visualization Suite</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GRAPH 3: Waterfall Contribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 2 &bull; Log-Odds Evidentiary Waterfall</CardTitle>
              <CardDescription className="text-xs">
                Shows exact log-odds added by each signal to the prior logit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                      formatter={(val) => [val, "Log-Odds contribution"]}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRAPH 4: Sigmoid Link Function with Operating Point */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 3 &bull; Sigmoid Link & Operating Point</CardTitle>
              <CardDescription className="text-xs">
                Live operating point (&eta; = {simCalculation.logOdds}) mapped to probability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sigmoidCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="x" tick={{ fontSize: 10 }} label={{ value: "Log-Odds (&eta;)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                      formatter={(val) => [`${val}%`, "Probability (P)"]}
                    />
                    <ReferenceLine x={simCalculation.logOdds} stroke="var(--destructive)" strokeDasharray="3 3" label={{ value: "Current", fontSize: 10, fill: "var(--destructive)" }} />
                    <Line type="monotone" dataKey="p" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRAPH 5: Decisiveness Saturation Function */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 4 &bull; Decisiveness Saturation Function</CardTitle>
              <CardDescription className="text-xs">
                Formula: d_i = 1 &minus; e^(&minus;distance) ensuring robust evidentiary saturation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decisivenessCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="distance" tick={{ fontSize: 10 }} label={{ value: "Standardized Distance (|raw-th|/scale)", position: "insideBottom", offset: -5, fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                      formatter={(val) => [`${val}%`, "Decisiveness"]}
                    />
                    <Line type="monotone" dataKey="decisiveness" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRAPH 6: 2D Decoupled Phase Plane */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 5 &bull; 2D Phase Plane (Confidence vs. Probability)</CardTitle>
              <CardDescription className="text-xs">
                Proves orthogonal geometry: high confidence at both extremes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" dataKey="prob" name="Probability" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="conf" name="Confidence" unit="%" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <ZAxis range={[60, 140]} />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || !payload[0]) return null
                        const d = payload[0].payload
                        return (
                          <div className="p-2 bg-popover border rounded text-xs shadow">
                            <span className="font-bold">{d.name}</span>
                            <div className="font-mono">P: {d.prob}% | Conf: {d.conf}%</div>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={phasePlanePoints} fill="var(--primary)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* References & Citation */}
      <div className="border-t pt-6 text-xs text-muted-foreground flex flex-col gap-2 font-mono">
        <span className="font-bold text-foreground">References & Methodological Standards:</span>
        <p>1. Siddiqi, N. (2012). <em>Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring</em>. Wiley.</p>
        <p>2. OECD (2017). <em>Compliance Risk Management: Developing Compliance Improvement Plans</em>. Forum on Tax Administration.</p>
        <p>3. Schneider, F. & Enste, D. (2000). <em>Shadow economies: size, causes, and consequences</em>. Journal of Economic Literature.</p>
      </div>
    </div>
  )
}
