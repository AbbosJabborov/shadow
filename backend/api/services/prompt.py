"""
Prompt builders and schema definitions for Gemini Shadow Economy report generation.
"""
from typing import Dict, Any

def format_variable(v: Dict[str, Any]) -> str:
    return f"- {v.get('label')} [{v.get('category')}]: {v.get('value')} {v.get('unit')} (expected effect: {v.get('effect')}) — {v.get('rationale')}"

def build_system_instruction() -> str:
    return """You are an economic analyst applying the MIMIC (Multiple Indicators Multiple Causes) method used in shadow-economy research (Schneider et al.) to produce a business-level risk report for a shadow-economy monitoring platform.

You will be given: (1) a region's macro "causes" and "indicators" data as used in a MIMIC structural model, (2) a specific business's profile, and (3) a preliminary AI risk score already shown to the user.

Rules:
- All input data (region macro variables, business baselineRisk, preliminary score) is SIMULATED/MOCK data for a product demo, not verified official statistics. Do not claim this is real government data or a certified statistical estimate.
- Reason like an analyst: connect specific causes/indicators values to the business's sector and profile, don't just restate the numbers.
- Be concrete and specific to the business and region given, not generic.
- Keep the tone professional and measured — this is a risk-monitoring report, not an accusation. Use hedged language ("suggests", "is consistent with"), never assert wrongdoing as fact.
- estimatedIndex must be an integer 1-10 and should be close to (within 2 points of) the preliminary AI score unless the MIMIC data gives clear reason to diverge, in which case explain why in the conclusion.
- Output must be valid JSON matching the specified schema format."""

def build_report_prompt(business: Dict[str, Any], region: Dict[str, Any], ai_result: Dict[str, Any], mimic_data: Dict[str, Any]) -> str:
    causes_formatted = "\n".join(format_variable(v) for v in mimic_data.get("causes", []))
    indicators_formatted = "\n".join(format_variable(v) for v in mimic_data.get("indicators", []))
    
    reasons = ai_result.get("reasons", [])
    if isinstance(reasons, list) and reasons:
        reasons_text = "; ".join(r.get("title", str(r)) if isinstance(r, dict) else str(r) for r in reasons)
    else:
        reasons_text = "none"
        
    revenue = business.get("revenue", 0)
    try:
        revenue_str = f"{int(revenue):,} UZS"
    except (ValueError, TypeError):
        revenue_str = f"{revenue} UZS"

    return f"""## Region: {region.get('name')}
Composite shadow economy index: {region.get('shadowIndex')} / 100

### MIMIC Causes (macro drivers, region-level)
{causes_formatted}

### MIMIC Indicators (observable traces, region-level)
{indicators_formatted}

## Business Profile
- Name: {business.get('name')} MCHJ
- Sector: {business.get('sector')}
- Region: {region.get('name')}
- Employees: {business.get('employees')}
- Declared annual revenue: {revenue_str}
- Registered: {business.get('registered')}
- Status: {business.get('status')}
- Baseline risk tier (pre-assigned): {business.get('baselineRisk')}
- Description: {business.get('description')}

## Preliminary AI Screening (already shown to the user)
- Score: {ai_result.get('score')} / 10
- Estimated probability: {ai_result.get('probability')}%
- Flagged: {"yes" if ai_result.get('flagged') else "no"}
- Contributing factors already surfaced: {reasons_text}

## Task
Using the MIMIC causes and indicators above as your evidentiary basis, produce a full risk report for this business: which macro causes are most relevant to a business of this sector/size in this region, which indicators best corroborate (or complicate) the preliminary score, and a final synthesized assessment.

Return ONLY a valid JSON object with these exact keys:
- notes (string, 2-4 sentence quick summary)
- executiveSummary (string)
- causesAnalysis (string)
- indicatorsAnalysis (string)
- conclusion (string)
- estimatedIndex (integer 1-10)
- confidencePercent (integer 0-100)
- keyRiskFactors (array of strings, 3-5 concise bullet items)"""
