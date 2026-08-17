import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CircleCheck,
  CompassIcon,
  Download,
  Flag,
  Landmark,
  NotebookPen,
  RefreshCw,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { getBusiness } from "@/lib/businesses"
import { formatDate, formatDateTime, formatUZS } from "@/lib/format"
import { runAIAnalysis } from "@/lib/mock-ai"
import { downloadShadowEconomyReportPdf } from "@/lib/pdf"
import { getRegion } from "@/lib/regions"
import { generateReport } from "@/lib/report-api"
import { getIndexTier, getScoreTier, STATUS_BADGE, TIER_VARIANT } from "@/lib/risk"

function FactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const business = getBusiness(id)
  const region = business ? getRegion(business.regionId) : null

  const [status, setStatus] = useState("idle")
  const [result, setResult] = useState(null)
  const [pdfStatus, setPdfStatus] = useState("idle")
  const [reportNotes, setReportNotes] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    setStatus("idle")
    setResult(null)
    setPdfStatus("idle")
    setReportNotes(null)
  }, [id])

  if (!business || !region) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CompassIcon />
            </EmptyMedia>
            <EmptyTitle>Business not found</EmptyTitle>
            <EmptyDescription>
              This entity may have been removed or the link is incorrect.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link to="/businesses" />} nativeButton={false}>
              Back to Business Registry
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  function handleCalculate() {
    setStatus("loading")
    window.setTimeout(() => {
      if (!mountedRef.current) return
      setResult(runAIAnalysis(business))
      setStatus("done")
    }, 1400)
  }

  async function handleDownloadPdf() {
    setPdfStatus("loading")
    try {
      const report = await generateReport({ business, region, aiResult: result })
      setReportNotes(report.notes)
      downloadShadowEconomyReportPdf({ business, region, aiResult: result, report })
      toast("Report downloaded", {
        description: "Generated with Gemini from the MIMIC causes/indicators dataset.",
      })
    } catch (error) {
      toast("Report generation failed", {
        description: error.message || "Could not reach the report backend.",
      })
    } finally {
      if (mountedRef.current) setPdfStatus("idle")
    }
  }

  const indexTier = getIndexTier(region.shadowIndex)
  const scoreTier = result ? getScoreTier(result.score) : null
  const RegionTrendIcon = region.delta >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {business.name} MCHJ
          </h1>
          <Badge variant={STATUS_BADGE[business.status]}>{business.status}</Badge>
          <Badge variant={TIER_VARIANT[business.baselineRisk]}>
            {business.baselineRisk} baseline
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {business.sector} &middot; {region.name} &middot; Registered{" "}
          {formatDate(business.registered)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{business.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Shadow Economy Analysis</CardTitle>
              <CardDescription>
                Simulated output for demonstration. Connect the live scoring API to replace
                this with a real assessment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === "idle" && (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Sparkles />
                    </EmptyMedia>
                    <EmptyTitle>No analysis yet</EmptyTitle>
                    <EmptyDescription>
                      Run the model to estimate this business's shadow economy risk score and
                      surface the factors behind it.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={handleCalculate}>
                      <Sparkles data-icon="inline-start" />
                      Calculate with AI
                    </Button>
                  </EmptyContent>
                </Empty>
              )}

              {status === "loading" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    Analyzing business records...
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}

              {status === "done" && result && (
                <div className="flex flex-col gap-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-lg border p-3 bg-card">
                      <span className="text-xs text-muted-foreground font-medium">
                        Shadow Score
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono">
                          {result.score}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 10</span>
                        <Badge variant={scoreTier.variant} className="ml-auto text-xs">
                          {scoreTier.label}
                        </Badge>
                      </div>
                      <Progress value={result.score * 10} />
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border p-3 bg-card">
                      <span className="text-xs text-muted-foreground font-medium">
                        Probability (P)
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono">
                          {result.probability}%
                        </span>
                        <span className="text-xs text-muted-foreground">likelihood</span>
                      </div>
                      <Progress value={result.probability} />
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg border p-3 bg-card border-primary/20 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">
                          Evidence Confidence
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Coverage: {result.coveragePercent}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-primary">
                          {result.confidence}%
                        </span>
                        <span className="text-xs text-muted-foreground">decisiveness</span>
                      </div>
                      <Progress value={result.confidence} />
                    </div>
                  </div>

                  <Alert variant={result.flagged ? "destructive" : "default"}>
                    {result.flagged ? <TriangleAlert /> : <CircleCheck />}
                    <AlertTitle>
                      {result.flagged
                        ? `Flagged: ${result.flaggedCount} Contradiction Signal${result.flaggedCount > 1 ? "s" : ""} Detected`
                        : "Compliant: All Applicable Forensic Checks Clean"}
                    </AlertTitle>
                    <AlertDescription>
                      {result.flagged
                        ? "Arithmetic contradictions between declared tax filings and independent third-party records suggest elevated shadow economy exposure."
                        : "Cross-document reconciliation indicates operations align consistently with declared tax and labor filings."}
                    </AlertDescription>
                  </Alert>

                  {/* 7 Forensic Contradiction Signals Table / Grid */}
                  {result.signals && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          7 Forensic Contradiction Signals (Layer A)
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {result.flaggedCount} of {result.applicableCount} flagged
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-1">
                        {result.signals.map((sig) => (
                          <div
                            key={sig.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-md border text-xs gap-1 sm:gap-4 transition-colors ${
                              !sig.applicable
                                ? "opacity-50 bg-muted/20 border-dashed"
                                : sig.flagged
                                ? "border-destructive/40 bg-destructive/5"
                                : "bg-card border-border/80"
                            }`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{sig.name}</span>
                                <span className="text-[10px] text-muted-foreground">[{sig.category}]</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {sig.flagged ? sig.flagDescription : sig.cleanDescription}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <span className="font-mono font-bold text-xs">{sig.formatted}</span>
                              <Badge
                                variant={!sig.applicable ? "outline" : sig.flagged ? "destructive" : "secondary"}
                                className="text-[10px] py-0 h-5"
                              >
                                {!sig.applicable ? "Exempt" : sig.flagged ? "Flagged" : "Clean"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reportNotes && (
                    <Alert>
                      <NotebookPen />
                      <AlertTitle>Report notes (Gemini)</AlertTitle>
                      <AlertDescription>{reportNotes}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <span className="text-xs text-muted-foreground">
                      Generated {formatDateTime(result.generatedAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={handleCalculate}>
                        <RefreshCw data-icon="inline-start" />
                        Recalculate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownloadPdf}
                        disabled={pdfStatus === "loading"}
                      >
                        {pdfStatus === "loading" ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <Download data-icon="inline-start" />
                        )}
                        {pdfStatus === "loading" ? "Generating report..." : "Download PDF Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <FactRow icon={Landmark} label="STIR" value={business.stir} />
              <FactRow icon={Users} label="Employees" value={business.employees} />
              <FactRow
                icon={CalendarDays}
                label="Registered"
                value={formatDate(business.registered)}
              />
              <FactRow
                icon={Wallet}
                label="Declared Revenue"
                value={formatUZS(business.revenue)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Region Context</CardTitle>
              <CardDescription>{region.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Progress value={region.shadowIndex}>
                <ProgressLabel>Shadow Index</ProgressLabel>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                  {region.shadowIndex} / 100
                </span>
              </Progress>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Tier</span>
                <Badge variant={indexTier.variant}>{indexTier.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Quarterly Trend</span>
                <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                  <RegionTrendIcon className="size-3.5" />
                  {Math.abs(region.delta).toFixed(1)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                render={<Link to={`/regions/${region.id}`} />}
                nativeButton={false}
              >
                View region details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
