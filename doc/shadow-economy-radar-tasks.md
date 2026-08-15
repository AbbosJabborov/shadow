# Shadow Economy Radar — Build Docs & Task Breakdown

Stack: React/Vite · Django/DRF · PostgreSQL · Docker

---

## 1. Repo Structure

```
shadow-economy-radar/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── config/                 # settings, urls
│   └── radar/                  # app
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── scoring.py          # anomaly detection logic
│       ├── llm_report.py       # Claude API call + caching
│       └── management/commands/seed_mock_data.py
└── frontend/
    ├── Dockerfile
    ├── src/
    │   ├── api/                # fetch wrappers
    │   ├── components/
    │   └── pages/
    └── vite.config.js
```

---

## 2. Docker Compose Skeleton

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: radar
      POSTGRES_USER: radar
      POSTGRES_PASSWORD: radar
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes: ["./backend:/app"]
    ports: ["8000:8000"]
    depends_on: [db]
    env_file: .env

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes: ["./frontend:/app"]
    ports: ["5173:5173"]
    depends_on: [backend]

volumes:
  pgdata:
```

---

## 3. Data Models (Django)

```python
class Business(models.Model):
    business_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    sector = models.CharField(max_length=50)
    district = models.CharField(max_length=100)
    registered = models.BooleanField(default=True)

class TaxFiling(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    month = models.CharField(max_length=7)
    declared_revenue = models.DecimalField(max_digits=14, decimal_places=2)
    declared_employees = models.IntegerField()

class TransactionSignal(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    month = models.CharField(max_length=7)
    pos_ewallet_volume = models.DecimalField(max_digits=14, decimal_places=2)
    transaction_count = models.IntegerField()

class RiskScore(models.Model):
    business = models.OneToOneField(Business, on_delete=models.CASCADE)
    gap_ratio = models.FloatField()
    risk_score = models.FloatField()
    tier = models.CharField(max_length=10)  # low / medium / high
    report_text = models.TextField(blank=True, null=True)
    report_generated_at = models.DateTimeField(null=True, blank=True)
```

---

## 4. API Contract

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/businesses/` | list all businesses + risk tier |
| POST | `/api/analyze/` | run/refresh scoring across all businesses |
| GET | `/api/report/<business_id>/` | return cached report, generate via LLM if missing |
| GET | `/api/districts/summary/` | aggregated gap_ratio % per district for heatmap |

---

## 5. Task Breakdown

### Day 1 — Foundation
| Owner | Task |
|---|---|
| Coder 1 | Django project + models + migrations, docker-compose up and working |
| Coder 2 | `seed_mock_data.py` — generate ~150–300 businesses per the 70/20/10 profile split |
| Coder 3 | `scoring.py` — gap_ratio + z-score calculation, sector-relative |
| Coder 4 | Vite scaffold, routing, static version of the mockup layout wired in |
| Designer | Finalize color/type tokens, district card states, report card states, mobile pass |

**End of day:** mock data seeded in Postgres, scoring runs and writes `RiskScore` rows, frontend shell renders static mock data.

### Day 2 — Core Features
| Owner | Task |
|---|---|
| Coder 1 | `/api/businesses/` + `/api/districts/summary/` serializers/views |
| Coder 2 | `/api/analyze/` endpoint, hook scoring into it |
| Coder 3 | `llm_report.py` — Claude API call, prompt from doc, cache to `RiskScore.report_text` |
| Coder 4 | Connect frontend to real API — business table, district heatmap live data |
| Designer | Empty/loading/error states, risk badge system, polish report panel |

**End of day:** full pipeline works end-to-end — seed → score → API → dashboard, with real (not hardcoded) data.

### Day 3 — Polish & Demo Prep
| Owner | Task |
|---|---|
| Coder 1 | Bug fixes, seed data tuning for a convincing demo spread |
| Coder 2 | Pre-generate + cache all reports so demo doesn't hit LLM latency live |
| Coder 3 | District summary edge cases, error handling |
| Coder 4 | Responsive pass, animations/transitions, deploy or finalize local demo build |
| Designer | Final visual QA, prep any demo slides/walkthrough visuals |
| All | Full run-through of demo script, timing, fallback plan if live API fails |

---

## 6. Definition of Done (Demo Checklist)

- [ ] `docker-compose up` runs the whole stack from a clean clone
- [ ] Mock data seeded with realistic 70/20/10 risk distribution
- [ ] District heatmap reflects real aggregated data, not hardcoded
- [ ] Clicking a flagged business shows a real (or cached) AI-generated report
- [ ] At least 3 "high risk" businesses have compelling, distinct report narratives
- [ ] App survives no internet / LLM API down (cached reports as fallback)
- [ ] One team member can explain the scoring math live if jury asks
