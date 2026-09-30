# KBC Compass frontend

Next.js customer and adviser demo for the canonical Elise journey. The UI calls the FastAPI `/api` endpoints through a Next.js rewrite. Confidence, evidence, policy decisions, journey progress and Context Passport contents come from the backend; the frontend keeps only presentation labels for the five synthetic events.

## Run locally

Start the backend from `backend/` with `USE_MOCK_DATA=true` and port `8000`:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

Then start the frontend from `frontend/`:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. Set `BACKEND_URL` before starting Next.js if FastAPI uses a different origin. The default is `http://127.0.0.1:8000`.

## Demo click order

Reset → Play next through all five events (or Play all) → Why am I seeing this? → Evaluate proposed action → Yes, help me explore → complete the budget step → Share with KBC Live → Adviser view. Reset and repeat. For the negative path, reset, replay, and choose Not relevant.

The first `salary_received` event adds no home-purchase evidence. The backend returns `confidence` 0, 30, 45, 63 and 83 in event responses; `state` stays `null` below 60, so the customer-facing card appears only after the threshold. The frontend displays the returned score and never calculates it.

## Current contract boundary

The canonical demo does not include Pause. `docs/FRONTEND_SPEC.md` mentions it, but `docs/API_CONTRACT.md` and the current backend have no pause endpoint. The UI omits that control so it never suggests a preference was saved when it was not.


## Kate AI Adviser Copilot

Adviser View includes **Kate**, a demo-safe AI copilot that works only with fields Elise explicitly shared through the Context Passport. Kate creates a customer briefing, suggested opening, questions to cover and a recommended next step. In the hackathon MVP this guidance is deterministic and requires no external LLM, so the demo remains reliable.

Kate is intentionally downstream of consent and policy. She cannot approve credit, override policy decisions, infer from hidden/raw events, or access fields that are absent from the Context Passport. This preserves the product boundary: Compass understands context, Policy protects, the customer controls sharing, and Kate assists the human adviser.
