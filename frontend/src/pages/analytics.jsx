import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
} from "recharts"
import {
  BarChart3,
  Network,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { REGIONS, getNationalIndex } from "@/lib/regions"
import { BUSINESSES } from "@/lib/businesses"
import { INDUSTRIES } from "@/lib/industries"
import { computeShadowScore } from "@/lib/shadow-score"

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState("regions")

  // Compute live WoE scores for all sample businesses for the 2D scatter matrix
  const evaluatedBusinesses = useMemo(() => {
    return BUSINESSES.map((b) => {
      const scoreData = computeShadowScore(b)
      return {
        name: b.name,
        sector: b.sector,
        tier: b.baselineRisk,
        probability: scoreData.probability,
        confidence: scoreData.confidence,
        score: scoreData.score,
        flaggedCount: scoreData.flaggedCount,
      }
    })
  }, [])

  // Sigmoid curve data for the WoE Scorecard visualization
  const sigmoidCurveData = useMemo(() => {
    const points = []
    for (let logit = -5; logit <= 6; logit += 0.5) {
      const p = 1 / (1 + Math.exp(-logit))
      points.push({
        logOdds: logit,
        probability: Math.round(p * 100),
        score: Math.min(10, Math.max(1, Math.round(1 + 9 * p))),
      })
    }
    return points
  }, [])

  // Sector breakdown of flagged anomalies
  const sectorAnomaliesData = useMemo(() => {
    const sectorMap = {}
    evaluatedBusinesses.forEach((b) => {
      if (!sectorMap[b.sector]) {
        sectorMap[b.sector] = { sector: b.sector.split(" ")[0], total: 0, flagged: 0, avgScore: 0, scoreSum: 0 }
      }
      sectorMap[b.sector].total += 1
      sectorMap[b.sector].scoreSum += b.score
      if (b.score >= 6) sectorMap[b.sector].flagged += 1
    })
    return Object.values(sectorMap).map((s) => ({
      ...s,
      avgScore: Number((s.scoreSum / s.total).toFixed(1)),
      flaggedRate: Math.round((s.flagged / s.total) * 100),
    }))
  }, [evaluatedBusinesses])

  // Regional ranking data
  const regionalData = useMemo(() => {
    return [...REGIONS]
      .sort((a, b) => b.shadowIndex - a.shadowIndex)
      .map((r) => ({
        name: r.name.replace(" Region", "").replace(" Republic of", ""),
        shadowIndex: r.shadowIndex,
        delta: r.delta,
      }))
  }, [])

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 font-mono">
              <Network className="size-3.5 text-primary" />
              Advanced Analytics
            </Badge>
            <Badge variant="secondary">Interactive Graphs</Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Econometric & Forensic Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-dimensional visual modeling of regional shadow indices, Weight-of-Evidence distributions, and confidence decoupling.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border">
          <Button
            size="sm"
            variant={selectedTab === "regions" ? "default" : "ghost"}
            onClick={() => setSelectedTab("regions")}
            className="text-xs h-8"
          >
            <BarChart3 className="size-3.5 mr-1" />
            Regional Index
          </Button>
          <Button
            size="sm"
            variant={selectedTab === "woe" ? "default" : "ghost"}
            onClick={() => setSelectedTab("woe")}
            className="text-xs h-8"
          >
            <Activity className="size-3.5 mr-1" />
            WoE Curve & 2D Matrix
          </Button>
          <Button
            size="sm"
            variant={selectedTab === "sectors" ? "default" : "ghost"}
            onClick={() => setSelectedTab("sectors")}
            className="text-xs h-8"
          >
            <Layers className="size-3.5 mr-1" />
            Sector Distribution
          </Button>
        </div>
      </div>

      {/* Tab 1: Regional Breakdown */}
      {selectedTab === "regions" && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Composite Shadow Index by Uzbekistan Region (0–100 Scale)</CardTitle>
              <CardDescription>
                MIMIC calibrated composite shadow economy estimation across all 14 administrative jurisdictions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      interval={0} 
                      height={70} 
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                      formatter={(val) => [`${val} / 100`, "Shadow Index"]}
                    />
                    <Bar dataKey="shadowIndex" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: WoE Logistic Curve & 2D Decoupled Matrix */}
      {selectedTab === "woe" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* 2D Decoupled Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>2D Matrix: Probability vs. Decoupled Confidence</CardTitle>
              <CardDescription>
                Empirical demonstration: High confidence occurs at both extremes (clean and critically flagged).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      type="number"
                      dataKey="probability"
                      name="Probability (P)"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: "Shadow Probability (P %)", position: "insideBottom", offset: -10, fontSize: 11 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="confidence"
                      name="Evidence Confidence"
                      unit="%"
                      domain={[0, 100]}
                      label={{ value: "Confidence (%)", angle: -90, position: "insideLeft", fontSize: 11 }}
                      tick={{ fontSize: 10 }}
                    />
                    <ZAxis range={[60, 200]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ payload }) => {
                        if (!payload || !payload[0]) return null
                        const d = payload[0].payload
                        return (
                          <div className="p-2 bg-popover border rounded-md shadow-md text-xs">
                            <span className="font-bold">{d.name}</span>
                            <div className="text-muted-foreground">{d.sector} ({d.tier})</div>
                            <div className="mt-1 font-mono">Score: {d.score}/10 | P: {d.probability}%</div>
                            <div className="font-mono text-primary">Confidence: {d.confidence}%</div>
                          </div>
                        )
                      }}
                    />
                    <Scatter data={evaluatedBusinesses} fill="var(--primary)" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Logistic Link Function */}
          <Card>
            <CardHeader>
              <CardTitle>Scorecard Logistic Link Function</CardTitle>
              <CardDescription>
                Maps accumulated Weight-of-Evidence log-odds (logit + &Sigma;w&middot;z) to final posterior probability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sigmoidCurveData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="logOdds" label={{ value: "Log-Odds (&eta;)", position: "insideBottom", offset: -10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: "P (%)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                      formatter={(val, name) => [`${val}%`, "Posterior P"]}
                    />
                    <Line type="monotone" dataKey="probability" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Sector Distribution */}
      {selectedTab === "sectors" && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Forensic Anomaly Rate & Average Risk Score by Industry</CardTitle>
              <CardDescription>
                Industry cross-section evaluating cash-turnover intensity and cross-border customs exposure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorAnomaliesData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "8px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="flaggedRate" name="Flagged Anomaly Rate (%)" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" name="Average Risk Score (1-10)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
