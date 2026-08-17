import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Flag,
  Gauge,
  MapPinned,
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
  const sortedRegions = [...REGIONS].sort((a, b) => b.shadowIndex - a.shadowIndex)
  const nationalIndex = getNationalIndex()
  const highestRegion = sortedRegions[0]
  const flaggedCount = BUSINESSES.filter((b) => b.status !== "Active").length

  const chartData = sortedRegions.map((region) => ({
    ...region,
    tier: getIndexTier(region.shadowIndex).label,
  }))

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Shadow Economy Monitoring
          </h1>
          <Badge variant="outline">Demo data</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Composite shadow economy index and business-level risk monitoring across all 14
          regions of Uzbekistan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="National Index"
          value={nationalIndex}
          icon={Gauge}
          description="Average across all regions"
        />
        <StatCard
          label="Highest Risk Region"
          value={highestRegion.code}
          icon={MapPinned}
          description={`${highestRegion.name} — index ${highestRegion.shadowIndex}`}
        />
        <StatCard
          label="Businesses Monitored"
          value={BUSINESSES.length}
          icon={Building2}
          description="Registered MCHJ entities tracked"
        />
        <StatCard
          label="Flagged for Review"
          value={flaggedCount}
          icon={Flag}
          description="Under review or suspended"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Index by Region</CardTitle>
          <CardDescription>
            Composite shadow economy index, 0–100 scale. Bar shade intensity reflects risk
            tier, highest first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[440px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 16 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
              <YAxis
                dataKey="code"
                type="category"
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelKey="name"
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name}
                  />
                }
              />
              <Bar dataKey="shadowIndex" radius={4}>
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={TIER_CHART_FILL[entry.tier]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Ranking</CardTitle>
          <CardDescription>Sorted by index, highest risk first</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Index</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Risk Tier</TableHead>
                <TableHead>Businesses</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRegions.map((region, index) => {
                const tier = getIndexTier(region.shadowIndex)
                const businessCount = BUSINESSES.filter(
                  (b) => b.regionId === region.id
                ).length
                const TrendIcon = region.delta >= 0 ? ArrowUpRight : ArrowDownRight

                return (
                  <TableRow key={region.id}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left whitespace-normal"
                        render={<Link to={`/regions/${region.id}`} />}
                        nativeButton={false}
                      >
                        {region.name}
                      </Button>
                    </TableCell>
                    <TableCell className="tabular-nums">{region.shadowIndex}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
                        <TrendIcon className="size-3.5" />
                        {Math.abs(region.delta).toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tier.variant}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{businessCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0"
                        render={<Link to={`/businesses?region=${region.id}`} />}
                        nativeButton={false}
                      >
                        View businesses
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
