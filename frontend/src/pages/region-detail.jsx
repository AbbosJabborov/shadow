import { Link, useParams } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CompassIcon,
  Factory,
  Gauge,
  ShieldQuestion,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress, ProgressLabel } from "@/components/ui/progress"
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
import { getIndustryByName, getRegionIndustryIndex } from "@/lib/industries"
import { getRegion } from "@/lib/regions"
import { getIndexTier, STATUS_BADGE, TIER_VARIANT } from "@/lib/risk"

export default function RegionDetailPage() {
  const { id } = useParams()
  const region = getRegion(id)

  if (!region) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CompassIcon />
            </EmptyMedia>
            <EmptyTitle>Region not found</EmptyTitle>
            <EmptyDescription>
              This region may have been removed or the link is incorrect.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/dashboard" />} nativeButton={false}>
              Back to Dashboard
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const regionBusinesses = BUSINESSES.filter((b) => b.regionId === region.id)
  const indexTier = getIndexTier(region.shadowIndex)
  const TrendIcon = region.delta >= 0 ? ArrowUpRight : ArrowDownRight

  const industryGroups = new Map()
  for (const business of regionBusinesses) {
    const industry = getIndustryByName(business.sector)
    if (!industry) continue
    const existing = industryGroups.get(industry.id)
    industryGroups.set(industry.id, { industry, count: (existing?.count ?? 0) + 1 })
  }

  const industryBreakdown = Array.from(industryGroups.values())
    .map(({ industry, count }) => ({
      industry,
      count,
      index: getRegionIndustryIndex(
        region.id,
        industry.id,
        region.shadowIndex,
        industry.nationalIndex
      ),
    }))
    .sort((a, b) => b.index - a.index)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{region.name}</h1>
          <Badge variant="outline">{region.code}</Badge>
          <Badge variant={indexTier.variant}>{indexTier.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {regionBusinesses.length} monitored businesses across {industryBreakdown.length}{" "}
          industries
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Shadow Index"
          value={region.shadowIndex}
          icon={Gauge}
          description="Composite index, 0–100 scale"
        />
        <StatCard
          label="Risk Tier"
          value={indexTier.label}
          icon={ShieldQuestion}
          description={
            <span className="inline-flex items-center gap-1">
              <TrendIcon className="size-3.5" />
              {Math.abs(region.delta).toFixed(1)} vs last quarter
            </span>
          }
        />
        <StatCard
          label="Businesses Monitored"
          value={regionBusinesses.length}
          icon={Building2}
          description="Registered MCHJ entities in this region"
        />
        <StatCard
          label="Industries Present"
          value={industryBreakdown.length}
          icon={Factory}
          description="Distinct sectors with monitored activity"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shadow Index by Industry</CardTitle>
          <CardDescription>
            Estimated index per industry within {region.name}, blending the region's index with
            each industry's national baseline.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {industryBreakdown.map((row) => {
              const tier = getIndexTier(row.index)
              return (
                <Progress key={row.industry.id} value={row.index}>
                  <ProgressLabel className="font-normal">{row.industry.name}</ProgressLabel>
                  <Badge variant={tier.variant}>{tier.label}</Badge>
                  <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                    {row.index} / 100
                  </span>
                </Progress>
              )
            })}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Industry</TableHead>
                <TableHead>Index</TableHead>
                <TableHead>Risk Tier</TableHead>
                <TableHead className="text-right">Businesses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industryBreakdown.map((row) => {
                const tier = getIndexTier(row.index)
                return (
                  <TableRow key={row.industry.id}>
                    <TableCell className="font-medium">{row.industry.name}</TableCell>
                    <TableCell className="tabular-nums">{row.index}</TableCell>
                    <TableCell>
                      <Badge variant={tier.variant}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Businesses in {region.name}</CardTitle>
          <CardDescription>{regionBusinesses.length} monitored entities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Baseline Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-left whitespace-normal"
                      render={<Link to={`/businesses/${business.id}`} />}
                      nativeButton={false}
                    >
                      {business.name} MCHJ
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{business.sector}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[business.status]}>{business.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TIER_VARIANT[business.baselineRisk]}>
                      {business.baselineRisk}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            render={<Link to={`/businesses?region=${region.id}`} />}
            nativeButton={false}
          >
            Open in Business Registry
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
