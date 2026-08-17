from django.db import models

class GeneratedReport(models.Model):
    business_name = models.CharField(max_length=255, db_index=True)
    business_sector = models.CharField(max_length=255, db_index=True)
    region_id = models.CharField(max_length=100, db_index=True)
    region_name = models.CharField(max_length=255)
    
    # Store raw input objects for complete auditability
    business_profile = models.JSONField(default=dict, help_text="Business details provided during request")
    ai_screening = models.JSONField(default=dict, help_text="Preliminary AI screening result")
    mimic_data = models.JSONField(default=dict, help_text="MIMIC causes and indicators snapshot")
    
    # Structured AI outputs
    notes = models.TextField(blank=True, help_text="Inline summary / quick-take notes")
    executive_summary = models.TextField(blank=True)
    causes_analysis = models.TextField(blank=True)
    indicators_analysis = models.TextField(blank=True)
    conclusion = models.TextField(blank=True)
    estimated_index = models.IntegerField(null=True, blank=True)
    confidence_percent = models.IntegerField(null=True, blank=True)
    key_risk_factors = models.JSONField(default=list)
    
    model_used = models.CharField(max_length=100, default="gemini-2.5-flash")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Generated Report"
        verbose_name_plural = "Generated Reports"

    def __str__(self):
        return f"{self.business_name} ({self.region_name}) - Index {self.estimated_index}/10 [{self.created_at.strftime('%Y-%m-%d %H:%M')}]"
