from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health_check,
    mimic_region_data,
    mimic_all_regions,
    generate_report_view,
    GeneratedReportViewSet,
)

router = DefaultRouter()
router.register(r'reports', GeneratedReportViewSet, basename='reports')

urlpatterns = [
    re_path(r'^health/?$', health_check, name='health-check'),
    re_path(r'^mimic/?$', mimic_all_regions, name='mimic-all'),
    re_path(r'^mimic/(?P<region_id>[a-zA-Z0-9_-]+)/?$', mimic_region_data, name='mimic-region-detail'),
    re_path(r'^report/?$', generate_report_view, name='generate-report'),
    path('', include(router.urls)),
]
