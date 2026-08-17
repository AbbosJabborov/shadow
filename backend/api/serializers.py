from rest_framework import serializers
from .models import GeneratedReport

class ReportRequestSerializer(serializers.Serializer):
    business = serializers.DictField(required=True)
    region = serializers.DictField(required=True)
    aiResult = serializers.DictField(required=True)

    def validate_business(self, value):
        if not value.get("sector") or not value.get("name"):
            raise serializers.ValidationError("Business must contain at least 'name' and 'sector'.")
        return value

    def validate_region(self, value):
        if not value.get("id"):
            raise serializers.ValidationError("Region must contain an 'id'.")
        return value

class GeneratedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedReport
        fields = [
            'id',
            'business_name',
            'business_sector',
            'region_id',
            'region_name',
            'business_profile',
            'ai_screening',
            'mimic_data',
            'notes',
            'executive_summary',
            'causes_analysis',
            'indicators_analysis',
            'conclusion',
            'estimated_index',
            'confidence_percent',
            'key_risk_factors',
            'model_used',
            'created_at',
        ]
