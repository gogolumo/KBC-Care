#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-${PROJECT_ID:-}}"
REGION="${REGION:-europe-west1}"
BACKEND_SERVICE="${BACKEND_SERVICE:-kbc-compass-api}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-kbc-compass}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "❌ gcloud CLI is required. Run this script from Google Cloud Shell."
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  PROJECT_ID="$(gcloud config get-value project 2>/dev/null || true)"
fi

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "❌ No Google Cloud project selected."
  echo "Usage: bash scripts/deploy_gcp.sh <PROJECT_ID>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "☁️  Deploying KBC Compass"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"

gcloud config set project "$PROJECT_ID" >/dev/null

echo "→ Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
BUILDER_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "→ Ensuring Cloud Run source-build permission..."
if ! gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$BUILDER_SA" \
  --role="roles/run.builder" \
  --condition=None \
  --quiet >/dev/null; then
  echo "⚠️  Could not add roles/run.builder automatically."
  echo "   If source deployment fails with a build permission error, the Qwiklabs account may not allow IAM changes."
fi

echo "→ Deploying FastAPI backend..."
gcloud run deploy "$BACKEND_SERVICE" \
  --source "$ROOT_DIR/backend" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "USE_MOCK_DATA=true" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 1 \
  --quiet

BACKEND_URL="$(gcloud run services describe "$BACKEND_SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format='value(status.url)')"

if [ -z "$BACKEND_URL" ]; then
  echo "❌ Could not resolve backend Cloud Run URL."
  exit 1
fi

echo "   Backend: $BACKEND_URL"
echo "→ Checking backend health..."
curl -fsS "$BACKEND_URL/api/health"
echo

echo "→ Deploying Next.js frontend..."
gcloud run deploy "$FRONTEND_SERVICE" \
  --source "$ROOT_DIR/frontend" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "BACKEND_URL=$BACKEND_URL" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2 \
  --quiet

FRONTEND_URL="$(gcloud run services describe "$FRONTEND_SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format='value(status.url)')"

if [ -z "$FRONTEND_URL" ]; then
  echo "❌ Could not resolve frontend Cloud Run URL."
  exit 1
fi

echo "→ Verifying frontend → backend proxy..."
curl -fsS "$FRONTEND_URL/api/health"
echo
curl -fsS "$FRONTEND_URL/api/customers" | grep -q elise

echo
echo "✅ KBC Compass is live on Google Cloud Run"
echo
echo "App:"
echo "$FRONTEND_URL"
echo
echo "Backend:"
echo "$BACKEND_URL"
echo
echo "Swagger:"
echo "$BACKEND_URL/docs"
echo
echo "For the hackathon submission, share the App URL above."
