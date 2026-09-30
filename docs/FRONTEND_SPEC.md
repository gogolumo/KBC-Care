# Frontend Spec

## UX objective

Make the system understandable in 90 seconds. The UI should feel financial, trustworthy, clean and modern. Avoid excessive animation.

## Customer view screens

1. **Persona / demo controls**
   - Elise selector;
   - reset;
   - play next / play all.

2. **Generic KBC Home**
   - neutral account/dashboard shell;
   - no home-purchase assumption before threshold.

3. **Live Event Stream**
   - ordered events;
   - source icon;
   - timestamp;
   - newest event animation.

4. **Compass State Card**
   - “Possible Home Purchase”;
   - confidence;
   - expiry/freshness;
   - uncertainty copy;
   - Why am I seeing this?;
   - Yes / Not relevant / Pause.

5. **Evidence modal**
   - evidence chips;
   - contribution weights;
   - observed vs inferred distinction.

6. **Policy visualization**
   - candidate action;
   - BLOCKED badge;
   - human-readable reason;
   - safe alternative.

7. **Home Journey**
   - 5 steps;
   - progress;
   - confirmed-goal badge.

8. **Share Context modal**
   - selected fields;
   - purpose;
   - 24h expiry;
   - explicit exclusions;
   - confirm share.

## Adviser view

Show:
- Elise;
- purpose + expiry;
- confirmed goal;
- journey progress;
- unresolved questions;
- “Shared by customer” label.

Do not show raw transactions.

## Component hierarchy

```text
DemoShell
├── PersonaSelector
├── SimulationControls
├── CustomerView
│   ├── KbcHomeHeader
│   ├── EventStream
│   ├── CompassStateCard
│   │   └── EvidenceModal
│   ├── PolicyDecisionCard
│   ├── HomeJourney
│   └── ShareContextModal
└── AdviserView
    └── ContextPassportCard
```

## Required UI states

- initial;
- simulation running;
- below threshold;
- inferred state;
- confirmed state;
- rejected state;
- paused;
- policy blocked;
- journey active;
- share preview;
- shared;
- passport expired/error.

## Mock-first rule

Vlad can build against fixtures matching `API_CONTRACT.md` immediately. Fixture field names must exactly match the contract to minimize integration churn.

## Animation guidance

Use motion only for:
- new event arrival;
- confidence interpolation;
- card appearance after threshold;
- UI transition after confirmation.

No animated background, no risky 3D, no long page transitions.
