# Shadow Economy Radar — Technical Documentation

AI platform estimating informal/undeclared economic activity by cross-referencing declared tax data against behavioral signals (transactions, marketplace activity).

---

## 1. Architecture

```
[Mock Data: 3 CSV/JSON tables]
        │
        ▼
[Data Merge Layer] — joins on business_id
        │
        ▼
[Anomaly Detection] — statistical scoring (declared vs actual)
        │
        ▼
[Risk Tiering] — low / medium / high
        │
        ▼
[LLM Report Generator] — plain-language risk report per flagged business
        │
        ▼
[Dashboard] — heatmap + business list + report cards
```

---

## 2. Data Schema

Three tables, linked by `business_id`. Keep IDs consistent across all three so joins are trivial.

### 2.1 `business_registry`
Static reference table.

| Field | Type | Example |
|---|---|---|
| business_id | string | `QD-0001` |
| name | string | `Baraka Savdo MChJ` |
| sector | enum | `retail`, `food_service`, `services`, `trade`, `construction` |
| district | string | `Qarshi`, `Shahrisabz`, `Kitob` |
| registered | bool | `true` / `false` (unregistered = auto high-risk) |
| registration_date | date | `2022-03-14` |

### 2.2 `tax_filings`
Declared financial data, monthly.

| Field | Type | Example |
|---|---|---|
| business_id | string | `QD-0001` |
| month | string | `2026-06` |
| declared_revenue | number (UZS) | `45,000,000` |
| declared_employees | int | `4` |
| tax_paid | number | `2,250,000` |

### 2.3 `transaction_signals`
Behavioral/observed data — the "ground truth" proxy.

| Field | Type | Example |
|---|---|---|
| business_id | string | `QD-0001` |
| month | string | `2026-06` |
| pos_ewallet_volume | number (UZS) | `128,000,000` |
| transaction_count | int | `1,340` |
| avg_transaction_size | number | `95,500` |

### 2.4 `marketplace_listings` (optional stretch layer)
Detects sellers with no registry match at all.

| Field | Type | Example |
|---|---|---|
| listing_id | string | `ML-2291` |
| seller_name | string | `Shoxrux Electronics` |
| matched_business_id | string or null | `null` |
| platform | string | `OLX`, `Instagram` |
| est_monthly_ad_spend | number | `800,000` |
| follower_count | int | `12,400` |

**Linking rule:** `business_id` is the join key across tables 2.1–2.3. `marketplace_listings.matched_business_id = null` means the seller has zero registry footprint → automatic flag regardless of financial ratios.

---

## 3. Mock Data Generation

Generate ~150–300 businesses. Recommended distribution for a convincing demo:
- 70% "normal" — declared revenue tracks transaction volume within ±15%
- 20% "moderate gap" — transaction volume 1.5x–3x declared revenue
- 10% "severe gap" — transaction volume 4x+ declared revenue, or unregistered marketplace sellers with no tax filing at all

Python sketch:

```python
import random, csv

sectors = ["retail", "food_service", "services", "trade", "construction"]
districts = ["Qarshi", "Shahrisabz", "Kitob", "Koson", "G'uzor"]

def gen_business(i, profile):
    declared = random.randint(20_000_000, 60_000_000)
    if profile == "normal":
        actual = declared * random.uniform(0.9, 1.15)
    elif profile == "moderate":
        actual = declared * random.uniform(1.5, 3.0)
    else:  # severe
        actual = declared * random.uniform(4.0, 8.0)
    return {
        "business_id": f"QD-{i:04d}",
        "sector": random.choice(sectors),
        "district": random.choice(districts),
        "declared_revenue": round(declared),
        "pos_ewallet_volume": round(actual),
    }
```

Assign profile weights 70/20/10 when looping. Keep it deterministic (seeded) so the demo is reproducible.

---

## 4. Detection Pipeline

### 4.1 Feature engineering
Per business per month:

- `gap_ratio = pos_ewallet_volume / declared_revenue`
- `revenue_per_employee = declared_revenue / declared_employees` (flag if implausibly low)
- `registry_mismatch = 1 if marketplace seller has no matched_business_id else 0`

### 4.2 Anomaly scoring
Simple, explainable, no training required — good for a jury demo since you can show the math live.

```
z = (gap_ratio - mean(gap_ratio across sector)) / std(gap_ratio across sector)
risk_score = clip(z, 0, 5) / 5   # normalize 0–1
```

Compare within-sector, not globally — a construction business and a retail kiosk have naturally different declared-vs-actual patterns.

### 4.3 Risk tiering

| risk_score | Tier |
|---|---|
| 0.0 – 0.3 | Low |
| 0.3 – 0.65 | Medium |
| 0.65 – 1.0 | High |
| any `registry_mismatch = 1` | High (override) |

---

## 5. Report Generation (LLM layer)

Pass only the *derived features*, not raw tables, to keep prompts small and outputs consistent.

**Prompt template:**

```
System: You are a financial compliance analyst generating a concise risk
report for a government economic monitoring dashboard. Be factual, avoid
accusatory language, present findings as indicators requiring review.

User: Generate a risk report for the following business.

business_id: {business_id}
name: {name}
sector: {sector}
district: {district}
declared_monthly_revenue: {declared_revenue}
observed_transaction_volume: {pos_ewallet_volume}
gap_ratio: {gap_ratio}
sector_average_gap_ratio: {sector_avg}
risk_score: {risk_score}
risk_tier: {tier}

Output format:
1. Summary (2 sentences)
2. Key indicator(s)
3. Estimated undeclared revenue range
4. Recommended action
```

Keep `max_tokens` low (~250) — reports should be short enough to fit in a dashboard card.

---

## 6. Example Generated Report

> **Business:** Baraka Savdo MChJ (QD-0001) — Retail, Qarshi district
> **Risk Tier:** High (score: 0.82)
>
> **Summary:** Baraka Savdo MChJ shows observed transaction volume significantly exceeding declared tax revenue for June 2026. This pattern places it well above the sector average gap ratio for retail businesses in Qarshi district.
>
> **Key Indicators:**
> - Declared revenue: 45,000,000 UZS/month
> - Observed transaction volume: 128,000,000 UZS/month
> - Gap ratio: 2.84x (sector average: 1.1x)
>
> **Estimated undeclared revenue:** approximately 75,000,000–85,000,000 UZS/month
>
> **Recommended action:** Flag for manual tax audit review. Cross-check declared employee count against observed transaction frequency to assess capacity mismatch.

---

## 7. Pipeline / API Summary

| Step | Endpoint (suggested) | Input | Output |
|---|---|---|---|
| Merge + score | `POST /analyze` | date range | list of businesses with risk_score, tier |
| Report | `POST /report/:business_id` | business_id | LLM-generated report text |
| District rollup | `GET /districts/summary` | — | aggregated informal-economy % per district (for heatmap) |

**District informal-economy estimate** (for the heatmap): average `gap_ratio` across all businesses in a district, weighted by declared_revenue, expressed as a %.

---

## 8. Suggested Stack

- Backend: FastAPI or Express — fast to stand up, easy mock-data seeding
- Anomaly scoring: plain Python/pandas (no ML training needed — avoids fragile-model risk during demo)
- LLM calls: Claude API, one call per flagged business, cached so re-demos don't re-generate
- Frontend: React + a heatmap lib (deck.gl or simple choropleth SVG) + report cards
