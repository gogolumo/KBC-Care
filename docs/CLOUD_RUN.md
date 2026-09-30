# KBC Care — Google Cloud Run deployment

KBC Care is deployed as two public Google Cloud Run services:

```text
Browser
  ↓
kbc-compass (Next.js frontend)
  ↓ /api/*
kbc-compass-api (FastAPI backend)
  ↓
synthetic demo data + deterministic state/policy engine
```

The frontend uses a runtime API proxy, so the browser stays on the frontend origin and the backend URL is supplied to the frontend service through the `BACKEND_URL` environment variable.

## Current hackathon deployment

- Google Cloud project: `qwiklabs-gcp-04-b5a99cc66fcf`
- Region: `europe-west1`
- Frontend service: `kbc-compass`
- Backend service: `kbc-compass-api`
- Application: https://kbc-compass-kvd5257laq-ew.a.run.app
- Backend API: https://kbc-compass-api-kvd5257laq-ew.a.run.app
- Swagger / OpenAPI: https://kbc-compass-api-kvd5257laq-ew.a.run.app/docs
- Backend health: https://kbc-compass-api-kvd5257laq-ew.a.run.app/api/health
- Frontend proxy health: https://kbc-compass-kvd5257laq-ew.a.run.app/api/health

Successful deployment verification returned:

```json
{"ok":true,"mockMode":true}
```

The deployed services were serving 100% of traffic on their latest revisions when verified.

> This is a temporary hackathon Qwiklabs environment. The public URLs may expire after the event.

## Platform and data boundary

- Platform: Google Cloud Run
- Frontend: Next.js
- Backend: FastAPI
- Demo data: synthetic / mock only
- No real banking customer data is used
- No Google Cloud credentials are stored in the repository

## Qwiklabs / Cloud Shell

Open Google Cloud Console for the target project and launch **Cloud Shell**. The session must already be authenticated to an account that has access to the target project.

Clone the repository:

```bash
git clone https://github.com/gogolumo/KBC-Care.git
cd KBC-Care
```

Deploy with the existing script:

```bash
bash scripts/deploy_gcp.sh <PROJECT_ID>
```

For the current temporary project:

```bash
bash scripts/deploy_gcp.sh qwiklabs-gcp-04-b5a99cc66fcf
```

### One-command Cloud Shell deployment

If the Cloud Shell account has access to exactly the intended project, the project can be selected automatically:

```bash
PROJECT_ID="$(gcloud projects list --format='value(projectId)' --limit=1)" && \
gcloud config set project "$PROJECT_ID" && \
bash scripts/deploy_gcp.sh "$PROJECT_ID"
```

This command assumes the Cloud Shell session is already authenticated. Do not place passwords, access tokens, service-account keys or temporary credentials in source files, `.env` files, shell scripts or Git history.

## What the deployment script does

`scripts/deploy_gcp.sh`:

- enables Cloud Run, Cloud Build and Artifact Registry APIs when permitted;
- builds the FastAPI container in Google Cloud;
- deploys it as `kbc-compass-api`;
- reads the generated backend URL;
- builds the Next.js container;
- deploys it as `kbc-compass` with `BACKEND_URL` configured;
- verifies backend health and the frontend-to-backend proxy;
- prints the final public application URL.

Default region:

```text
europe-west1
```

Override it only when required:

```bash
REGION=europe-west4 bash scripts/deploy_gcp.sh <PROJECT_ID>
```

## Verify

After deployment:

```bash
APP_URL="$(gcloud run services describe kbc-compass --region europe-west1 --format='value(status.url)')"
API_URL="$(gcloud run services describe kbc-compass-api --region europe-west1 --format='value(status.url)')"

curl "$API_URL/api/health"
curl "$APP_URL/api/health"
curl "$APP_URL/api/customers"
```

Expected health response:

```json
{"ok":true,"mockMode":true}
```

Swagger is available at:

```text
<API_URL>/docs
```

## Hackathon demo limitation

The backend uses in-memory mutable state for the hackathon. The deployment therefore caps the backend at **one Cloud Run instance** so the Elise demo remains consistent.

A container restart resets mutable demo progress. The presenter can simply reset and run the demo again.

This is a hackathon deployment, not the production persistence architecture described in [SCALABILITY.md](SCALABILITY.md).

## Public access

The deployment uses `--allow-unauthenticated` because the hackathon submission needs a link judges can open without Google Cloud IAM access.

The public demo has no production authentication and must not be treated as a real banking system.
