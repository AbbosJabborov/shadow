import numpy as np
from django.utils import timezone
from .models import Business, TaxFiling, TransactionSignal, RiskScore

def calculate_anomaly_scores():
    """
    Executes sector-relative anomaly detection algorithm across all businesses.
    Updates or creates RiskScore records for each business.
    """
    businesses = Business.objects.all().prefetch_related('tax_filings', 'transaction_signals')
    if not businesses.exists():
        return {"updated_count": 0, "status": "no_data"}

    # Aggregate latest filing and signals per business
    data = []
    for b in businesses:
        latest_tax = b.tax_filings.first()
        latest_sig = b.transaction_signals.first()

        declared_rev = float(latest_tax.declared_revenue) if latest_tax and latest_tax.declared_revenue > 0 else 0.0
        observed_vol = float(latest_sig.pos_ewallet_volume) if latest_sig else 0.0

        if declared_rev > 0:
            gap = observed_vol / declared_rev
        else:
            # If no declared revenue but positive observed volume, massive gap
            gap = 10.0 if observed_vol > 0 else 1.0

        data.append({
            "business": b,
            "sector": b.sector,
            "registered": b.registered,
            "declared_rev": declared_rev,
            "observed_vol": observed_vol,
            "gap_ratio": gap,
        })

    # Group by sector to calculate sector mean and std
    sector_gaps = {}
    for item in data:
        sec = item["sector"]
        if sec not in sector_gaps:
            sector_gaps[sec] = []
        sector_gaps[sec].append(item["gap_ratio"])

    sector_stats = {}
    for sec, gaps in sector_gaps.items():
        arr = np.array(gaps)
        mean_val = float(np.mean(arr)) if len(arr) > 0 else 1.0
        std_val = float(np.std(arr)) if len(arr) > 0 else 0.5
        # Avoid division by zero
        if std_val < 0.01:
            std_val = 0.5
        sector_stats[sec] = {"mean": mean_val, "std": std_val}

    updated_scores = []
    for item in data:
        b = item["business"]
        sec = item["sector"]
        gap = item["gap_ratio"]
        stats = sector_stats.get(sec, {"mean": 1.0, "std": 0.5})

        # Anomaly scoring math
        z = (gap - stats["mean"]) / stats["std"]
        # Normalize z to 0 - 1
        clamped_z = max(0.0, min(z, 5.0))
        risk_score = round(clamped_z / 5.0, 4)

        # Unregistered business check override
        if not b.registered:
            risk_score = max(risk_score, 0.95)

        # Risk tiering
        if risk_score >= 0.65:
            tier = 'high'
        elif risk_score >= 0.30:
            tier = 'medium'
        else:
            tier = 'low'

        # Estimated undeclared revenue range
        raw_gap = max(0.0, item["observed_vol"] - item["declared_rev"])
        est_min = round(raw_gap * 0.85, 2)
        est_max = round(raw_gap * 1.15, 2)

        risk_obj, created = RiskScore.objects.update_or_create(
            business=b,
            defaults={
                "gap_ratio": round(gap, 2),
                "z_score": round(z, 2),
                "risk_score": risk_score,
                "tier": tier,
                "sector_avg_gap": round(stats["mean"], 2),
                "est_undeclared_min": est_min,
                "est_undeclared_max": est_max,
                "last_calculated_at": timezone.now(),
            }
        )
        updated_scores.append(risk_obj)

    return {
        "updated_count": len(updated_scores),
        "status": "success",
        "sector_stats": sector_stats
    }
