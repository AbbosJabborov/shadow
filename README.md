# Shadow Index

A regional shadow economy monitoring platform for Uzbekistan — built with React, Tailwind CSS, shadcn/ui, and a **Django REST Framework (DRF)** backend backed by **PostgreSQL** and **Google Gemini AI**.

Tracks a composite shadow economy index across all 14 regions of Uzbekistan, with a registry of monitored MCHJ (LLC) businesses, industry-level breakdowns, and automated MIMIC econometric risk reports.

---

## Project Structure

```
├── backend/            # Django 5.1 + DRF + PostgreSQL + Gemini AI Service
│   ├── api/            # Endpoints, Models, Serializers & MIMIC Engine
│   ├── config/         # Django Settings & WSGI
│   ├── Dockerfile      # Backend Dockerfile
│   └── requirements.txt
├── frontend/           # React 19 + Vite + Tailwind CSS Frontend
├── docker-compose.yml  # Production multi-container orchestration (DB + Backend)
└── .env.example        # Environment variables template
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health/` | Service health status & model |
| `GET` | `/api/mimic/` | All 14 regions MIMIC dataset |
| `GET` | `/api/mimic/<region_id>/` | Single region MIMIC dataset |
| `POST` | `/api/report/` | Generate MIMIC AI risk report & save to PostgreSQL |
| `GET` | `/api/reports/` | List all historical generated reports |
| `GET` | `/api/reports/<id>/` | View a single saved report |
| `GET` | `/admin/` | Django Admin dashboard |

---

## Local Development

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
