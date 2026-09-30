# Hackathon-friendly single-service Cloud Run image.
# Runs FastAPI internally on :8000 and Next.js on Cloud Run's $PORT.
FROM node:20-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    USE_MOCK_DATA=true \
    BACKEND_URL=http://127.0.0.1:8000

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv python3-pip curl \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir -r backend/requirements.txt

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY backend backend
COPY frontend frontend
RUN cd frontend && pnpm build

COPY cloud-run.sh /app/cloud-run.sh
RUN chmod +x /app/cloud-run.sh

EXPOSE 8080

RUN chown -R 1000:1000 /app
USER 1000

CMD ["/app/cloud-run.sh"]
