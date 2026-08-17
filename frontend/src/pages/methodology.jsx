import { useState } from "react"
import { 
  BrainCircuit, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Calculator, 
  Cpu, 
  ShieldCheck, 
  Scale, 
  FileText, 
  AlertTriangle,
  Flame,
  Code
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FORENSIC_DEFINITIONS } from "@/lib/forensics"
import { computeShadowScore } from "@/lib/shadow-score"

export default function MethodologyPage() {
  const [selectedTier, setSelectedTier] = useState("Moderate")
  const [simulatedSignals, setSimulatedSignals] = useState({
    "pos-vs-revenue": 1.2,
    "vat-invoice-chain": 0.08,
    "customs-vs-cogs": 0.12,
    "mirror-trade": 0.08,
    "wage-bunching": 0.22,
    "night-day-electricity": 0.40,
    "persistent-losses": 1,
  })

  // Compute live score from interactive inputs
  const simulatedBusiness = {
    name: "Interactive Entity MCHJ",
    sector: "Wholesale & Retail Trade",
    baselineRisk: selectedTier,
    status: "Active",
    employees: 30,
    revenue: 2000000000,
  }

  const scoreOutput = computeShadowScore(simulatedBusiness)

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 font-mono">
            <Scale className="size-3.5 text-primary" />
            Working Paper v3
          </Badge>
          <Badge variant="secondary">Weight-of-Evidence (WoE) Scorecard</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Deterministic Weight-of-Evidence Risk Framework
        </h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm">
          A rigorous econometric methodology converting <strong>7 firm-level forensic contradiction checks</strong> into a probability and risk score, with <strong>evidence confidence decoupled from direction</strong> (Siddiqi 2012, OECD Tax Compliance standard).
        </p>
      </div>

      {/* The Core Insight: Decoupled Confidence */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default">Core Innovation</Badge>
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Decoupled Confidence Principle</CardTitle>
            <CardDescription>Why probability &ne; confidence</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              Traditional systems mistakenly equate high risk probability with high confidence, treating a compliant business as &ldquo;uncertain&rdquo;.
            </p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-md bg-card border text-xs flex justify-between items-center">
                <span><strong>Clean Entity:</strong> All 7 checks compliant</span>
                <span className="font-mono text-emerald-500 font-bold">P = 8% &bull; Conf = 88%</span>
              </div>
              <div className="p-2.5 rounded-md bg-card border text-xs flex justify-between items-center">
                <span><strong>Marginal Entity:</strong> 2 border-line flags</span>
                <span className="font-mono text-amber-500 font-bold">P = 78% &bull; Conf = 52%</span>
              </div>
              <div className="p-2.5 rounded-md bg-card border text-xs flex justify-between items-center">
                <span><strong>Critical Entity:</strong> 7 decisive flags</span>
                <span className="font-mono text-destructive font-bold">P = 98% &bull; Conf = 92%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exact Mathematical Formulation */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Formulation</Badge>
              <Code className="size-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Scorecard Equations</CardTitle>
            <CardDescription>Exact running formulas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs font-mono bg-muted/30 p-4 rounded-md border">
            <div>
              <span className="text-muted-foreground">// 1. Excess contradiction z-score (clipped at 3)</span>
              <p className="font-bold text-foreground">z_i = clip( max(0, raw_i &minus; threshold_i) / scale_i, 0, 3 )</p>
            </div>
            <div>
              <span className="text-muted-foreground">// 2. Weighted log-odds summation</span>
              <p className="font-bold text-foreground">log_odds = logit(prior) + &Sigma; (weight_i &times; z_i)</p>
            </div>
            <div>
              <span className="text-muted-foreground">// 3. Probability & final score</span>
              <p className="font-bold text-foreground">P = sigmoid(log_odds), Score = round(1 + 9 &times; P)</p>
            </div>
            <div>
              <span className="text-muted-foreground">// 4. Decoupled confidence metric</span>
              <p className="font-bold text-primary">Confidence = 100 &times; (0.3 &times; Coverage + 0.7 &times; AvgDecisiveness)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table 1: 7 Forensic Contradiction Signals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="size-5 text-primary" />
            <CardTitle>Layer A — The Seven Forensic Contradiction Rules</CardTitle>
          </div>
          <CardDescription>
            Tests same-firm arithmetic and physical telemetry against independent third-party filings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground font-mono">
                  <th className="py-2.5 pr-4">Signal Rule</th>
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4">Threshold</th>
                  <th className="py-2.5 pr-4">Scale</th>
                  <th className="py-2.5 pr-4">Weight</th>
                  <th className="py-2.5">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {FORENSIC_DEFINITIONS.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{s.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{s.category}</td>
                    <td className="py-2.5 pr-4 font-mono font-bold text-primary">
                      {s.unit === "ratio" ? `${s.threshold}×` : s.unit.startsWith("%") ? `${s.threshold * 100}%` : `${s.threshold} yrs`}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-muted-foreground">{s.scale}</td>
                    <td className="py-2.5 pr-4 font-mono font-semibold">{s.weight}</td>
                    <td className="py-2.5">
                      <Badge variant="outline" className="text-[10px]">
                        {s.id.includes("customs") || s.id.includes("mirror") ? "Trade Sectors" : "All Sectors"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table 2: Prior Logits by Baseline Risk Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Layer B — Peer Cohort Prior Logits</CardTitle>
          <CardDescription>
            Prevents detection-density bias by calibrating initial log-odds to statutory sector risk tier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">Low Baseline</span>
              <span className="text-xl font-bold font-mono">P = 4%</span>
              <span className="text-xs text-muted-foreground font-mono">logit: &minus;3.178</span>
            </div>
            <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">Moderate Baseline</span>
              <span className="text-xl font-bold font-mono">P = 10%</span>
              <span className="text-xs text-muted-foreground font-mono">logit: &minus;2.197</span>
            </div>
            <div className="p-3 rounded-lg border bg-card flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-semibold">Elevated Baseline</span>
              <span className="text-xl font-bold font-mono">P = 20%</span>
              <span className="text-xs text-muted-foreground font-mono">logit: &minus;1.386</span>
            </div>
            <div className="p-3 rounded-lg border bg-card border-destructive/30 bg-destructive/5 flex flex-col gap-1">
              <span className="text-xs text-destructive font-semibold">Critical Baseline</span>
              <span className="text-xl font-bold font-mono text-destructive">P = 33%</span>
              <span className="text-xs text-muted-foreground font-mono">logit: &minus;0.708</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
