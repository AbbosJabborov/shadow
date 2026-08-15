from django.test import TestCase
from django.urls import reverse
from radar.models import Business, TaxFiling, TransactionSignal, RiskScore
from radar.scoring import calculate_anomaly_scores
from radar.llm_report import generate_business_report

class RadarPipelineTests(TestCase):
    def setUp(self):
        # Create normal business
        self.b1 = Business.objects.create(
            business_id="QD-0001",
            name="Baraka Savdo MChJ",
            sector="retail",
            district="Qarshi",
            registered=True
        )
        TaxFiling.objects.create(
            business=self.b1,
            month="2026-06",
            declared_revenue=50000000,
            declared_employees=3,
            tax_paid=2500000
        )
        TransactionSignal.objects.create(
            business=self.b1,
            month="2026-06",
            pos_ewallet_volume=52000000,
            transaction_count=400,
            avg_transaction_size=130000
        )

        # Create high-gap unregistered business
        self.b2 = Business.objects.create(
            business_id="QD-0002",
            name="Shadow Electronics",
            sector="retail",
            district="Qarshi",
            registered=False
        )
        TaxFiling.objects.create(
            business=self.b2,
            month="2026-06",
            declared_revenue=0,
            declared_employees=0,
            tax_paid=0
        )
        TransactionSignal.objects.create(
            business=self.b2,
            month="2026-06",
            pos_ewallet_volume=180000000,
            transaction_count=900,
            avg_transaction_size=200000
        )

    def test_scoring_pipeline(self):
        res = calculate_anomaly_scores()
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["updated_count"], 2)

        rs_unreg = RiskScore.objects.get(business=self.b2)
        self.assertEqual(rs_unreg.tier, "high")
        self.assertGreaterEqual(rs_unreg.risk_score, 0.90)

    def test_report_generation(self):
        calculate_anomaly_scores()
        report = generate_business_report("QD-0002")
        self.assertIn("report_text", report)
        self.assertIn("Shadow Electronics", report["report_text"])

    def test_api_endpoints(self):
        calculate_anomaly_scores()
        
        # Test businesses endpoint
        resp = self.client.get('/api/businesses/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 2)

        # Test stats endpoint
        resp_stats = self.client.get('/api/stats/')
        self.assertEqual(resp_stats.status_code, 200)
        self.assertEqual(resp_stats.json()["total_businesses"], 2)

        # Test district summary endpoint
        resp_dist = self.client.get('/api/districts/summary/')
        self.assertEqual(resp_dist.status_code, 200)
