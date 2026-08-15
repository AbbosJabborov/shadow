from django.db.models import Sum, Avg, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Business, TaxFiling, TransactionSignal, RiskScore
from .serializers import BusinessListSerializer, BusinessDetailSerializer
from .scoring import calculate_anomaly_scores
from .llm_report import generate_business_report

class BusinessListView(APIView):
    """
    Returns filtered and sorted list of monitored business entities.
    Supports filtering by tier, district, sector, registered status, search query.
    """
    def get(self, request):
        qs = Business.objects.select_related('risk_score').prefetch_related('tax_filings', 'transaction_signals').all()

        tier = request.query_params.get('tier')
        if tier in ['low', 'medium', 'high']:
            qs = qs.filter(risk_score__tier=tier)

        district = request.query_params.get('district')
        if district:
            qs = qs.filter(district__iexact=district)

        sector = request.query_params.get('sector')
        if sector:
            qs = qs.filter(sector=sector)

        registered = request.query_params.get('registered')
        if registered is not None:
            is_reg = registered.lower() in ('true', '1')
            qs = qs.filter(registered=is_reg)

        search = request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(business_id__icontains=search) |
                Q(district__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-risk_score')
        if ordering == '-risk_score':
            qs = qs.order_by('-risk_score__risk_score', '-risk_score__gap_ratio')
        elif ordering == 'risk_score':
            qs = qs.order_by('risk_score__risk_score')
        elif ordering == '-gap_ratio':
            qs = qs.order_by('-risk_score__gap_ratio')
        elif ordering == 'business_id':
            qs = qs.order_by('business_id')

        serializer = BusinessListSerializer(qs, many=True)
        return Response(serializer.data)


class BusinessDetailView(APIView):
    """
    Returns full details for a single business entity.
    """
    def get(self, request, business_id):
        try:
            b = Business.objects.select_related('risk_score').prefetch_related(
                'tax_filings', 'transaction_signals', 'marketplace_listings'
            ).get(business_id=business_id)
        except Business.DoesNotExist:
            return Response({"error": "Business not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BusinessDetailSerializer(b)
        return Response(serializer.data)


class AnalyzeView(APIView):
    """
    Runs or recalculates anomaly scoring engine across all businesses.
    """
    def post(self, request):
        result = calculate_anomaly_scores()
        return Response({
            "message": "Anomaly scoring completed successfully.",
            "data": result
        })


class ReportView(APIView):
    """
    Returns or triggers AI report generation for a business.
    """
    def get(self, request, business_id):
        force = request.query_params.get('force', 'false').lower() in ('true', '1')
        result = generate_business_report(business_id, force_regenerate=force)
        if "error" in result:
            return Response(result, status=result.get("status", 400))
        return Response(result)

    def post(self, request, business_id):
        result = generate_business_report(business_id, force_regenerate=True)
        if "error" in result:
            return Response(result, status=result.get("status", 400))
        return Response(result)


class DistrictSummaryView(APIView):
    """
    Aggregates informal-economy indicators and average gap ratios per district for the Heatmap.
    Formula: average gap_ratio weighted by observed revenue, and risk tier breakdown.
    """
    def get(self, request):
        districts = ["Qarshi", "Shahrisabz", "Kitob", "Koson", "G'uzor"]
        results = []

        for dist in districts:
            businesses = Business.objects.filter(district=dist).select_related('risk_score').prefetch_related('tax_filings', 'transaction_signals')
            count = businesses.count()
            if count == 0:
                continue

            total_declared = sum(
                float(b.tax_filings.first().declared_revenue)
                for b in businesses if b.tax_filings.first()
            )
            total_observed = sum(
                float(b.transaction_signals.first().pos_ewallet_volume)
                for b in businesses if b.transaction_signals.first()
            )

            high_count = businesses.filter(risk_score__tier='high').count()
            med_count = businesses.filter(risk_score__tier='medium').count()
            low_count = businesses.filter(risk_score__tier='low').count()
            unregistered_count = businesses.filter(registered=False).count()

            # Weighted gap ratio
            weighted_gap = (total_observed / total_declared) if total_declared > 0 else 1.0
            # Estimated informal economy rate %
            informal_pct = round(max(0.0, ((total_observed - total_declared) / total_observed) * 100), 1) if total_observed > 0 else 0.0

            results.append({
                "district": dist,
                "total_businesses": count,
                "total_declared": total_declared,
                "total_observed": total_observed,
                "weighted_gap_ratio": round(weighted_gap, 2),
                "informal_economy_pct": informal_pct,
                "high_risk_count": high_count,
                "medium_risk_count": med_count,
                "low_risk_count": low_count,
                "unregistered_count": unregistered_count,
            })

        # Sort districts by informal economy percentage descending
        results.sort(key=lambda x: x["informal_economy_pct"], reverse=True)
        return Response(results)


class StatsOverviewView(APIView):
    """
    System-wide KPI headline stats for dashboard header cards.
    """
    def get(self, request):
        total_businesses = Business.objects.count()
        high_risk_count = RiskScore.objects.filter(tier='high').count()
        med_risk_count = RiskScore.objects.filter(tier='medium').count()
        low_risk_count = RiskScore.objects.filter(tier='low').count()
        unregistered_count = Business.objects.filter(registered=False).count()

        total_declared = TaxFiling.objects.aggregate(total=Sum('declared_revenue'))['total'] or 0
        total_observed = TransactionSignal.objects.aggregate(total=Sum('pos_ewallet_volume'))['total'] or 0

        est_shadow_volume = max(0, float(total_observed) - float(total_declared))
        avg_gap_ratio = RiskScore.objects.aggregate(avg=Avg('gap_ratio'))['avg'] or 1.0

        return Response({
            "total_businesses": total_businesses,
            "high_risk_count": high_risk_count,
            "medium_risk_count": med_risk_count,
            "low_risk_count": low_risk_count,
            "unregistered_count": unregistered_count,
            "total_declared_volume": float(total_declared),
            "total_observed_volume": float(total_observed),
            "est_shadow_volume": est_shadow_volume,
            "avg_gap_ratio": round(float(avg_gap_ratio), 2),
        })
