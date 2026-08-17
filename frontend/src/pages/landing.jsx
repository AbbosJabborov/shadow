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
    name: "AI & Pipeline Engineer",
    role: "AI & LLM Pipeline Architecture",
    tag: "CODER",
    avatarBg: "from-indigo-500/20 to-blue-500/20",
    initials: "AI",
    contribution:
      "Engineered the Gemini 3.6 Flash latent reasoning pipeline, econometric prompt synthesis, and structured JSON output validators.",
    skills: ["Gemini 3.6 Flash", "Python", "Prompt Engineering", "JSON Schemas"],
  },
  {
    name: "Full-Stack System Architect",
    role: "Platform Architecture & Integration",
    tag: "CODER",
    avatarBg: "from-emerald-500/20 to-teal-500/20",
    initials: "FS",
    contribution:
      "Designed the high-performance React 19 / Vite system, multi-region state management, and backend Express API gateway.",
    skills: ["React 19", "Vite", "Node.js / Express", "Tailwind CSS v4"],
  },
  {
    name: "Frontend & PDF Engineer",
    role: "Data Visualization & jsPDF Engine",
    tag: "CODER",
    avatarBg: "from-cyan-500/20 to-blue-500/20",
    initials: "FE",
    contribution:
      "Implemented client-side jsPDF automated audit dossier generation, Recharts analytics, and dynamic interactive filters.",
    skills: ["jsPDF", "Recharts", "Base UI", "Interactive State"],
  },
  {
    name: "Macroeconomic Researcher",
    role: "MIMIC Modeling & Econometrics",
    tag: "ECON RESEARCHER",
    avatarBg: "from-amber-500/20 to-orange-500/20",
    initials: "ER",
    contribution:
      "Formulated the Schneider MIMIC structural equations, 11 macroeconomic cause vectors, and regional calibration models for Uzbekistan.",
    skills: ["Schneider MIMIC", "Econometric Modeling", "Structural Equations", "Fiscal Analysis"],
  },
  {
    name: "Product & UI/UX Designer",
    role: "Design Systems & Visual Strategy",
    tag: "DESIGNER",
    avatarBg: "from-purple-500/20 to-pink-500/20",
    initials: "UX",
    contribution:
      "Created the monochromatic design tokens, severity ramp color scales, radar scanner interfaces, and responsive layouts.",
    skills: ["Design Systems", "Figma", "Micro-Animations", "Information Hierarchy"],
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
                MIMIC & LLM Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#about-mimic" className="transition-colors hover:text-foreground">
              What is MIMIC?
            </a>
            <a href="#causes-indicators" className="transition-colors hover:text-foreground">
              Causes & Indicators
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
                <Badge variant="outline" className="gap-1.5 px-3.5 py-1 text-xs backdrop-blur-xs bg-background/60">
                  <Sparkles className="size-3.5 text-primary" />
                  Gemini 3.6 Flash & Schneider MIMIC
                </Badge>

                <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground max-w-3xl">
                  Predicting Regional Shadow Economies with Generative AI
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  A pioneering framework fusing the classical <strong>MIMIC (Multiple Indicators Multiple Causes)</strong> latent variable model with <strong>Google Gemini reasoning</strong> to quantify, explain, and forecast unrecorded economic activity across all 14 administrative regions of Uzbekistan.
                </p>
              </div>

              {/* Metric Summary Strip */}
              <div className="grid grid-cols-3 gap-6 sm:gap-12 py-3 px-6 sm:px-12 border-y border-border/60 backdrop-blur-xs bg-background/40 rounded-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading">
                    {nationalIndex}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    National Baseline Index
                  </div>
                </div>
                <div className="border-x border-border/60 px-4 sm:px-8">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading">
                    14 / 14
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Regions Mapped
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums font-heading">
                    11 / 6
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Causes & Indicators
                  </div>
                </div>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 whitespace-nowrap shrink-0"
                >
                  <LayoutDashboardIcon className="size-4 shrink-0" />
                  <span>Explore Dashboard</span>
                </Link>
                <a
                  href="#about-mimic"
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background/80 backdrop-blur-xs px-7 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted whitespace-nowrap shrink-0"
                >
                  <BookOpen className="size-4 shrink-0" />
                  <span>MIMIC Model Deep-Dive</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECTION 1: WHAT IS THE MIMIC MODEL? */}
        <section id="about-mimic" className="py-20 border-b border-border/40 bg-secondary/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" className="flex flex-col items-center text-center gap-3 mb-16">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <BookOpen className="size-3.5" />
                Econometric Foundations
              </Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Understanding the Schneider MIMIC Paradigm
              </h2>
              <p className="text-muted-foreground max-w-3xl text-sm sm:text-base leading-relaxed">
                Because shadow economic activities are deliberately concealed from national statistical agencies, they cannot be observed directly. The <strong>MIMIC (Multiple Indicators Multiple Causes)</strong> approach, popularized by Prof. Friedrich Schneider, solves this unobservability problem through structural equation modeling.
              </p>
            </Reveal>

            {/* Explanatory 3-Pillar Cards */}
            <div className="grid gap-8 md:grid-cols-3">
              <Reveal direction="up" delay={50} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                    <Target className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    1. The Latent Variable (η)
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Rather than relying on inaccurate self-reporting surveys, the shadow economy is modeled as a continuous latent variable η that simultaneously influences and is influenced by multiple observable macroeconomic forces.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  Unobserved True State
                </div>
              </Reveal>

              <Reveal direction="up" delay={150} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                    <Sliders className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    2. Structural Causes (X)
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Exogenous drivers that push workers and firms into informal operations — including high direct/indirect tax burdens, heavy social contributions, stringent labor market rigidity, and bureaucratic licensing bottlenecks.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  11 Regional Cause Vectors
                </div>
              </Reveal>

              <Reveal direction="up" delay={250} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="size-10 rounded-lg bg-secondary flex items-center justify-center text-primary mb-4">
                    <Activity className="size-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">
                    3. Observable Traces (Y)
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Empirical footprints left behind in the official economy — excessive physical cash demand (M0/M2 ratio), industrial electricity consumption discrepancies, and missing prime-age workers from official payrolls.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-xs font-mono text-muted-foreground">
                  6 Empirical Footprints
                </div>
              </Reveal>
            </div>

            {/* Mathematical Formulation Showcase */}
            <Reveal direction="up" delay={200} className="mt-12 rounded-2xl border border-border/80 bg-card/80 p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-12 md:items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-primary" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                      Structural & Measurement Equations
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The structural equation links the latent shadow economy η to cause vectors X: <br />
                    <span className="font-mono font-semibold text-foreground">η = γ₁x₁ + γ₂x₂ + ... + γ₁₁x₁₁ + ζ</span>
                    <br />
                    The measurement equations link η to observable indicators Y: <br />
                    <span className="font-mono font-semibold text-foreground">yⱼ = λⱼη + εⱼ  (for j = 1, ..., 6)</span>
                  </p>
                </div>
                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <div className="rounded-xl bg-secondary/50 border border-border p-4 text-xs font-mono text-muted-foreground space-y-1.5">
                    <div>{"ζ ~ N(0, ψ)  [Structural Error]"}</div>
                    <div>{"ε ~ N(0, Θ_ε)  [Measurement Error]"}</div>
                    <div className="text-foreground font-semibold pt-1">Calibrated for Uzbekistan Regions</div>
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
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Layers className="size-3.5" />
                Variable Catalog
              </Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                The 11 Structural Causes & 6 Trace Indicators
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                Key macroeconomic vectors calibrated across regional registries (hover to pause).
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
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <BrainCircuit className="size-3.5" />
                The Generative AI Breakthrough
              </Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Bridging Econometrics with Large Language Models
              </h2>
              <p className="text-muted-foreground max-w-3xl text-sm sm:text-base leading-relaxed">
                Traditional econometric software computes cold numerical scores without explanatory power. By coupling the <strong>MIMIC dataset</strong> with <strong>Google Gemini</strong>, we transform raw statistics into deep qualitative diagnostics, risk rationales, and automated PDF audit dossiers.
              </p>
            </Reveal>

            {/* 3-Column Synergy Comparison */}
            <div className="grid gap-8 md:grid-cols-3">
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
                    Strictly linear covariance assumptions.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    No qualitative sector breakdown (e.g. retail vs farming).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✕</span>
                    Produces abstract index numbers with zero narrative explanation.
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
                  MIMIC + Gemini Fusion
                </h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Multi-causal non-linear reasoning across regional profiles.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Correlates regional shadow trends with monitored MCHJ companies.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Auto-generates structured executive audit reports and PDF briefs.
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
                    Identifies high-risk sectors (e.g. construction payroll).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Provides policy simulation: what if VAT compliance improves?
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    Ready for tax inspection prioritization & reform monitoring.
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
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Users className="size-3.5" />
                Hackathon Team
              </Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                The Minds Behind the Platform
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                An interdisciplinary team of 5 members: <strong>3 Software & AI Engineers</strong>, <strong>1 Macroeconomic Researcher</strong>, and <strong>1 Product Designer</strong>.
              </p>
            </Reveal>

            {/* 5 Member Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {TEAM_MEMBERS.map((member, idx) => (
                <Reveal
                  key={member.role}
                  direction="up"
                  delay={idx * 60}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all group"
                >
                  <div>
                    {/* Template Avatar / Image */}
                    <div
                      className={`relative size-20 rounded-2xl bg-gradient-to-br ${member.avatarBg} border border-border flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-inner`}
                    >
                      <div className="text-xl font-heading font-black tracking-wider text-foreground">
                        {member.initials}
                      </div>
                      <div className="absolute -bottom-2 -right-1">
                        {member.tag === "CODER" && (
                          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] shadow">
                            <Code2 className="size-3" />
                          </div>
                        )}
                        {member.tag === "ECON RESEARCHER" && (
                          <div className="size-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow">
                            <Scale className="size-3" />
                          </div>
                        )}
                        {member.tag === "DESIGNER" && (
                          <div className="size-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] shadow">
                            <Palette className="size-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center mb-3">
                      <Badge variant="secondary" className="text-[10px] font-mono uppercase mb-1.5">
                        {member.tag}
                      </Badge>
                      <h3 className="font-heading text-sm font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {member.role}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed text-center mb-4">
                      {member.contribution}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex flex-wrap gap-1 justify-center">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
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
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Regional Economic Intelligence Platform
              </Badge>
              <h2 className="font-heading text-3xl font-black tracking-tight sm:text-5xl mt-3">
                Experience the Shadow Index Platform
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg mt-2">
                Analyze regional macroeconomic causes, review flagged businesses, and generate automated AI risk reports powered by Gemini and MIMIC econometrics.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                <Link
                  to="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 whitespace-nowrap shrink-0"
                >
                  <span>Enter Platform Dashboard</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
                <Link
                  to="/businesses"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted whitespace-nowrap shrink-0"
                >
                  <BrainCircuit className="size-4 shrink-0" />
                  <span>Monitored Businesses</span>
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
