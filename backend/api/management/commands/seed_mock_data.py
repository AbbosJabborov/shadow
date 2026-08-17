from django.core.management.base import BaseCommand
from api.models import GeneratedReport
from api.services.mimic_data import REGIONS, get_region_mimic_data
from api.services.gemini import generate_fallback_report

class Command(BaseCommand):
    help = "Seed mock report data into the database for demonstration and testing"

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of mock reports to generate'
        )

    def handle(self, *args, **options):
        count = options['count']
        self.stdout.write(self.style.NOTICE(f"Initializing seed data (target: up to {count} reports)..."))
        
        sample_businesses = [
            {"name": "Silk Road Logistics", "sector": "Transportation & Logistics", "employees": 45, "revenue": 1250000000, "registered": "2021-04-12", "status": "Active", "baselineRisk": "Moderate", "description": "Regional freight forwarding and warehouse storage."},
            {"name": "Navoiy Agro Tech", "sector": "Agriculture & Food Processing", "employees": 28, "revenue": 840000000, "registered": "2019-09-01", "status": "Active", "baselineRisk": "Low", "description": "Greenhouse vegetable cultivation and cold-chain distribution."},
            {"name": "Samarkand Textile Mills", "sector": "Light Industry & Textiles", "employees": 110, "revenue": 4500000000, "registered": "2018-02-15", "status": "Active", "baselineRisk": "Elevated", "description": "Cotton yarn spinning and fabric weaving for domestic wholesale."},
            {"name": "Tashkent Digital Solutions", "sector": "Information Technology", "employees": 16, "revenue": 2100000000, "registered": "2023-01-10", "status": "Active", "baselineRisk": "Low", "description": "Custom enterprise software development and cloud consulting."},
            {"name": "Fergana Retail Hub", "sector": "Wholesale & Retail Trade", "employees": 34, "revenue": 3200000000, "registered": "2020-11-20", "status": "Active", "baselineRisk": "High", "description": "Consumer electronics retail chain and wholesale distribution."},
        ]

        created_count = 0
        for i, biz in enumerate(sample_businesses[:count]):
            region_item = REGIONS[i % len(REGIONS)]
            mimic_data = get_region_mimic_data(region_item["id"])
            if not mimic_data:
                continue

            ai_result = {
                "score": 4 if biz["baselineRisk"] == "Low" else (6 if biz["baselineRisk"] == "Moderate" else 8),
                "probability": 35 if biz["baselineRisk"] == "Low" else (62 if biz["baselineRisk"] == "Moderate" else 82),
                "flagged": biz["baselineRisk"] in ("Elevated", "High"),
                "reasons": [{"id": "r1", "title": "Payroll mismatch detected", "description": "Reported wages below regional median."}] if biz["baselineRisk"] != "Low" else [],
            }

            report_content = generate_fallback_report(biz, region_item, ai_result, mimic_data)

            # Avoid duplicates by checking business_name and region_id
            report_obj, created = GeneratedReport.objects.get_or_create(
                business_name=biz["name"],
                region_id=region_item["id"],
                defaults={
                    "business_sector": biz["sector"],
                    "region_name": region_item["name"],
                    "business_profile": biz,
                    "ai_screening": ai_result,
                    "mimic_data": mimic_data,
                    "notes": report_content["notes"],
                    "executive_summary": report_content["executiveSummary"],
                    "causes_analysis": report_content["causesAnalysis"],
                    "indicators_analysis": report_content["indicatorsAnalysis"],
                    "conclusion": report_content["conclusion"],
                    "estimated_index": report_content["estimatedIndex"],
                    "confidence_percent": report_content["confidencePercent"],
                    "key_risk_factors": report_content["keyRiskFactors"],
                    "model_used": "seed-engine",
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} mock analysis reports into database."))
