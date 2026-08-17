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
  TrendingUp,
  Database,
  Building2,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FORENSIC_DEFINITIONS } from "@/lib/forensics"

// Prior logit constants
const PRIOR_TABLE = {
  Low: { priorP: 0.04, logit: -3.178 },
  Moderate: { priorP: 0.10, logit: -2.197 },
  Elevated: { priorP: 0.20, logit: -1.386 },
  Critical: { priorP: 0.33, logit: -0.708 },
}

// MIMIC Macro Causes (Layer D)
const MIMIC_CAUSES = [
  { name: "Direct Tax Burden", category: "Tax Burden", unit: "% of GDP", effect: "+", desc: "Higher corporate & personal tax rates increase the financial incentive to conceal income." },
  { name: "Indirect Tax Burden (VAT)", category: "Tax Burden", unit: "% of GDP", effect: "+", desc: "Pushes final retail & consumer service transactions off official accounts." },
  { name: "Social Security Contributions", category: "Tax Burden", unit: "% of payroll", effect: "+", desc: "Drives informal cash-in-hand wage agreements (envelope wages)." },
  { name: "Labor Market Rigidity", category: "Regulation", unit: "Index 0-100", effect: "+", desc: "Strict hiring/firing rules and compliance overhead discourage formal contracts." },
  { name: "Bureaucratic Burden", category: "Regulation", unit: "Index 0-100", effect: "+", desc: "Licensing delays and administrative friction incentivize unlisted operations." },
  { name: "Control of Corruption & Rule of Law", category: "Institutions", unit: "Index 0-100", effect: "-", desc: "Strong enforcement exponentially raises detection risk and penalties." },
  { name: "Tax Morale & Public Trust", category: "Institutions", unit: "Index 0-100", effect: "-", desc: "High civic trust correlates with voluntary formal tax compliance." },
  { name: "Unemployment Rate", category: "Macro Conditions", unit: "%", effect: "+", desc: "Jobless workers seek informal income to replace lost earnings." },
  { name: "Self-Employment Rate", category: "Macro Conditions", unit: "% of workforce", effect: "+", desc: "Sole proprietors have high opportunity for unmonitored cash trade." },
  { name: "Inflation Rate", category: "Macro Conditions", unit: "%", effect: "+", desc: "Rapid price inflation destabilizes formal contracts and financial safety." },
  { name: "GDP per Capita", category: "Macro Conditions", unit: "USD", effect: "-", desc: "Wealthier economies provide stronger formal safety nets and formal jobs." },
]

