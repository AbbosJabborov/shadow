from rest_framework import serializers
from .models import Business, TaxFiling, TransactionSignal, MarketplaceListing, RiskScore

class TaxFilingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxFiling
        fields = ['month', 'declared_revenue', 'declared_employees', 'tax_paid']

class TransactionSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionSignal
        fields = ['month', 'pos_ewallet_volume', 'transaction_count', 'avg_transaction_size']

class MarketplaceListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceListing
        fields = ['listing_id', 'seller_name', 'platform', 'est_monthly_ad_spend', 'follower_count']

class RiskScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskScore
        fields = [
            'gap_ratio', 'z_score', 'risk_score', 'tier', 'sector_avg_gap',
            'est_undeclared_min', 'est_undeclared_max', 'report_text', 'report_generated_at'
        ]

class BusinessListSerializer(serializers.ModelSerializer):
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    declared_revenue = serializers.SerializerMethodField()
    declared_employees = serializers.SerializerMethodField()
    observed_volume = serializers.SerializerMethodField()
    transaction_count = serializers.SerializerMethodField()
    gap_ratio = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()
    tier = serializers.SerializerMethodField()
    z_score = serializers.SerializerMethodField()
    est_undeclared_min = serializers.SerializerMethodField()
    est_undeclared_max = serializers.SerializerMethodField()
    has_report = serializers.SerializerMethodField()

    class Meta:
        model = Business
        fields = [
            'id', 'business_id', 'name', 'sector', 'sector_display', 'district',
            'registered', 'registration_date', 'declared_revenue', 'declared_employees',
            'observed_volume', 'transaction_count', 'gap_ratio', 'risk_score',
            'tier', 'z_score', 'est_undeclared_min', 'est_undeclared_max', 'has_report'
        ]

    def get_declared_revenue(self, obj):
        tax = obj.tax_filings.first()
        return float(tax.declared_revenue) if tax else 0.0

    def get_declared_employees(self, obj):
        tax = obj.tax_filings.first()
        return tax.declared_employees if tax else 0

    def get_observed_volume(self, obj):
        sig = obj.transaction_signals.first()
        return float(sig.pos_ewallet_volume) if sig else 0.0

    def get_transaction_count(self, obj):
        sig = obj.transaction_signals.first()
        return sig.transaction_count if sig else 0

    def get_gap_ratio(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return rs.gap_ratio if rs else 1.0

    def get_risk_score(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return rs.risk_score if rs else 0.0

    def get_tier(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return rs.tier if rs else 'low'

    def get_z_score(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return rs.z_score if rs else 0.0

    def get_est_undeclared_min(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return float(rs.est_undeclared_min) if rs else 0.0

    def get_est_undeclared_max(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return float(rs.est_undeclared_max) if rs else 0.0

    def get_has_report(self, obj):
        rs = getattr(obj, 'risk_score', None)
        return bool(rs and rs.report_text)


class BusinessDetailSerializer(serializers.ModelSerializer):
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)
    tax_filings = TaxFilingSerializer(many=True, read_only=True)
    transaction_signals = TransactionSignalSerializer(many=True, read_only=True)
    marketplace_listings = MarketplaceListingSerializer(many=True, read_only=True)
    risk_score = RiskScoreSerializer(read_only=True)

    class Meta:
        model = Business
        fields = [
            'id', 'business_id', 'name', 'sector', 'sector_display', 'district',
            'registered', 'registration_date', 'tax_filings', 'transaction_signals',
            'marketplace_listings', 'risk_score'
        ]
