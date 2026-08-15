from django.db import models

class Business(models.Model):
    SECTOR_CHOICES = [
        ('retail', 'Retail & Groceries'),
        ('food_service', 'Food Service & Restaurants'),
        ('services', 'Professional & Consumer Services'),
        ('trade', 'Wholesale & Trade'),
        ('construction', 'Construction & Contracting'),
    ]

    business_id = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    sector = models.CharField(max_length=50, choices=SECTOR_CHOICES, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    registered = models.BooleanField(default=True)
    registration_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Businesses'
        ordering = ['business_id']

    def __str__(self):
        return f"{self.business_id} - {self.name} ({self.district})"


class TaxFiling(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='tax_filings')
    month = models.CharField(max_length=7, db_index=True)  # Format: YYYY-MM
    declared_revenue = models.DecimalField(max_digits=16, decimal_places=2)  # UZS
    declared_employees = models.IntegerField(default=1)
    tax_paid = models.DecimalField(max_digits=16, decimal_places=2, default=0)

    class Meta:
        ordering = ['-month']
        unique_together = ('business', 'month')

    def __str__(self):
        return f"{self.business.business_id} Tax ({self.month}): {self.declared_revenue:,} UZS"


class TransactionSignal(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='transaction_signals')
    month = models.CharField(max_length=7, db_index=True)  # Format: YYYY-MM
    pos_ewallet_volume = models.DecimalField(max_digits=16, decimal_places=2)  # UZS
    transaction_count = models.IntegerField(default=0)
    avg_transaction_size = models.DecimalField(max_digits=16, decimal_places=2, default=0)

    class Meta:
        ordering = ['-month']
        unique_together = ('business', 'month')

    def __str__(self):
        return f"{self.business.business_id} Signals ({self.month}): {self.pos_ewallet_volume:,} UZS"


class MarketplaceListing(models.Model):
    listing_id = models.CharField(max_length=30, unique=True)
    seller_name = models.CharField(max_length=255)
    matched_business = models.ForeignKey(
        Business, on_delete=models.SET_NULL, null=True, blank=True, related_name='marketplace_listings'
    )
    platform = models.CharField(max_length=50)  # e.g., OLX, Instagram, Telegram, Uzum
    est_monthly_ad_spend = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    follower_count = models.IntegerField(default=0)

    def __str__(self):
        status = f"Matched {self.matched_business.business_id}" if self.matched_business else "UNREGISTERED SELLER"
        return f"{self.listing_id} ({self.platform}): {self.seller_name} [{status}]"


class RiskScore(models.Model):
    TIER_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
    ]

    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name='risk_score')
    gap_ratio = models.FloatField(default=1.0)
    z_score = models.FloatField(default=0.0)
    risk_score = models.FloatField(default=0.0)  # Normalized 0.0 – 1.0
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default='low', db_index=True)
    sector_avg_gap = models.FloatField(default=1.0)
    est_undeclared_min = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    est_undeclared_max = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    report_text = models.TextField(blank=True, null=True)
    report_generated_at = models.DateTimeField(null=True, blank=True)
    last_calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-risk_score', '-gap_ratio']

    def __str__(self):
        return f"{self.business.business_id} - Score: {self.risk_score:.2f} ({self.tier.upper()})"
