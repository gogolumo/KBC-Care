# Hackathon Submission

## 1. Short description

**KBC Compass turns fragmented customer signals into temporary, explainable customer situations before deciding what the bank should do next. It lets customers confirm or reject inferred context, blocks inappropriate automation through a policy layer, and only then adapts the banking journey or shares customer-approved context with an adviser.**

Alternative shorter version:

**KBC Compass connects weak customer signals into an explainable context, asks the customer to confirm it, and uses policy rules to turn that context into safe, relevant next steps across banking channels.**

## 2. GitHub repository

https://github.com/gogolumo/hackathon

Before submission:

- [ ] Repository changed to **PUBLIC**
- [ ] Open the repository in a logged-out/incognito browser
- [ ] README renders correctly
- [ ] `make dev` or `bash start.sh` tested from a fresh clone
- [ ] No secrets committed
- [ ] No private customer data committed

Current-tree secret-pattern audit on 2026-09-30 found no matches for common `api_key`, `secret`, `password`, `token` or private-key patterns. This does not replace GitHub/Aikido secret scanning of full history.

## 3. Demo video — target 2:20–2:35

### 0:00–0:18 — Problem

Presenter:

> Banks see thousands of signals, but a signal is not a customer situation. A mortgage simulation alone should not immediately become a mortgage offer.

Show the neutral Elise screen and the Signals → Context → Safe next step strip.

### 0:18–0:45 — Signals

Presenter:

> This is Elise. Watch what happens as separate signals arrive from different parts of the bank.

Press **Run demo**.

Show salary, mortgage simulation, repeated MyHome visits, housing payment change and property document.

### 0:45–1:05 — Context

Presenter:

> Compass does not react to one event. It combines the pattern. At the activation threshold it creates a temporary, explainable Possible Home Purchase context.

Show the context card and score.

### 1:05–1:25 — Explainability

Open **Why am I seeing this?**

Presenter:

> Elise can see the exact evidence. This is an inference, not a fact and not a credit score. She can confirm it or reject it.

### 1:25–1:45 — Policy block

Click **Show policy decision**.

Presenter:

> Understanding the context does not mean the bank is allowed to do anything with it. Compass blocks a pre-approved mortgage offer derived from behavioral inference.

Pause on **BLOCK**.

### 1:45–2:02 — Confirmation

Click **Yes, help me explore**.

Presenter:

> Elise confirms the goal. Only now does the experience change.

Show Home Journey.

### 2:02–2:20 — Customer-controlled handoff

Complete the active journey step, choose **Share with KBC Live**, confirm the Context Passport, then open Adviser View.

Presenter:

> Elise chooses exactly what the adviser receives. Raw transactions and unrelated data stay out.

### 2:20–2:35 — Scale / close

Presenter:

> Compass is not another chatbot. It is a shared context, consent and policy layer that can sit underneath KBC Mobile, Kate and human channels. The demo is deterministic and synthetic; the architecture has a clear path from this single-process MVP to stateless bank-scale services.

End on the Adviser View or architecture diagram.

## Recording checklist

- [ ] Video is original
- [ ] Duration under 3:00
- [ ] Browser zoom makes text readable
- [ ] No terminal errors visible
- [ ] Reset demo before recording
- [ ] Policy **BLOCK** is visible
- [ ] Customer confirmation transition is visible
- [ ] Adviser view is shown
- [ ] Upload to an accessible link and test it logged out

## 4. Aikido screenshots

The submission UI requires screenshots from the Aikido platform. The repository does not contain enough information to determine the exact required Aikido screen, so do not invent one.

- [ ] Connect/import the public repository into Aikido
- [ ] Run the repository/security scan
- [ ] Resolve or document any high-severity finding that affects the demo
- [ ] Capture the result view requested by the hackathon
- [ ] Make sure project/repository name is visible
- [ ] Make sure severity/status text is readable
- [ ] Capture any required code/repository security score view
- [ ] Upload screenshots to the submission form

## Final submission checklist

- [ ] Short description
- [ ] Video link (<3 minutes)
- [ ] Public GitHub repository
- [ ] Aikido screenshots
- [ ] Clean clone tested
- [ ] Current tree and history checked for secrets
- [ ] Demo rehearsed from Reset through Adviser View
