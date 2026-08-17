"""
Google Gemini API integration service with robust structured parsing and fallback.
"""
import os
import json
import logging
from typing import Dict, Any
from django.conf import settings
from .prompt import build_system_instruction, build_report_prompt

logger = logging.getLogger(__name__)

def generate_fallback_report(business: Dict[str, Any], region: Dict[str, Any], ai_result: Dict[str, Any], mimic_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    High-quality deterministic fallback synthesis when Gemini API key is not configured.
    """
    score = ai_result.get("score", 5)
    shadow_index = region.get("shadowIndex", 50)
    business_name = business.get("name", "Target Entity")
    sector = business.get("sector", "Commerce & Services")
    region_name = region.get("name", "the region")
    
    top_causes = [c["label"] for c in mimic_data.get("causes", [])[:2]]
    top_indicators = [i["label"] for i in mimic_data.get("indicators", [])[:2]]

    notes = (
        f"MIMIC econometric screening for {business_name} MCHJ in {region_name} indicates an estimated "
        f"risk profile congruent with sector baseline ({sector}). Key macro factors including {top_causes[0]} "
        f"align with an estimated risk index of {score}/10."
    )
    
    executive_summary = (
        f"{business_name} operates in the {sector} sector within {region_name}, where the composite "
        f"shadow index stands at {shadow_index}/100. Preliminary AI screening flagged an estimated "
        f"probability of {ai_result.get('probability', 50)}%. Integration of macro MIMIC causes "
        f"demonstrates localized structural pressures typical for this industry tier."
    )
    
    causes_analysis = (
        f"Analysis of structural causes identifies significant pressure from {top_causes[0]} "
        f"and {top_causes[1] if len(top_causes) > 1 else 'regulatory compliance costs'}. "
        f"In {region_name}, these drivers heighten incentives for informal revenue concealment or "
        f"unrecorded payroll transactions among small-to-medium enterprises."
    )
    
    indicators_analysis = (
        f"Observable macroeconomic indicators in the region, particularly {top_indicators[0]} "
        f"and {top_indicators[1] if len(top_indicators) > 1 else 'currency demand ratio'}, "
        f"corroborate baseline operational patterns observed for {sector} entities."
    )
    
    conclusion = (
        f"The synthesized assessment places {business_name} MCHJ at a risk index of {score}/10, "
        f"matching the screening baseline. Routine monitoring and periodic tax invoice reconciliations "
        f"are recommended."
    )
    
    key_risk_factors = [
        f"Macro pressure from {top_causes[0]}",
        f"Regional shadow activity index at {shadow_index}/100",
        f"Labor and payroll compliance exposure in {sector}",
        f"Sector-wide cash transaction prevalence",
    ]

    return {
        "notes": notes,
        "executiveSummary": executive_summary,
        "causesAnalysis": causes_analysis,
        "indicatorsAnalysis": indicators_analysis,
        "conclusion": conclusion,
        "estimatedIndex": score,
        "confidencePercent": min(95, max(60, 50 + int(ai_result.get("probability", 50) * 0.4))),
        "keyRiskFactors": key_risk_factors,
    }


def generate_shadow_economy_report(business: Dict[str, Any], region: Dict[str, Any], ai_result: Dict[str, Any], mimic_data: Dict[str, Any]) -> Dict[str, Any]:
    api_key = getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
    model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash") or "gemini-2.5-flash"

    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Generating deterministic MIMIC fallback report.")
        return generate_fallback_report(business, region, ai_result, mimic_data)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        prompt_content = build_report_prompt(business, region, ai_result, mimic_data)
        system_instruction = build_system_instruction()

        response = client.models.generate_content(
            model=model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                temperature=0.6,
            ),
        )

        text = response.text
        if not text:
            raise ValueError("Gemini returned empty response text")

        # Clean possible markdown fence ```json ... ```
        cleaned_text = text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()

        parsed = json.loads(cleaned_text)
        
        # Ensure required keys exist
        required_keys = ["notes", "executiveSummary", "causesAnalysis", "indicatorsAnalysis", "conclusion", "estimatedIndex", "confidencePercent", "keyRiskFactors"]
        for k in required_keys:
            if k not in parsed:
                raise ValueError(f"Missing required key in Gemini output: {k}")

        return parsed

    except Exception as exc:
        logger.error(f"Gemini API call failed: {exc}. Falling back to rule-based engine.")
        fallback = generate_fallback_report(business, region, ai_result, mimic_data)
        return fallback
