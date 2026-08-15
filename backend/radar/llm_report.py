import os
from django.utils import timezone
from .models import Business, RiskScore

def generate_business_report(business_id: str, force_regenerate: bool = False) -> dict:
    """
    Generates and caches an AI financial compliance risk report for a given business.
    Works offline with deterministic rule-based synthesis or with LLM API if key is present.
    """
    try:
        business = Business.objects.select_related('risk_score').prefetch_related('tax_filings', 'transaction_signals').get(business_id=business_id)
    except Business.DoesNotExist:
        return {"error": f"Business {business_id} not found", "status": 404}

    risk_obj = getattr(business, 'risk_score', None)
    if not risk_obj:
        return {"error": "Risk score not calculated yet. Run analysis first.", "status": 400}

    # Return cached report if available and not forced
    if risk_obj.report_text and not force_regenerate:
        return {
            "business_id": business.business_id,
            "name": business.name,
            "report_text": risk_obj.report_text,
            "generated_at": risk_obj.report_generated_at,
            "cached": True,
        }

    latest_tax = business.tax_filings.first()
    latest_sig = business.transaction_signals.first()

    declared_rev = float(latest_tax.declared_revenue) if latest_tax else 0
    employees = latest_tax.declared_employees if latest_tax else 1
    observed_vol = float(latest_sig.pos_ewallet_volume) if latest_sig else 0
    tx_count = latest_sig.transaction_count if latest_sig else 0
    gap = risk_obj.gap_ratio
    tier = risk_obj.tier
    score = risk_obj.risk_score
    sector_avg = risk_obj.sector_avg_gap

    # Format values for display
    declared_fmt = f"{declared_rev:,.0f} UZS"
    observed_fmt = f"{observed_vol:,.0f} UZS"
    est_min_fmt = f"{float(risk_obj.est_undeclared_min):,.0f} UZS"
    est_max_fmt = f"{float(risk_obj.est_undeclared_max):,.0f} UZS"

    report_content = ""

    # Check for live Claude API key
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if anthropic_key:
        try:
            import requests
            prompt = f"""You are a financial compliance analyst generating a concise risk report for a government economic monitoring dashboard. Be factual, avoid accusatory language, present findings as indicators requiring review.

Generate a risk report for the following business:
business_id: {business.business_id}
name: {business.name}
sector: {business.get_sector_display()}
district: {business.district}
declared_monthly_revenue: {declared_fmt}
observed_transaction_volume: {observed_fmt}
gap_ratio: {gap}x
sector_average_gap_ratio: {sector_avg}x
risk_score: {score}
risk_tier: {tier.upper()}

Output format exactly:
1. Summary (2 sentences)
2. Key Indicator(s)
3. Estimated Undeclared Revenue Range
4. Recommended Action"""

            res = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": anthropic_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=8
            )
            if res.status_code == 200:
                report_content = res.json()["content"][0]["text"]
        except Exception:
            report_content = ""

    # Fallback to rich, compliant structured synthesis if no API or offline
    if not report_content:
        if not business.registered:
            report_content = f"""1. Summary
{business.name} ({business.business_id}) operates actively in {business.district} district with observed digital POS/e-wallet transactions of {observed_fmt}, but lacks formal business registry identification. This complete absence of tax filings indicates 100% undeclared economic operations.

2. Key Indicator(s)
• Registration Status: Unregistered entity (Automatic Flag)
• Observed Monthly Digital Volume: {observed_fmt} across {tx_count:,} recorded transactions
• Declared Tax Revenue: 0 UZS (Zero filings recorded)

3. Estimated Undeclared Revenue Range
Approximately {observed_fmt} per month.

4. Recommended Action
Issue an immediate field compliance summons to verify physical business premises in {business.district}. Mandate formal enterprise registration with the State Tax Committee (DSQ) and retroactive transaction settlement."""
        elif tier == 'high':
            report_content = f"""1. Summary
{business.name} ({business.business_id}) shows observed transaction volume significantly exceeding declared tax revenue for the current reporting period. The observed gap ratio of {gap:.2f}x places this enterprise {((gap/sector_avg - 1)*100):.0f}% above the {business.get_sector_display()} sector average in {business.district}.

2. Key Indicator(s)
• Declared Revenue: {declared_fmt}/month ({employees} registered employee{'s' if employees > 1 else ''})
• Observed POS/E-wallet Volume: {observed_fmt}/month ({tx_count:,} transactions)
• Gap Ratio: {gap:.2f}x (Sector average: {sector_avg:.2f}x, Z-Score: {risk_obj.z_score:+.2f})
• Declared Revenue Per Employee: {declared_rev/max(1, employees):,.0f} UZS/month

3. Estimated Undeclared Revenue Range
Approximately {est_min_fmt} – {est_max_fmt} per month.

4. Recommended Action
Flag for Tier-1 targeted tax audit review. Cross-reference declared employee count ({employees}) against observed transaction throughput ({tx_count:,} txs) to assess capacity distortion and investigate potential undeclared merchant terminals."""
        elif tier == 'medium':
            report_content = f"""1. Summary
{business.name} exhibits moderate variance between declared tax revenue and observed digital payment throughput in {business.district}. While within operable industry thresholds, the observed gap ratio of {gap:.2f}x warrants secondary administrative monitoring.

2. Key Indicator(s)
• Declared Revenue: {declared_fmt}/month
• Observed Digital Volume: {observed_fmt}/month
• Gap Ratio: {gap:.2f}x (Sector baseline: {sector_avg:.2f}x)

3. Estimated Undeclared Revenue Range
Approximately {est_min_fmt} – {est_max_fmt} per month.

4. Recommended Action
Maintain periodic electronic monitoring. Issue an automated notification requesting reconciliation of digital payment settlement accounts prior to next quarterly filing."""
        else:
            report_content = f"""1. Summary
{business.name} demonstrates high financial compliance in {business.district}. Declared revenues closely correlate with digital transaction volumes within acceptable sector variations.

2. Key Indicator(s)
• Declared Revenue: {declared_fmt}/month
• Observed Digital Volume: {observed_fmt}/month
• Gap Ratio: {gap:.2f}x (Sector baseline: {sector_avg:.2f}x)

3. Estimated Undeclared Revenue Range
Negligible (< 5% discrepancy within normal cash/digital split variance).

4. Recommended Action
No audit action required. Entity maintained in standard low-risk surveillance cohort."""

    # Save to database
    risk_obj.report_text = report_content
    risk_obj.report_generated_at = timezone.now()
    risk_obj.save(update_fields=['report_text', 'report_generated_at'])

    return {
        "business_id": business.business_id,
        "name": business.name,
        "report_text": report_content,
        "generated_at": risk_obj.report_generated_at,
        "cached": False,
    }