// MIMIC Observable Indicators (Layer D)
const MIMIC_INDICATORS = [
  { name: "Currency Demand Ratio (M0 / M2)", category: "Monetary Trace", effect: "+", desc: "Shadow and informal transactions rely primarily on physical untraceable cash." },
  { name: "Large-Denomination Banknotes Share", category: "Monetary Trace", effect: "+", desc: "High-value cash banknotes are disproportionately hoarded for shadow deals." },
  { name: "Electricity Consumption Index Mismatch", category: "Physical Input", effect: "+", desc: "Underground manufacturing consumes physical power despite zero declared output." },
  { name: "Labor Force Participation Drop", category: "Labor Market", effect: "-", desc: "Prime-age workers disappearing from official payrolls operate in the informal sector." },
  { name: "Male Labor Participation (25-54)", category: "Labor Market", effect: "-", desc: "Core working demographic absence directly traces informal employment." },
  { name: "Official Real GDP Growth Rate", category: "National Output", effect: "-", desc: "Shadow economic activity diverts capital away from recorded state output." },
]

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
  const [selectedLayerTab, setSelectedLayerTab] = useState("all")
  const [simulatorTier, setSimulatorTier] = useState("Critical")
  const [signalValues, setSignalValues] = useState(PRESETS.termiz.values)
  const [conflationComparisonMode, setConflationComparisonMode] = useState("decoupled")

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

    const coverage = 1.0
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

  // Chart Data: Waterfall
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

  // Chart Data: Sigmoid Curve
  const sigmoidCurveData = useMemo(() => {
    const pts = []
    for (let x = -5; x <= 6; x += 0.4) {
      const p = 1 / (1 + Math.exp(-x))
      pts.push({
        x: Number(x.toFixed(1)),
        p: Math.round(p * 100),
      })
    }
    return pts
  }, [])

  // Chart Data: Comparison
  const comparisonData = [
    { name: "Toshkent (Clean)", prob: 10, oldConf: 10, newConf: 59 },
    { name: "Andijon (Marginal)", prob: 84, oldConf: 84, newConf: 54 },
    { name: "Termiz (Critical)", prob: 99, oldConf: 99, newConf: 89 },
  ]

  // Chart Data: Decisiveness Function
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

  // Chart Data: 2D Phase Plane
  const phasePlanePoints = [
    { name: "Clean Firm", prob: 8, conf: 86 },
    { name: "Slight Noise", prob: 18, conf: 65 },
    { name: "Borderline Case", prob: 78, conf: 52 },
    { name: "Ambiguous Watch", prob: 50, conf: 38 },
    { name: "Flagged High", prob: 92, conf: 84 },
    { name: "Critical Extremity", prob: 99, conf: 92 },
  ]

  const loadPreset = (key) => {
    const p = PRESETS[key]
    if (!p) return
    setSimulatorTier(p.tier)
    setSignalValues(p.values)
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-24 pt-2 font-sans">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
            <BookOpen className="size-3.5 text-primary" />
            Working Paper &bull; Technical Specification v3
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            Complete Five-Layer Econometric Pipeline
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
          A Deterministic Weight-of-Evidence Framework for Firm-Level Shadow Economy Risk, with Confidence Decoupled from Direction
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed italic max-w-4xl">
          How the scorecard, the confidence metric, and the LLM narrative layer actually work — traced line by line to the code that runs them across all five layers.
        </p>

        <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-muted-foreground border-t">
          <span><strong>System:</strong> Shadow Index</span>
          <span><strong>Layers:</strong> A &bull; B &bull; C &bull; D &bull; E</span>
          <span><strong>Deterministic Math:</strong> Live In-Browser</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="p-4 sm:p-5 rounded-lg border bg-muted/30 border-l-4 border-l-primary flex flex-col gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Abstract</span>
        <p className="text-sm leading-relaxed text-foreground/90">
          We describe a five-part system for assessing firm-level involvement in Uzbekistan&apos;s shadow economy: <strong>Layer A</strong> (seven forensic contradiction checks), <strong>Layer B</strong> (a deterministic weight-of-evidence logistic scorecard), <strong>Layer C</strong> (a confidence metric decoupled from probability direction), <strong>Layer D</strong> (regional macro MIMIC context), and <strong>Layer E</strong> (a large-language-model narrative layer that synthesizes findings into an auditable report without touching arithmetic).
        </p>
      </div>

      {/* Overview of 5 Layers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer A</span>
          <h4 className="text-xs font-bold">Forensic Signals</h4>
          <span className="text-[11px] text-muted-foreground">7 contradiction tests</span>
        </div>
        <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer B</span>
          <h4 className="text-xs font-bold">WoE Scorecard</h4>
          <span className="text-[11px] text-muted-foreground">Prior + &Sigma;w&middot;z &rarr; Score</span>
        </div>
        <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer C</span>
          <h4 className="text-xs font-bold">Decoupled Conf.</h4>
          <span className="text-[11px] text-muted-foreground">Coverage &times; Decisiveness</span>
        </div>
        <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
          <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer D</span>
          <h4 className="text-xs font-bold">Regional MIMIC</h4>
          <span className="text-[11px] text-muted-foreground">11 Causes + 6 Indicators</span>
        </div>
        <div className="p-3 rounded-lg border bg-card flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold uppercase text-primary">Layer E</span>
          <h4 className="text-xs font-bold">Gemini Synthesis</h4>
          <span className="text-[11px] text-muted-foreground">Constrained JSON Report</span>
        </div>
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
          </CardContent>
        </Card>
      </section>

      {/* SECTION 2: Layer A — Forensic Contradiction Signals */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§2</span>
          <h2 className="text-xl font-bold tracking-tight">Layer A &bull; Forensic Contradiction Signals (<code className="text-sm">forensics.js</code>)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every signal in Layer A tests a firm&apos;s own filings against each other or against an independent record of the same transaction (e.g. counterparty e-invoices, POS settlement volumes, customs manifests, ASKUE power telemetry) — never against peer averages.
        </p>

        {/* Table of 7 Signals */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left font-mono text-muted-foreground">
                <th className="p-2.5">Signal Rule</th>
                <th className="p-2.5">Source &amp; Category</th>
                <th className="p-2.5 font-bold">Threshold</th>
                <th className="p-2.5">Scale</th>
                <th className="p-2.5 font-bold">Weight</th>
                <th className="p-2.5">Scope</th>
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

      {/* SECTION 3: Layer B — Weight-of-Evidence Scorecard */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§3</span>
          <h2 className="text-xl font-bold tracking-tight">Layer B &bull; Weight-of-Evidence Scorecard (<code className="text-sm">shadow-score.js</code>)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The scorecard model (Siddiqi 2012, OECD 2017) initializes from a peer-cohort prior logit based on the statutory baseline tier, adds excess contradiction $z$-scores multiplied by evidentiary weights, and passes the sum through a logistic link function.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-md border bg-muted/20 font-mono text-xs flex flex-col gap-2">
            <span className="font-bold text-foreground">// Mathematical Formulation</span>
            <p>z_i = clip( max(0, raw_i &minus; threshold_i) / scale_i, 0, 3 )</p>
            <p>contribution_i = weight_i &times; z_i</p>
            <p>log_odds = logit(prior) + &Sigma; contribution_i</p>
            <p>P = sigmoid(log_odds), clipped to [0.01, 0.99]</p>
            <p>score = clip( round(1 + 9 &times; P), 1, 10 )</p>
          </div>

          <div className="p-4 rounded-md border bg-card flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prior Logits by Baseline Risk Tier</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 border rounded text-xs"><span className="text-muted-foreground">Low:</span> <span className="font-mono font-bold">P=4% (logit &minus;3.178)</span></div>
              <div className="p-2 border rounded text-xs"><span className="text-muted-foreground">Moderate:</span> <span className="font-mono font-bold">P=10% (logit &minus;2.197)</span></div>
              <div className="p-2 border rounded text-xs"><span className="text-muted-foreground">Elevated:</span> <span className="font-mono font-bold">P=20% (logit &minus;1.386)</span></div>
              <div className="p-2 border rounded text-xs border-destructive/30 bg-destructive/5"><span className="text-destructive font-semibold">Critical:</span> <span className="font-mono font-bold text-destructive">P=33% (logit &minus;0.708)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Layer C — Decoupled Confidence Metric */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§4</span>
          <h2 className="text-xl font-bold tracking-tight">Layer C &bull; Confidence, Decoupled from Direction</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Confidence measures how much evidence exists and how decisively values sit away from statutory flag thresholds. It is built from two quantities: <strong>Coverage</strong> (fraction of applicable checks) and <strong>Decisiveness</strong> (1 &minus; exp(&minus;distance)).
        </p>

        <div className="p-4 rounded-md border bg-muted/20 font-mono text-xs flex flex-col gap-2">
          <p>distance_i = | raw_i &minus; threshold_i | / scale_i</p>
          <p>decisiveness_i = 1 &minus; exp(&minus;distance_i)</p>
          <p>coverage = applicable_count / 7</p>
          <p className="font-bold text-primary">confidence = clip( round( 100 &times; (0.30 &times; coverage + 0.70 &times; avg_decisiveness) ), 10, 96 )</p>
        </div>
      </section>

      {/* SECTION 5: LIVE SIMULATOR */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-lg text-primary">§5</span>
            <h2 className="text-xl font-bold tracking-tight">Live Scorecard Simulator (Layers A, B &amp; C Running Live)</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Presets:</span>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("toshkent")}>Toshkent (Clean)</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("andijon")}>Andijon (Marginal)</Button>
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => loadPreset("termiz")}>Termiz (Critical)</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sliders */}
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

          {/* Live Outputs */}
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

      {/* SECTION 6: Layer D — Regional Macro Context (MIMIC Dataset) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§6</span>
          <h2 className="text-xl font-bold tracking-tight">Layer D &bull; Regional Macro Context (MIMIC Dataset &bull; <code className="text-sm">mimic_data.py</code>)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Independently of firm-level scoring, each of Uzbekistan&apos;s 14 regions carries a MIMIC-inspired macro dataset (Schneider &amp; Enste 2000): <strong>11 macro causes</strong> (fiscal burden, labor rigidity, corruption control) and <strong>6 observable indicators</strong> (currency demand ratio, electricity footprint, labor participation drops).
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Causes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                <CardTitle className="text-sm font-bold">11 Structural Macro Causes (X)</CardTitle>
              </div>
              <CardDescription className="text-xs">Forces incentivizing informal economic activity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {MIMIC_CAUSES.map((c, i) => (
                <div key={i} className="p-2 rounded border bg-card text-xs flex flex-col gap-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{c.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{c.effect === "+" ? "Increases (+)" : "Decreases (-)"}</Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{c.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Indicators */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-bold">6 Observable Traces (Y)</CardTitle>
              </div>
              <CardDescription className="text-xs">Physical and monetary footprints left by informal trade</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {MIMIC_INDICATORS.map((ind, i) => (
                <div key={i} className="p-2 rounded border bg-card text-xs flex flex-col gap-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{ind.name}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">{ind.category}</Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{ind.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 7: Layer E — LLM Narrative Synthesis */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§7</span>
          <h2 className="text-xl font-bold tracking-tight">Layer E &bull; LLM Narrative Synthesis (<code className="text-sm">gemini.py</code>)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A single <strong>Google Gemini 2.5 Flash</strong> call, constrained to a strict 8-field JSON schema, converts the scorecard&apos;s already-computed numbers plus Layer D&apos;s regional context into an auditable case narrative. It has <strong>no scoring authority</strong>: the score, probability, confidence, and per-signal metrics are computed deterministically in Layers A–C before the LLM runs.
        </p>

        <div className="p-4 rounded-md border bg-muted/20 font-mono text-xs flex flex-col gap-2">
          <span className="font-bold text-foreground">// Strict JSON Schema Structure</span>
          <p>&bull; <code>notes</code> (string): 2–4 sentence executive take</p>
          <p>&bull; <code>executiveSummary</code> (string): High-level operational findings</p>
          <p>&bull; <code>causesAnalysis</code> (string): Regional MIMIC macro causal factors</p>
          <p>&bull; <code>indicatorsAnalysis</code> (string): Observable physical and monetary indicators</p>
          <p>&bull; <code>conclusion</code> (string): Final synthesized assessment</p>
          <p>&bull; <code>estimatedIndex</code> (integer 1–10) &bull; <code>confidencePercent</code> (integer 0–100)</p>
          <p>&bull; <code>keyRiskFactors</code> (array of strings): 3–5 concise risk phrases</p>
        </div>
      </section>

      {/* SECTION 8: Mathematical Visualizations Suite (4 Charts) */}
      <section className="flex flex-col gap-6">
        <div className="flex items-baseline gap-2 border-b pb-2">
          <span className="font-mono font-bold text-lg text-primary">§8</span>
          <h2 className="text-xl font-bold tracking-tight">Mathematical Visualization Suite</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GRAPH 2: Waterfall */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 2 &bull; Log-Odds Evidentiary Waterfall</CardTitle>
              <CardDescription className="text-xs">Exact log-odds contribution added by each signal</CardDescription>
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

          {/* GRAPH 3: Sigmoid Curve */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 3 &bull; Sigmoid Link & Operating Point</CardTitle>
              <CardDescription className="text-xs">Operating point (&eta; = {simCalculation.logOdds}) mapped to probability</CardDescription>
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
                    <ReferenceLine x={simCalculation.logOdds} stroke="var(--destructive)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="p" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* GRAPH 4: Decisiveness */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 4 &bull; Decisiveness Saturation Function</CardTitle>
              <CardDescription className="text-xs">Formula: d_i = 1 &minus; exp(&minus;distance)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decisivenessCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="distance" tick={{ fontSize: 10 }} label={{ value: "Standardized Distance", position: "insideBottom", offset: -5, fontSize: 10 }} />
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

          {/* GRAPH 5: 2D Phase Plane */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Graph 5 &bull; 2D Phase Plane (Confidence vs. Probability)</CardTitle>
              <CardDescription className="text-xs">Orthogonal geometry across sample risk cases</CardDescription>
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

      {/* References */}
      <div className="border-t pt-6 text-xs text-muted-foreground flex flex-col gap-2 font-mono">
        <span className="font-bold text-foreground">References:</span>
        <p>1. Siddiqi, N. (2012). <em>Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring</em>. Wiley.</p>
        <p>2. OECD (2017). <em>Compliance Risk Management: Developing Compliance Improvement Plans</em>. Forum on Tax Administration.</p>
        <p>3. Schneider, F. & Enste, D. (2000). <em>Shadow economies: size, causes, and consequences</em>. Journal of Economic Literature.</p>
      </div>
    </div>
  )
}
