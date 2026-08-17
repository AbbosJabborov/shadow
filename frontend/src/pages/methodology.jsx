import { useState } from "react"
import { 
  BrainCircuit, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText,
  Calculator,
  Cpu,
  Database
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CAUSES = [
  { name: "Direct Tax Burden", category: "Fiscal Policy", impact: "High (+)", desc: "Elevated corporate & personal tax rates increase the financial incentive to conceal income." },
  { name: "Indirect Tax Burden (VAT)", category: "Fiscal Policy", impact: "High (+)", desc: "Drives final retail transactions off-the-books through unreceipted cash transactions." },
  { name: "Social Security Contributions", category: "Labor Market", impact: "Very High (+)", desc: "Drives informal cash-in-hand wage agreements (envelope wages) to minimize payroll taxes." },
  { name: "Labor Market Rigidity", category: "Regulation", impact: "Moderate (+)", desc: "Strict hiring/firing regulations and compliance overhead incentivize informal contracting." },
  { name: "Control of Corruption", category: "Institutions", impact: "Very High (-)", desc: "Strong enforcement and rule of law exponentially increase detection risks." },
  { name: "Tax Morale & Public Trust", category: "Institutions", impact: "High (-)", desc: "High trust in public institutions directly correlates with voluntary tax compliance." },
  { name: "Unemployment Rate", category: "Macroeconomics", impact: "Moderate (+)", desc: "Workers without formal contracts migrate to informal subsistence jobs." },
  { name: "Self-Employment Rate", category: "Macroeconomics", impact: "High (+)", desc: "Small sole proprietorships present higher opportunities for unmonitored cash flow." },
]

const INDICATORS = [
  { name: "Currency Demand Ratio (M0 / M2)", category: "Monetary Trace", desc: "Informal and shadow deals rely overwhelmingly on untraceable physical cash." },
  { name: "Large-Denomination Banknotes", category: "Monetary Trace", desc: "High-value banknotes are disproportionately hoarded for shadow transactions." },
  { name: "Physical Electricity Input Mismatch", category: "Physical Traces", desc: "Underground manufacturing consumes real kilowatt-hours despite zero declared output." },
  { name: "Labor Force Participation Drop", category: "Labor Traces", desc: "Prime-age workers absent from official payroll records indicate active informal labor." },
  { name: "Official GDP Growth Divergence", category: "National Output", desc: "Shadow activity diverts resources away from officially recorded state production." },
]

export default function MethodologyPage() {
  // Interactive mini-simulator state
  const [revenue, setRevenue] = useState(1200)
  const [employees, setEmployees] = useState(25)
  const [sector, setSector] = useState("Wholesale & Retail Trade")
  const [baseTier, setBaseTier] = useState("Moderate")

  const revPerEmp = Math.round((revenue * 1_000_000) / Math.max(1, employees))
  const expectedSectorNorm = sector === "Wholesale & Retail Trade" ? 120_000_000 : 150_000_000
  const ratioHealth = Math.min(100, Math.round((revPerEmp / expectedSectorNorm) * 100))
  
  const estimatedRisk = Math.min(10, Math.max(1, Math.round(
    (baseTier === "Critical" ? 8 : baseTier === "Elevated" ? 6 : baseTier === "Moderate" ? 4 : 2) +
    (ratioHealth < 60 ? 2.5 : ratioHealth < 85 ? 1 : 0)
  )))

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <BrainCircuit className="size-3.5 text-primary" />
            Econometric & AI Architecture
          </Badge>
          <Badge variant="secondary">MIMIC Framework</Badge>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          How the AI Risk Calculation Works
        </h1>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          Shadow Index utilizes a dual-engine architecture combining the econometric <strong>MIMIC (Multiple Indicators Multiple Causes)</strong> structural model with <strong>Google Gemini LLM synthesis</strong> to eliminate arbitrary guesses and replace them with mathematically grounded, multi-tier risk evaluations.
        </p>
      </div>

      {/* Dual Layer Workflow Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default" className="w-fit">Layer 1: Deterministic</Badge>
              <Cpu className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Micro Enterprise Screening Engine</CardTitle>
            <CardDescription>Instant client-side ratio verification</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              Evaluates micro-level balance sheet anomalies by comparing declared numbers against industry benchmarks:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Revenue-to-Employee Ratio:</strong> Detects if declared income is suppressed relative to staff capacity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Sector Cash-Velocity Weight:</strong> Factors in cash prevalence per industry sector.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Longitudinal Filing Decay:</strong> Accounts for registration age and stability.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5 relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="w-fit bg-purple-500/20 text-purple-300">Layer 2: Generative</Badge>
              <BrainCircuit className="size-5 text-purple-400" />
            </div>
            <CardTitle className="text-xl">MIMIC + Gemini LLM Synthesis</CardTitle>
            <CardDescription>Deep structural audit & PDF report generator</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground">
              Triggered during <strong>"Download PDF Report"</strong> via the Django DRF backend:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Macro Econometric Cross-Examination:</strong> Binds the business to its region's 11 MIMIC causes and 6 indicators.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Structured JSON Schema:</strong> Strict constraints prevent hallucination.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>PostgreSQL Persistence:</strong> Fully stored in DB with audit timestamp for compliance.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Live Formula Playground */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            <CardTitle>Interactive Screening Ratio Simulator</CardTitle>
          </div>
          <CardDescription>
            See how declared revenue and employee count directly calculate the baseline risk score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label>Declared Revenue (Million UZS)</Label>
              <Input 
                type="number" 
                value={revenue} 
                onChange={(e) => setRevenue(Number(e.target.value))}
                min={100}
                step={100}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Headcount (Employees)</Label>
              <Input 
                type="number" 
                value={employees} 
                onChange={(e) => setEmployees(Number(e.target.value))}
                min={1}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Industry Sector</Label>
              <select 
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                <option value="Wholesale & Retail Trade">Wholesale & Retail Trade</option>
                <option value="Construction & Real Estate">Construction & Real Estate</option>
                <option value="Transportation & Logistics">Transportation & Logistics</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Pre-assigned Baseline Tier</Label>
              <select 
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={baseTier}
                onChange={(e) => setBaseTier(e.target.value)}
              >
                <option value="Low">Low Risk</option>
                <option value="Moderate">Moderate Risk</option>
                <option value="Elevated">Elevated Risk</option>
                <option value="Critical">Critical Risk</option>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/40 border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue per Employee</span>
              <span className="text-xl font-bold font-mono">{(revPerEmp / 1_000_000).toFixed(1)}M UZS / employee</span>
              <span className="text-xs text-muted-foreground">Sector benchmark: {(expectedSectorNorm / 1_000_000).toFixed(0)}M UZS</span>
            </div>

            <div className="w-full sm:w-64 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span>Ratio Health</span>
                <span className="font-semibold">{ratioHealth}% of benchmark</span>
              </div>
              <Progress value={ratioHealth} />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Calculated Score</span>
                <span className="text-2xl font-black text-primary font-mono">{estimatedRisk} / 10</span>
              </div>
              <Badge variant={estimatedRisk >= 7 ? "destructive" : estimatedRisk >= 5 ? "default" : "secondary"}>
                {estimatedRisk >= 7 ? "Flagged for Audit" : estimatedRisk >= 5 ? "Moderate Watch" : "Compliant"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Econometric MIMIC Variables Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Causes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5 text-amber-500" />
              <CardTitle>MIMIC Structural Causes (X)</CardTitle>
            </div>
            <CardDescription>Macroeconomic forces that incentivize economic informality</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {CAUSES.map((cause, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-md border border-border/60 bg-card">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{cause.name}</span>
                  <Badge variant="outline" className="text-xs font-mono">{cause.impact}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{cause.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Indicators */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-blue-500" />
              <CardTitle>MIMIC Observable Traces (Y)</CardTitle>
            </div>
            <CardDescription>Physical and monetary footprints left by underground activity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {INDICATORS.map((ind, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-md border border-border/60 bg-card">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{ind.name}</span>
                  <Badge variant="secondary" className="text-xs font-mono">{ind.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{ind.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
