# Shadow API Backend (Django & DRF)

Django REST Framework backend for the **Shadow Index** platform, providing MIMIC (Multiple Indicators Multiple Causes) econometric data analysis, Google Gemini AI structured reports, and PostgreSQL report persistence.

## Architecture

- **Framework**: Django 5.1 + Django REST Framework
- **Database**: PostgreSQL 16 (persists generated shadow economy risk reports)
- **AI Integration**: Google Gemini (`google-genai` SDK) with deterministic econometric fallback
- **Reverse Proxy Support**: Pre-configured for Nginx Proxy Manager (`X-Forwarded-Proto`, `USE_X_FORWARDED_HOST`)

## API Endpoints

- `GET /api/health/` — Health status, database connection, and configured AI model.
- `GET /api/mimic/` — List of all 14 Uzbekistan regions with their calculated MIMIC causes & indicators.
- `GET /api/mimic/<region_id>/` — Macro causes and indicators for a single region (e.g. `tashkent-city`).
- `POST /api/report/` — Body: `{ business, region, aiResult }` → generates full risk report and stores in PostgreSQL.
- `GET /api/reports/` — List of all saved analysis reports.
- `GET /api/reports/<id>/` — Retrieve details of a specific saved report.
- `GET /admin/` — Django Administration portal.

## Local Development

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment
cp .env.example .env

# 4. Run migrations & start server
python manage.py migrate
python manage.py runserver 8000
```
