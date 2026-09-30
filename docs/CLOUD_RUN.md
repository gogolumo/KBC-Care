# Google Cloud Run deployment

KBC Compass can be deployed as two public Cloud Run services:

```text
Browser
  ↓
kbc-compass (Next.js)
  ↓ /api/*
kbc-compass-api (FastAPI)
  ↓
synthetic demo data + state/policy engine
```

The frontend uses a runtime API proxy, so the browser stays on the frontend origin and the backend URL is supplied to the frontend service through the `BACKEND_URL` environment variable.

## Qwiklabs / Cloud Shell

Open Google Cloud Console for the target project, launch **Cloud Shell**, then run:

```bash
gcloud config set project qwiklabs-gcp-04-b5a99cc66fcf

git clone https://github.com/gogolumo/hackathon.git
cd hackathon

bash scripts/deploy_gcp.sh qwiklabs-gcp-04-b5a99cc66fcf
```

The script:

- enables Cloud Run, Cloud Build and Artifact Registry APIs;
- builds the FastAPI container in Google Cloud;
- deploys it as `kbc-compass-api`;
- reads the generated backend URL;
- builds the Next.js container;
- deploys it as `kbc-compass` with `BACKEND_URL` configured;
- verifies both backend health and the frontend proxy;
- prints the final public application URL.

Default region:

```text
europe-west1
```

Override it if required by the lab:

```bash
REGION=europe-west4 bash scripts/deploy_gcp.sh qwiklabs-gcp-04-b5a99cc66fcf
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

## Important demo limitation

The backend uses in-memory mutable state for the hackathon. The deployment therefore caps the backend at **one Cloud Run instance** so the Elise demo remains consistent.

A container restart resets mutable demo progress. The user can simply press **Reset** / **Run demo** again.

This is a hackathon deployment, not the production persistence architecture described in `docs/SCALABILITY.md`.

## Public access

The deployment uses `--allow-unauthenticated` because the hackathon submission needs a link judges can open without Google Cloud IAM access.

If the temporary Qwiklabs project has an organization policy that blocks public Cloud Run services, the deployment will fail at that permission step. In that case the lab's permitted access model must be used instead.
