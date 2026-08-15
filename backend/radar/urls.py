from django.urls import path
from .views import (
    BusinessListView,
    BusinessDetailView,
    AnalyzeView,
    ReportView,
    DistrictSummaryView,
    StatsOverviewView,
)

urlpatterns = [
    path('businesses/', BusinessListView.as_view(), name='business-list'),
    path('businesses/<str:business_id>/', BusinessDetailView.as_view(), name='business-detail'),
    path('analyze/', AnalyzeView.as_view(), name='analyze-trigger'),
    path('report/<str:business_id>/', ReportView.as_view(), name='report-view'),
    path('districts/summary/', DistrictSummaryView.as_view(), name='district-summary'),
    path('stats/', StatsOverviewView.as_view(), name='stats-overview'),
]
