FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for PostgreSQL and building packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Create directory for static files
RUN mkdir -p /app/staticfiles

EXPOSE 8000

# Default command: run migrations and start gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_mock_data --count 5 && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]
