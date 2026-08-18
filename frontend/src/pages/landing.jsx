import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  FileText,
  Layers,
  LineChart,
  Palette,
  Scale,
  Sliders,
  Sparkles,
  Target,
  Users,
  Waves,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { Interactive3DBackground } from "@/components/interactive-3d-background"
import { getNationalIndex } from "@/lib/regions"

// Scroll reveal component for continuous slide-in / slide-out whenever scrolling
function Reveal({ children, className = "", direction = "up", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.12, rootMargin: "-30px 0px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const directionClasses = {
    up: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
    down: isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12",
    left: isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12",
    right: isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12",
    scale: isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  }

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${directionClasses[direction]} ${className}`}
    >
      {children}
    </div>
  )
}

// 11 MIMIC Causes Detailed Econometric Reference
const MIMIC_CAUSES = [
  {
    id: "direct-tax",
    title: "Direct Tax Burden",
    category: "Fiscal Burden",
    unit: "% of GDP",
    effect: "+",
    rationale:
      "High personal income and corporate profit tax rates increase the immediate financial incentive for firms and workers to conduct transactions off the official books.",
  },
  {
    id: "indirect-tax",
    title: "Indirect Tax Burden (VAT & Excise)",
    category: "Fiscal Burden",
    unit: "% of GDP",
    effect: "+",
    rationale:
      "Value Added Taxes and consumer excise duties widen the price gap between registered retail commerce and untraceable cash retail trade.",
  },
  {
    id: "social-security",
    title: "Social Security & Payroll Contributions",
    category: "Fiscal Burden",
    unit: "% of payroll",
    effect: "+",
    rationale:
      "Heavy mandatory social insurance deductions push employers toward informal 'envelope wage' agreements where official wages are recorded at minimum baselines.",
  },
  {
    id: "labor-rigidity",
    title: "Labor Market Rigidity Index",
    category: "Regulation & Institutions",
    unit: "0–100 index",
    effect: "+",
    rationale:
      "Strict hiring regulations, severance liabilities, and restrictive contract terms discourage formal hiring, incentivizing unrecorded flexible labor.",
  },
  {
    id: "bureaucratic-burden",
    title: "Bureaucratic Friction & Licensing Overhead",
    category: "Regulation & Institutions",
    unit: "0–100 index",
    effect: "+",
    rationale:
      "Lengthy permit procedures and compliance red tape make operating as an unlisted, shadow entity economically preferable for small enterprises.",
  },
  {
    id: "corruption-control",
    title: "Rule of Law & Anti-Corruption Control",
    category: "Regulation & Institutions",
    unit: "0–100 (higher = stronger)",
    effect: "-",
    rationale:
      "Transparent governance and rigorous inspection mechanisms increase both the detection probability and expected penalties for undeclared commerce.",
  },
  {
    id: "tax-morale",
    title: "Public Trust & Tax Morale",
    category: "Regulation & Institutions",
    unit: "0–100 (higher = more trust)",
    effect: "-",
    rationale:
      "When citizens and entrepreneurs perceive public expenditure as equitable and beneficial, voluntary tax compliance increases significantly.",
  },
  {
    id: "unemployment",
    title: "Official Unemployment Rate",
    category: "Macro & Labor Conditions",
    unit: "% of labor force",
    effect: "+",
    rationale:
      "Individuals without formal employment opportunities transition into informal self-employment, artisanal trade, or day labor to sustain livelihoods.",
  },
  {
    id: "self-employment",
    title: "Self-Employment Density",
    category: "Macro & Labor Conditions",
    unit: "% of workforce",
    effect: "+",
    rationale:
      "Small sole proprietors and micro-operators have higher structural discretion to underreport revenue compared to corporatized entities.",
  },
  {
    id: "inflation-rate",
    title: "Regional Inflation & Price Volatility",
    category: "Macro & Labor Conditions",
    unit: "% annual",
    effect: "+",
    rationale:
      "High inflation erodes real official income and creates incentives to hold untraceable assets or engage in barter and cash trade.",
  },
  {
    id: "gdp-per-capita",
    title: "Regional GDP Per Capita",
    category: "Macro & Labor Conditions",
    unit: "USD equivalent",
    effect: "-",
    rationale:
      "Higher economic development correlates with formal institutional banking infrastructure, digital payments, and lower reliance on informal survival economies.",
  },
]

// 6 MIMIC Indicators Observable Traces Reference
const MIMIC_INDICATORS = [
  {
    id: "currency-demand",
    title: "Currency Demand Ratio (M0 / M2)",
    category: "Monetary Traces",
    unit: "ratio",
    effect: "+",
    rationale:
      "Shadow transactions deliberately bypass banking networks. An anomalous surplus of physical currency in circulation indicates heightened unrecorded turnover.",
  },
  {
    id: "large-banknotes",
    title: "High-Denomination Banknote Circulation",
    category: "Monetary Traces",
    unit: "% of total currency",
    effect: "+",
    rationale:
      "Large bills are disproportionately hoarded for shadow settlements and unrecorded business inventory purchases rather than day-to-day retail.",
  },
  {
    id: "electricity-anomaly",
    title: "Physical Electricity Consumption Anomaly",
    category: "Physical Input",
    unit: "Index (100 = expected GDP)",
    effect: "+",
    rationale:
      "Underground industrial production still requires electric power. Grid consumption that substantially exceeds officially reported output exposes hidden manufacturing.",
  },
  {
    id: "labor-participation",
    title: "Official Labor Force Participation",
    category: "Labor Market Traces",
    unit: "%",
    effect: "-",
    rationale:
      "Workers active in unrecorded agriculture, private tutoring, or construction drop off formal national labor registry rolls.",
  },
  {
    id: "prime-male-participation",
    title: "Prime-Age Male Employment Rate",
    category: "Labor Market Traces",
    unit: "% (ages 25-54)",
    effect: "-",
    rationale:
      "Prime working-age individuals who report zero formal employment are highly likely to be engaged in informal domestic or cross-border commerce.",
  },
  {
    id: "real-gdp-growth",
    title: "Official Real GDP Growth Discrepancy",
    category: "National Output",
    unit: "%",
    effect: "-",
    rationale:
      "As resources, labor, and capital shift underground, officially recorded gross regional output displays artificial deceleration.",
  },
]

// Team Members Dataset
const TEAM_MEMBERS = [
  {
    name: "Abbos Jabborov",
    role: "Software Engineer",
    subRole: "@Tonto Studio",
    avatarBg: "from-indigo-500/20 to-blue-500/20",
    photoUrl: "/team/abbos.jpg",
    telegram: "https://t.me/claiveis",
  },
  {
    name: "Akbar Evatov",
    role: "AI/ML engineer",
    subRole: "CS Student",
    avatarBg: "from-emerald-500/20 to-teal-500/20",
    photoUrl: "/team/akbar.jpg",
    telegram: "https://t.me/Akbar_Evatov",
  },
  {
    name: "Asqar Arslonov",
    role: "Full-Stack Engineer",
    subRole: "Founder of leksika",
    avatarBg: "from-cyan-500/20 to-blue-500/20",
    photoUrl: "/team/asqar.jpg",
    telegram: "https://t.me/AsqarArslonov",
  },
  {
    name: "Asliddin Boynazarov",
    role: "Economics Researcher",
    subRole: "Researcher @ Markaziy Bank",
    avatarBg: "from-amber-500/20 to-orange-500/20",
    photoUrl: "/team/asliddin.jpg",
    telegram: "https://t.me/asliddin_boynazarov_0204",
  },
  {
    name: "Shoxrux Daminov",
    role: "Designer & Marketing",
    subRole: "American Corner lead volunteer",
    avatarBg: "from-purple-500/20 to-pink-500/20",
    photoUrl: "/team/shoxrux.jpg",
    telegram: "https://t.me/Shoxrux_Daminov",
  },
]

export default function LandingPage() {
  const nationalIndex = getNationalIndex()

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative">
      {/* Interactive 3D Neural Particle Background */}
      <Interactive3DBackground />

      {/* Background Ambience & Grids */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-subtle opacity-30" />
      <div className="fixed -top-40 -right-40 size-96 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -left-40 size-96 rounded-full bg-foreground/5 blur-3xl pointer-events-none" />

      {/* STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Waves className="size-5 animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-tight">
                Shadow Index
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Scoring & LLM Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#about-mimic" className="transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#causes-indicators" className="transition-colors hover:text-foreground">
              Regional Context
            </a>
            <a href="#llm-architecture" className="transition-colors hover:text-foreground">
              LLM Reasoning
            </a>
            <a href="#team" className="transition-colors hover:text-foreground">
              Project Team
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <ModeToggle />
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 whitespace-nowrap shrink-0"
            >
              <span>Launch Platform</span>
              <ArrowRight className="size-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 border-b border-border/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-8">
              <div className="space-y-4 max-w-4xl flex flex-col items-center">
                <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground max-w-3xl">
                  Mapping Regional Shadow Economies with{" "}
                  <span className="text-foreground">LLM Reasoning</span>
                </h1>
                <div className="rounded-2xl border border-border bg-card px-6 py-4 shadow-sm max-w-2xl mx-auto">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    A platform that scores individual firms for shadow-economy risk using seven forensic checks, then uses AI to explain the reasoning — with regional context for every region in Uzbekistan.
                  </p>
                </div>
              </div>

              {/* Metric Summary Strip */}
              <div className="w-full max-w-sm sm:max-w-none grid grid-cols-3 gap-3 sm:gap-12 py-3 px-3 sm:px-12 border-y border-border/60 bg-background/40 rounded-xl">
                <div>
                  <div className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading">
                    14 / 14
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Regions Mapped
                  </div>
                </div>
                <div className="border-x border-border/60 px-4 sm:px-8">
                  <div className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading">
                    7 / 7
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Forensic Checks per Firm
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading text-muted-foreground">
                    {nationalIndex}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Illustrative Regional Index
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg bg-foreground px-7 text-sm font-semibold text-background shadow-sm transition-all hover:bg-foreground/90 whitespace-nowrap shrink-0"
                >
                  <LayoutDashboardIcon className="size-4 shrink-0" />
                  <span>Explore Dashboard</span>
                </Link>
                <a
                  href="#about-mimic"
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background/80 px-7 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted whitespace-nowrap shrink-0"
                >
                  <BookOpen className="size-4 shrink-0" />
                  <span>How It Works</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 1: WHAT IS THE MIMIC MODEL? */}
        <section id="about-mimic" className="py-20 border-b border-border/40 bg-secondary/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-3 mb-16">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                How the Platform Works
              </h2>
              <p className="text-muted-foreground max-w-3xl text-sm sm:text-base leading-relaxed">
                The system runs every firm through a structured, multi-layer analysis. Each layer answers a different question — and no layer borrows its answer from the one before it. The result is a risk score, a confidence level, and a plain-language explanation that can be read by anyone.
              </p>
            </Reveal>

            {/* Explanatory 3-Pillar Cards */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              <Reveal direction="up" delay={50} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
                <div>
                  <div className="size-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground mb-4">
                    <Target className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    1. Forensic Contradiction Checks
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Each firm's own filings are tested against each other and against independently sourced records of the same events. A mismatch is a hard fact, not a statistical guess.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  7 checks per firm
                </div>
              </Reveal>

              <Reveal direction="up" delay={150} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
                <div>
                  <div className="size-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground mb-4">
                    <Sliders className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    2. Risk Score + Confidence
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The contradiction signals feed into a proprietary scoring system that produces two separate numbers: how likely the firm is involved in shadow activity, and how decisive the evidence is — independently of each other.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  Deterministic arithmetic
                </div>
              </Reveal>

              <Reveal direction="up" delay={250} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between hover:border-border transition-colors">
                <div>
                  <div className="size-10 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground mb-4">
                    <Activity className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    3. AI Narrative Report
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI reads the score and evidence — but has no authority to change any number. It writes a structured case narrative, citing only what the scorecards already established.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  Plain-language output
                </div>
              </Reveal>
            </div>

            <Reveal direction="up" delay={200} className="mt-12 rounded-2xl border border-border/80 bg-card/80 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-primary" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                      Proprietary Scoring Design
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Each check is weighted by how directly it contradicts the firm's own filings. The scoring system starts from a sector and region baseline, then adjusts based on what the evidence actually says — not peer averages. Risk score and confidence are computed independently so that a firm can be clearly flagged with low confidence, or clearly clean with high confidence.
                  </p>
                </div>
                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <div className="rounded-xl bg-secondary/50 border border-border p-4 text-xs font-mono text-muted-foreground space-y-1.5">
                    <div>Score → which way</div>
                    <div>Confidence → how much</div>
                    <div className="text-foreground font-semibold pt-1">Computed independently</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 2: 11 CAUSES & 6 INDICATORS ANIMATED TICKER (TITLES ONLY) */}
        <section id="causes-indicators" className="py-20 border-b border-border/40 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-3">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Regional Context Across All 14 Regions
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                Each region carries macroeconomic signals used as background context for AI narratives — not as direct inputs to firm scoring.
              </p>
            </Reveal>
          </div>

          {/* INFINITE HORIZONTAL TICKER CONTAINER WITH EDGE FADES */}
          <div className="relative w-full overflow-hidden space-y-5">
            {/* Left/Right Gradient Shadows for Seamless Infinite Blend */}
            <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-20" />

            {/* TRACK 1: 11 Structural Causes (Moving Left) */}
            <div className="w-full overflow-hidden">
              <div className="animate-marquee-left flex gap-3.5 py-1">
                {[...MIMIC_CAUSES, ...MIMIC_CAUSES].map((cause, idx) => (
                  <div
                    key={`cause-${cause.id}-${idx}`}
                    className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/90 px-4 py-2 shadow-xs backdrop-blur-xs hover:border-primary/60 hover:bg-card transition-all shrink-0 cursor-default"
                  >
                    <span className="size-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground">
                      #{(idx % MIMIC_CAUSES.length) + 1}
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {cause.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal py-0">
                      {cause.category}
                    </Badge>
                    <span className={`text-[10px] font-mono font-semibold ${cause.effect === "+" ? "text-amber-500" : "text-emerald-500"}`}>
                      {cause.effect === "+" ? "↑ Shadow" : "↓ Shadow"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TRACK 2: 6 Trace Indicators (Moving Right) */}
            <div className="w-full overflow-hidden">
              <div className="animate-marquee-right flex gap-3.5 py-1">
                {[...MIMIC_INDICATORS, ...MIMIC_INDICATORS, ...MIMIC_INDICATORS].map((ind, idx) => (
                  <div
                    key={`ind-${ind.id}-${idx}`}
                    className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/90 px-4 py-2 shadow-xs backdrop-blur-xs hover:border-cyan-500/60 hover:bg-card transition-all shrink-0 cursor-default"
                  >
                    <span className="size-6 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                      TR#{(idx % MIMIC_INDICATORS.length) + 1}
                    </span>
                    <span className="font-heading text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                      {ind.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal py-0 border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                      {ind.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {ind.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHY LLM + MIMIC IS REVOLUTIONARY */}
        <section id="llm-architecture" className="py-20 border-b border-border/40 bg-secondary/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-3 mb-16">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Numbers Are Not Enough — We Add AI Reasoning
              </h2>
              <p className="text-muted-foreground max-w-3xl text-sm sm:text-base leading-relaxed">
                The scorecard produces a number. AI turns it into a case. Crucially, the AI has no authority to change any figure — it reads the already-computed score, probability, and per-signal evidence, then writes a structured narrative explaining what the numbers mean.
              </p>
            </Reveal>

            {/* 3-Column Synergy Comparison */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              <Reveal direction="left" delay={50} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                  <LineChart className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Classical MIMIC
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    Produces a single index number. No explanation of what drives it.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    No firm-level forensic checks — works only at aggregate level.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    Can't tell you which specific firm or sector is driving the result.
                  </li>
                </ul>
              </Reveal>

              <Reveal direction="up" delay={150} className="rounded-2xl border border-primary/50 bg-card p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground font-mono text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  OUR SYSTEM
                </div>
                <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <BrainCircuit className="size-5 animate-pulse" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Scorecard + Gemini Fusion
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Runs firm-level forensic checks — same-document contradictions, not peer patterns.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Separates risk score from confidence — both computed independently.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    AI writes a plain-language narrative — without changing a single number.
                  </li>
                </ul>
              </Reveal>

              <Reveal direction="right" delay={250} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                  <FileText className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Actionable Policy Audits
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Structured reports cite which specific checks were flagged and by how much.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Regional context gives inspectors broader economic background for each case.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Exportable PDF reports ready for inspection teams and reform tracking.
                  </li>
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SECTION 4: TEAM SECTION */}
        <section id="team" className="py-20 border-b border-border/40 bg-secondary/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-3 mb-16">
              <div className="flex items-center gap-2 justify-center mb-1">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wider">Hackathon Team</span>
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                The Minds Behind the Platform
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                An interdisciplinary team of 5 members: <strong>3 Software & AI Engineers</strong>, <strong>1 Macroeconomic Researcher</strong>, and <strong>1 Product Designer</strong>.
              </p>
            </Reveal>

            {/* 5 Member Cards Grid */}
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {TEAM_MEMBERS.map((member, idx) => (
                <Reveal
                  key={member.name}
                  direction="up"
                  delay={idx * 60}
                  className="rounded-2xl border border-border/80 bg-card shadow-sm flex flex-col hover:border-primary/50 transition-all group overflow-hidden"
                >
                  {/* Photo at the top */}
                  <div
                    className={`relative w-full aspect-square bg-gradient-to-br ${member.avatarBg} flex items-center justify-center overflow-hidden bg-muted`}
                  >
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-xl font-heading font-black tracking-wider text-muted-foreground/40">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info below photo */}
                  <div className="p-4 text-center flex flex-col items-center justify-center flex-grow gap-1">
                    <h3 className="font-heading text-sm font-bold text-foreground mb-0.5">
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {member.role}
                    </p>
                    {member.subRole && (
                      <p className="text-[10px] text-muted-foreground">
                        {member.subRole}
                      </p>
                    )}
                    {member.telegram && (
                      <a
                        href={member.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-colors"
                      >
                        <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        Telegram
                      </a>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 bg-card relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Reveal direction="up">
              <Badge variant="outline" className="text-xs px-3 py-1">
                Firm-Level Risk Scoring Platform
              </Badge>
              <h2 className="font-heading text-3xl font-black tracking-tight sm:text-5xl mt-3">
                Experience the Shadow Index Platform
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg mt-2">
                Score registered firms against forensic checks, explore regional context, and generate plain-language AI risk reports — all in one place.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground hover:bg-foreground/90 px-8 text-sm font-semibold text-background shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <span>Enter Platform Dashboard</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
                <Link
                  to="/businesses"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted px-8 text-sm font-semibold text-foreground shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <BrainCircuit className="size-4 shrink-0" />
                  <span>View Monitored Businesses</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-background py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Waves className="size-4" />
              </div>
              <span className="font-heading font-semibold text-foreground">
                Shadow Index AI
              </span>
              <span className="text-xs text-muted-foreground">
                • Schneider MIMIC + Gemini 3.6 Flash
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <Link to="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/businesses" className="hover:text-foreground transition-colors">
                Businesses
              </Link>
              <a href="#about-mimic" className="hover:text-foreground transition-colors">
                What is MIMIC?
              </a>
              <a href="#causes-indicators" className="hover:text-foreground transition-colors">
                11 Causes & 6 Indicators
              </a>
              <a href="#team" className="hover:text-foreground transition-colors">
                Team
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              Built by a 5-member team (3 Coders, 1 Econ Researcher, 1 Designer).
            </p>
            <p className="text-muted-foreground">
              Illustrative research datasets calibrated for regional analysis in Uzbekistan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
