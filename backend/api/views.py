from datetime import datetime, timezone
from django.conf import settings
from django.db import connection
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import GeneratedReport
from .serializers import ReportRequestSerializer, GeneratedReportSerializer
from .services.mimic_data import get_region_mimic_data, get_all_regions_mimic_data
from .services.gemini import generate_shadow_economy_report

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint returning system status and model name.
    """
    db_status = "healthy"
    try:
        connection.ensure_connection()
    except Exception as e:
        db_status = f"unavailable ({str(e)})"

    return Response({
        "ok": True,
        "service": "shadow-backend-drf",
        "model": getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def mimic_region_data(request, region_id):
    """
    Returns MIMIC macro indicators & causes for a specific Uzbekistan region.
    """
    data = get_region_mimic_data(region_id)
    if not data:
        return Response({"error": f"Unknown regionId: {region_id}"}, status=status.HTTP_404_NOT_FOUND)
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def mimic_all_regions(request):
    """
    Returns MIMIC datasets for all 14 regions.
    """
    return Response(get_all_regions_mimic_data())

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_report_view(request):
    """
    Generates an AI-powered shadow economy risk analysis report using Gemini and MIMIC dataset,
    and persists the result in PostgreSQL.
    """
    serializer = ReportRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "error": "Missing or invalid business, region, or aiResult in request body",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    business = serializer.validated_data["business"]
    region = serializer.validated_data["region"]
    ai_result = serializer.validated_data["aiResult"]

    region_id = region.get("id")
    mimic_data = get_region_mimic_data(region_id)
    if not mimic_data:
        return Response({"error": f"Unknown regionId: {region_id}"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        report = generate_shadow_economy_report(
            business=business,
            region=region,
            ai_result=ai_result,
            mimic_data=mimic_data,
        )
        
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Persist report to PostgreSQL
        try:
            saved_report = GeneratedReport.objects.create(
                business_name=business.get("name", "Unknown"),
                business_sector=business.get("sector", "General"),
                region_id=region_id,
                region_name=region.get("name", region_id),
                business_profile=business,
                ai_screening=ai_result,
                mimic_data=mimic_data,
                notes=report.get("notes", ""),
                executive_summary=report.get("executiveSummary", ""),
                causes_analysis=report.get("causesAnalysis", ""),
                indicators_analysis=report.get("indicatorsAnalysis", ""),
                conclusion=report.get("conclusion", ""),
                estimated_index=report.get("estimatedIndex"),
                confidence_percent=report.get("confidencePercent"),
                key_risk_factors=report.get("keyRiskFactors", []),
                model_used=getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
            )
            report_id = saved_report.id
        except Exception as db_err:
            # Non-blocking fallback if DB error occurs during persistence
            report_id = None

        response_payload = {
            **report,
            "mimicData": mimic_data,
            "generatedAt": now_iso,
        }
        if report_id:
            response_payload["reportId"] = report_id

        return Response(response_payload, status=status.HTTP_200_OK)

    except Exception as exc:
        return Response({
            "error": "Report generation failed",
            "detail": str(exc)
        }, status=status.HTTP_502_BAD_GATEWAY)

class GeneratedReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows past generated reports to be viewed or listed.
    """
    queryset = GeneratedReport.objects.all()
    serializer_class = GeneratedReportSerializer
    permission_classes = [AllowAny]
