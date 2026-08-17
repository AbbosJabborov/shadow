from django.contrib import admin
from .models import GeneratedReport

@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'business_sector', 'region_name', 'estimated_index', 'confidence_percent', 'created_at')
    list_filter = ('region_name', 'business_sector', 'created_at')
    search_fields = ('business_name', 'business_sector', 'region_name', 'notes', 'executive_summary')
    readonly_fields = ('created_at',)
