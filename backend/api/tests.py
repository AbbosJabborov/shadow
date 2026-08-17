from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import GeneratedReport
from api.services.mimic_data import REGIONS, get_region_mimic_data, value_for_variable, MIMIC_CAUSES
from api.services.gemini import generate_fallback_report

class MimicDataEngineTests(TestCase):
    def test_region_count(self):
        self.assertEqual(len(REGIONS), 14)

    def test_tashkent_city_mimic_data(self):
        data = get_region_mimic_data("tashkent-city")
        self.assertIsNotNone(data)
        self.assertEqual(data["region"]["name"], "Tashkent City")
        self.assertEqual(len(data["causes"]), 11)
        self.assertEqual(len(data["indicators"]), 6)

    def test_deterministic_variable_generation(self):
        cause = MIMIC_CAUSES[0]
        val1 = value_for_variable("fergana", 60, cause)
        val2 = value_for_variable("fergana", 60, cause)
        self.assertEqual(val1, val2)

class ApiEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("ok"))
        self.assertEqual(response.data.get("service"), "shadow-backend-drf")

    def test_mimic_detail_endpoint(self):
        response = self.client.get('/api/mimic/samarqand')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["region"]["id"], "samarqand")
        self.assertIn("causes", response.data)
        self.assertIn("indicators", response.data)

    def test_mimic_detail_404(self):
        response = self.client.get('/api/mimic/non-existent-region')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mimic_all_endpoint(self):
        response = self.client.get('/api/mimic')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 14)

    def test_generate_report_endpoint(self):
        payload = {
            "business": {
                "name": "Sharq Qurilish",
                "sector": "Construction & Real Estate",
                "employees": 50,
                "revenue": 5000000000,
                "registered": "2020-05-10",
                "status": "Active",
                "baselineRisk": "Moderate",
                "description": "Commercial building contractor."
            },
            "region": {
                "id": "tashkent-city",
                "name": "Tashkent City",
                "shadowIndex": 31
            },
            "aiResult": {
                "score": 5,
                "probability": 48,
                "flagged": False,
                "reasons": []
            }
        }
        response = self.client.post('/api/report', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("executiveSummary", response.data)
        self.assertIn("mimicData", response.data)
        self.assertIn("generatedAt", response.data)
        self.assertIn("estimatedIndex", response.data)
        
        # Verify persistence in database
        self.assertEqual(GeneratedReport.objects.count(), 1)
        report = GeneratedReport.objects.first()
        self.assertEqual(report.business_name, "Sharq Qurilish")
        self.assertEqual(report.region_id, "tashkent-city")
