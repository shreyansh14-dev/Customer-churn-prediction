# Multi-stage Dockerfile for MLVerse (Predict. Explain. Retain.)

# ==========================================
# STAGE 1: Frontend Build
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Backend & Final Image
# ==========================================
FROM python:3.12-slim AS runner

WORKDIR /app

# Install system dependencies (build-essential, libgomp1 for LightGBM/XGBoost)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend, artifacts, ml code, and configurations
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY configs/ ./configs/
COPY artifacts/ ./artifacts/
COPY data/ ./data/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose API and UI port
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Launch uvicorn server (which serves both REST API at /api and React UI at /)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
