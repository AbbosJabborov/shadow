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

## Production Deployment (VPS + Docker + NPM)

### 1. Configure Environment
Copy `.env.example` to `.env` on your VPS:
```bash
cp .env.example .env
```
Fill in your `POSTGRES_PASSWORD`, `DJANGO_SECRET_KEY`, and `GEMINI_API_KEY`.

### 2. Start Services with Docker Compose
```bash
docker compose up -d --build
```
This boots:
- **PostgreSQL 16** (`shadow_postgres`) on `5432` with persistent volume `pgdata`.
- **Django Backend** (`shadow_backend`) on `http://127.0.0.1:8000` with Gunicorn.

### 3. Nginx Proxy Manager (NPM) Configuration
In your Nginx Proxy Manager dashboard:
- **Domain Names**: `api-shadow.claive.uz`
- **Forward Hostname / IP**: `127.0.0.1` (or your Docker host IP)
- **Forward Port**: `8000`
- **Block Common Exploits**: Enabled
- **Websockets Support**: Enabled
- **SSL**: Request Let's Encrypt Certificate, Force SSL enabled.

For the frontend domain `shadow.claive.uz`:
- Point to your frontend build or static host, configured with `VITE_API_URL=https://api-shadow.claive.uz`.

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
