import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Flag,
  Gauge,
  MapPinned,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatCard } from "@/components/stat-card"
import { BUSINESSES } from "@/lib/businesses"
import { getNationalIndex, REGIONS } from "@/lib/regions"
import { getIndexTier, TIER_CHART_FILL } from "@/lib/risk"

const chartConfig = {
  shadowIndex: { label: "Shadow Index" },
}

export default function DashboardPage() {
  const [filterTier, setFilterTier] = useState("all")
  const sortedRegions = [...REGIONS].sort((a, b) => b.shadowIndex - a.shadowIndex)
  const nationalIndex = getNationalIndex()
  const highestRegion = sortedRegions[0]
  const lowestRegion = sortedRegions[sortedRegions.length - 1]
  const flaggedCount = BUSINESSES.filter((b) => b.status !== "Active").length

  const chartData = sortedRegions.map((region) => ({
    ...region,
    tier: getIndexTier(region.shadowIndex).label,
    fill: TIER_CHART_FILL[getIndexTier(region.shadowIndex).label],
  }))

  const filteredRegions = filterTier === "all"
    ? sortedRegions
    : sortedRegions.filter((r) => getIndexTier(r.shadowIndex).label === filterTier)

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header with Color Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Live Telemetry
            </Badge>
            <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10">
              14 Regions Active
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Shadow Economy Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Composite regional econometric index and forensic entity surveillance across Uzbekistan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5 hover:bg-sky-500/10" render={<Link to="/analytics" />} nativeButton={false}>
            <Activity className="size-3.5 mr-1 text-sky-500" />
            Advanced Graphs
          </Button>
          <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white" render={<Link to="/methodology" />} nativeButton={false}>
            <Sparkles className="size-3.5 mr-1" />
            AI & Methodology
          </Button>
        </div>
      </div>

      {/* 4 Colored Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="National Composite Index"
          value={nationalIndex}
          icon={Gauge}
          description="Weighted average across all 14 regions"
          colorScheme="blue"
          badge="National Baseline"
        />
        <StatCard
          label="Highest Risk Jurisdiction"
          value={highestRegion.code}
          icon={MapPinned}
          description={`${highestRegion.name} — index ${highestRegion.shadowIndex}`}
          colorScheme="rose"
          badge="High Attention"
        />
        <StatCard
          label="Entities Monitored"
          value={BUSINESSES.length}
          icon={Building2}
          description="Registered MCHJ corporate filers"
          colorScheme="green"
          badge="Full Coverage"
        />
        <StatCard
          label="Flagged for Audit Review"
          value={flaggedCount}
          icon={Flag}
          description="Entities tripping forensic consistency checks"
          colorScheme="amber"
          badge="Priority Queue"
        />
      </div>

      {/* Regional Index Horizontal Bar Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Composite Shadow Index by Region</CardTitle>
              <CardDescription>
                0–100 scale. Color spectrum indicates severity: <span className="text-emerald-500 font-semibold">Mint Green (Low)</span>, <span className="text-sky-500 font-semibold">Sky Blue (Moderate)</span>, <span className="text-amber-500 font-semibold">Amber (Elevated)</span>, <span className="text-rose-500 font-semibold">Coral (Critical)</span>.
              </CardDescription>
            </div>

            {/* Color Legend Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500" /> &le;39 Low
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <span className="size-2 rounded-full bg-sky-500" /> 40–54 Moderate
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="size-2 rounded-full bg-amber-500" /> 55–69 Elevated
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="size-2 rounded-full bg-rose-500" /> 70+ Critical
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[460px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 10, bottom: 10 }}>
              <CartesianGrid horizontal={false} opacity={0.15} />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={150}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    labelKey="name"
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name}
                  />
                }
              />
              <Bar dataKey="shadowIndex" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Regional Ranking Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Regional Surveillance Ranking</CardTitle>
              <CardDescription>Sorted by index severity, highest informality first</CardDescription>
            </div>

            {/* Quick Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border text-xs">
              <button
                onClick={() => setFilterTier("all")}
                className={`px-2 py-1 rounded transition-colors ${filterTier === "all" ? "bg-background font-bold shadow-sm" : "text-muted-foreground"}`}
              >
                All (14)
              </button>
              <button
                onClick={() => setFilterTier("Critical")}
                className={`px-2 py-1 rounded transition-colors ${filterTier === "Critical" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"}`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterTier("Elevated")}
                className={`px-2 py-1 rounded transition-colors ${filterTier === "Elevated" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"}`}
              >
                Elevated
              </button>
              <button
                onClick={() => setFilterTier("Moderate")}
                className={`px-2 py-1 rounded transition-colors ${filterTier === "Moderate" ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold" : "text-muted-foreground"}`}
              >
                Moderate
              </button>
              <button
                onClick={() => setFilterTier("Low")}
                className={`px-2 py-1 rounded transition-colors ${filterTier === "Low" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}`}
              >
                Low
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Region Jurisdiction</TableHead>
                <TableHead>Shadow Index</TableHead>
                <TableHead>12-Mo Trend</TableHead>
                <TableHead>Risk Classification</TableHead>
                <TableHead>Tracked Entities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegions.map((region, index) => {
                const tier = getIndexTier(region.shadowIndex)
                const businessCount = BUSINESSES.filter(
                  (b) => b.regionId === region.id
                ).length
                const isDecreasing = region.delta < 0 // Decreasing shadow index is positive improvement
                const TrendIcon = isDecreasing ? ArrowDownRight : ArrowUpRight

                return (
                  <TableRow key={region.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-muted-foreground font-mono tabular-nums text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left whitespace-normal font-semibold text-foreground hover:text-sky-500"
                        render={<Link to={`/regions/${region.id}`} />}
                        nativeButton={false}
                      >
                        {region.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm tabular-nums">{region.shadowIndex}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${region.shadowIndex}%`,
                              backgroundColor: TIER_CHART_FILL[tier.label],
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md border font-medium ${
                          isDecreasing
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <TrendIcon className="size-3.5" />
                        {Math.abs(region.delta).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${tier.colorClass}`}>
                        {tier.label}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums font-mono text-xs text-muted-foreground">
                      {businessCount} entities
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10"
                        render={<Link to={`/businesses?region=${region.id}`} />}
                        nativeButton={false}
                      >
                        View records &rarr;
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
