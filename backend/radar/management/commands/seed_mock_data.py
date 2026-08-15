import random
import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from radar.models import Business, TaxFiling, TransactionSignal, MarketplaceListing, RiskScore
from radar.scoring import calculate_anomaly_scores
from radar.llm_report import generate_business_report

SECTOR_PREFIXES = {
    'retail': ['Baraka Savdo', 'Nasaf Supermarket', 'Qarshi Market', 'Ideal Savdo Markazi', 'Chorsu Savdo', 'Vodiy Mega Market', 'Nurafshon Savdo', 'Elit Savdo', 'Kesh Grand Market', 'Oqsaroy Savdo'],
    'food_service': ['Rayhon Milliy Taomlar', 'Nasaf Osh Markazi', 'Qarshi Somsa & Kabob', 'Oqsaroy Restoran', 'Shahrisabz Choyxonasi', 'Sevimli Cafe', 'Evos Express', 'Shashlik Uyi', 'Beshbarmoq Markazi', 'Kesh Terrace'],
    'services': ['Nasaf Auto Servis', 'Qashqadaryo Logistika', 'Kitob Servis Plyus', 'Shahrisabz Texnik Xizmat', 'Kesh Konsalting', 'Ziyo IT Solutions', 'Toza Tozalash Servisi', 'Barhayot Tibbiyot Markazi', 'Osiyo Diagnostika', 'Kesh Print & Reklama'],
    'trade': ['Nasaf Ulgurji Savdo', 'Qarshi Qurilish Mollari Trade', 'Kitob Agro Export', 'Shahrisabz Meva-Sabzavot Savdo', 'Janub Standart Trade', 'Ipak Yo\'li Trans Savdo', 'Kesh Wholesale', 'Oltin Vodiy Trade', 'Janub Textile Trade', 'Kesh Impex'],
    'construction': ['Nasaf Modern Qurilish', 'Qashqadaryo Bino Servis', 'Shahrisabz Beton Konstruksiya', 'Kitob Yo\'l Qurilish', 'Kesh Elite Stroy', 'Karvon Sanoat Qurilish', 'Nasaf Tamirlash', 'Poydevor Maxsus Qurilish', 'Grand Kesh Qurilish', 'Qarshi City Stroy']
}

DISTRICTS = ["Qarshi", "Shahrisabz", "Kitob", "Koson", "G'uzor"]
LEGAL_FORMS = ["MChJ", "OK", "XK", "YaTT", "AJ"]

class Command(BaseCommand):
    help = 'Seeds realistic mock data for Shadow Economy Radar with 70/20/10 risk profile'

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=200, help='Total businesses to generate (default: 200)')
        parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')

    def handle(self, *args, **options):
        count = options['count']
        seed_val = options['seed']
        random.seed(seed_val)

        self.stdout.write(self.style.NOTICE(f"Seeding {count} businesses (Seed={seed_val})..."))

        # Clear existing data
        RiskScore.objects.all().delete()
        MarketplaceListing.objects.all().delete()
        TransactionSignal.objects.all().delete()
        TaxFiling.objects.all().delete()
        Business.objects.all().delete()

        created_businesses = []
        sectors = list(SECTOR_PREFIXES.keys())
        current_month = "2026-06"

        with transaction.atomic():
            for i in range(1, count + 1):
                # 70% normal, 20% moderate, 10% severe / unregistered
                rand_pct = random.random()
                if rand_pct < 0.70:
                    profile = "normal"
                elif rand_pct < 0.90:
                    profile = "moderate"
                else:
                    profile = "severe"

                sector = random.choice(sectors)
                district = random.choice(DISTRICTS)
                prefix = random.choice(SECTOR_PREFIXES[sector])
                legal = random.choice(LEGAL_FORMS)
                business_name = f"{prefix} {legal}"
                business_id = f"QD-{i:04d}"

                # 3% of businesses are unregistered marketplace shadow operators (part of severe)
                is_unregistered = (profile == "severe" and random.random() < 0.35)
                registered = not is_unregistered

                reg_year = random.randint(2018, 2025)
                reg_month = random.randint(1, 12)
                reg_day = random.randint(1, 28)
                reg_date = datetime.date(reg_year, reg_month, reg_day) if registered else None

                b = Business.objects.create(
                    business_id=business_id,
                    name=business_name,
                    sector=sector,
                    district=district,
                    registered=registered,
                    registration_date=reg_date,
                )
                created_businesses.append((b, profile))

                # Employees & Revenue
                if sector == 'construction':
                    employees = random.randint(12, 60)
                    base_revenue = random.randint(120_000_000, 600_000_000)
                elif sector == 'trade':
                    employees = random.randint(4, 18)
                    base_revenue = random.randint(70_000_000, 350_000_000)
                elif sector == 'retail':
                    employees = random.randint(2, 10)
                    base_revenue = random.randint(30_000_000, 180_000_000)
                elif sector == 'food_service':
                    employees = random.randint(3, 15)
                    base_revenue = random.randint(25_000_000, 140_000_000)
                else: # services
                    employees = random.randint(2, 8)
                    base_revenue = random.randint(15_000_000, 90_000_000)

                if is_unregistered:
                    declared_rev = 0
                    tax_paid = 0
                    employees = 0
                else:
                    declared_rev = base_revenue
                    tax_paid = round(declared_rev * random.uniform(0.04, 0.08), 2)

                TaxFiling.objects.create(
                    business=b,
                    month=current_month,
                    declared_revenue=declared_rev,
                    declared_employees=employees,
                    tax_paid=tax_paid,
                )

                # Observed POS / e-wallet transaction volume
                if profile == "normal":
                    multiplier = random.uniform(0.88, 1.14)
                elif profile == "moderate":
                    multiplier = random.uniform(1.60, 2.90)
                else:  # severe
                    multiplier = random.uniform(4.20, 8.50)

                actual_volume = round(base_revenue * multiplier)
                tx_count = max(30, int(actual_volume / random.randint(45_000, 220_000)))
                avg_tx = round(actual_volume / tx_count, 2)

                TransactionSignal.objects.create(
                    business=b,
                    month=current_month,
                    pos_ewallet_volume=actual_volume,
                    transaction_count=tx_count,
                    avg_transaction_size=avg_tx,
                )

                # Add some marketplace listings
                if is_unregistered or (profile == "severe" and random.random() < 0.6):
                    MarketplaceListing.objects.create(
                        listing_id=f"ML-{1000 + i}",
                        seller_name=f"{prefix} Express Store",
                        matched_business=None if is_unregistered else b,
                        platform=random.choice(["OLX", "Instagram", "Telegram", "Uzum"]),
                        est_monthly_ad_spend=random.randint(500_000, 6_000_000),
                        follower_count=random.randint(2_500, 48_000),
                    )

        self.stdout.write(self.style.SUCCESS(f"Successfully generated {len(created_businesses)} businesses."))

        # Run scoring engine
        self.stdout.write(self.style.NOTICE("Running anomaly scoring engine..."))
        scoring_res = calculate_anomaly_scores()
        self.stdout.write(self.style.SUCCESS(f"Calculated risk scores for {scoring_res['updated_count']} entities."))

        # Pre-cache reports for top high-risk entities
        high_risk_businesses = RiskScore.objects.filter(tier='high')[:8]
        self.stdout.write(self.style.NOTICE(f"Pre-generating AI risk reports for top {len(high_risk_businesses)} high-risk entities..."))
        for rs in high_risk_businesses:
            generate_business_report(rs.business.business_id)

        self.stdout.write(self.style.SUCCESS("Database seeding and initial scoring pipeline complete!"))
