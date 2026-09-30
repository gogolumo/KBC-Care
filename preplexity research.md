KBC already has a highly advanced digital assistant, proactive personalization, a decision/data layer, ecosystem journeys and GenAI-enabled Kate. Your winning move is therefore **not a better assistant**: it is a customer-controlled *situational intelligence layer* that continuously turns scattered, weak signals into an explainable, temporary “customer state,” then orchestrates the right experience across KBC Mobile, Kate, notifications and human support.

**Recommendation:** build **KBC Compass — a Consent-First Customer State Engine**. It does not decide credit or sell products autonomously. It detects emerging life situations with evidence and confidence, asks the customer for confirmation when needed, and assembles a cross-product “next best help” journey. It is buildable as a hackathon MVP with synthetic data and offers a strong visual proof that the system adapts differently for millions of customers.

## 1. Executive summary

### The opportunity

KBC’s public materials show that it already possesses most of the “front-of-house” building blocks:

- KBC Mobile combines banking, insurance and partner ecosystems.
- Kate offers support, insight and proactive personalized suggestions in more than 140 situations in Belgium.
- Kate is increasingly autonomous: KBC says it resolves roughly 70% of customer queries independently, and it has been upgraded to use GPT-4.1.
- MyMobility and MyHome increasingly package services into domain ecosystems.
- Kate Coins connects banking activity and partner benefits.
- KBC already uses personalized experiences and explicit opt-in (“On your terms / Op jouw maat”) in some contexts. [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_EN.pdf)

That means the weak pitch is:

> “Use transaction data and an LLM to recommend a loan/insurance/product through Kate.”

KBC already does much of that.

The stronger pitch is:

> “KBC should evolve from **personalized prompts** to a **customer-controlled understanding system**: an intelligence layer that recognizes changing situations from multi-signal evidence, represents uncertainty honestly, coordinates all relevant KBC journeys, and learns from customer corrections.”

### Strategic thesis

| Current personalization pattern | Next-layer personalization |
|---|---|
| Detect a trigger | Infer a changing, probabilistic situation from several signals |
| Product/offer-centric | Customer-state and outcome-centric |
| Single prompt or proposition | Coordinated, multi-step journey across products and channels |
| “We think you may like…” | “We noticed possible signs of X. Is that relevant? Here is why, and here is what we can help with.” |
| Persistent segmentation | Time-bounded, decay-based state with evidence and confidence |
| Personalization as a black box | Customer-visible profile, explanations, correction and controls |
| Kate as interaction surface | Kate, Mobile, notification, KBC Live and advisers as channels over a shared context |
| Recommender engine | **Situational orchestration engine** |

### Core concept: KBC Compass

**KBC Compass** is a privacy-first customer-state engine beneath KBC products and channels.

It creates a dynamic, customer-visible model such as:

- “Likely exploring a first home purchase”
- “Possible cash-flow pressure”
- “Preparing a renovation”
- “New mobility need”
- “Recurring travel pattern”
- “Investment anxiety after volatility”
- “Transitioning into retirement”
- “Likely new parent / household expansion”
- “Potential fraud vulnerability or financial stress”
- “Moving abroad or cross-border life change”

Each state has:

1. **Evidence:** Which signals contribute.
2. **Confidence:** How sure the system is.
3. **Freshness:** How long the state remains relevant.
4. **Permission:** Which data and contexts the customer allowed.
5. **Risk class:** Whether it may trigger only education, a prompt for confirmation, a human escalation, or nothing.
6. **Candidate actions:** Helpful tasks, not merely sales offers.
7. **Outcome feedback:** Accepted, dismissed, corrected, completed, or escalated.

This is a meaningful conceptual leap because it turns personalization from “recommendation delivery” into **shared customer understanding**.

***

## 2. What KBC already has

The research below separates strong evidence from inference. A “gap” is only called a gap where KBC’s public materials do not describe the more advanced capability—not because its absence has been proven internally.

### KBC ecosystem map

| Capability | Current capability | Likely data/signals | Customer value | Publicly visible limitation / open gap |
|---|---|---|---|---|
| KBC Mobile | A unified app for everyday banking, insurance and ecosystem services. It includes practical services such as public-transport tickets, parking/tank payments, document storage, renovation-cost simulation and vehicle discovery. | Accounts, transactions, product holdings, app activity, KBC ecosystem interactions, declared preferences | Reduces friction by concentrating daily money and life-admin tasks in one place | Public descriptions emphasize services and journeys; they do not clearly describe a customer-visible, cross-domain state model with confidence, evidence and correction.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/csr-vas-2025-nl.pdf) |
| Kate | Digital assistant available 24/7 for banking and insurance questions, practical support and insights; assists with claims, certificates and green-home advice. | Conversation intent, account/product context, previous service interactions, transaction-derived triggers | Immediate self-service, support and guided action | KBC explicitly describes proactive personalized suggestions in 140+ situations, so do **not** pitch generic proactive advice as new. The white space is orchestration of changing multi-signal life context.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/csr-vas-2025-en.pdf) |
| Kate GenAI | Since October 2025, KBC says Kate runs on GPT-4.1, aiming for more natural, accurate and empathetic responses to more complex questions. | Customer question, permitted customer context, policy/knowledge sources | Better natural-language service and guidance | An LLM conversational wrapper is not differentiated; use the LLM for explanation and controlled plan synthesis, not unbounded decision-making.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_EN.pdf) |
| Kate autonomy | KBC reported that Kate independently solves 70% of customer queries and serves 5.8 million digital customers across its core markets; it also operates in the Business Dashboard for corporate support. | Query type, knowledge, account context, service process data | Scalable customer service | The stated metric is query resolution. The opportunity is proactive continuity across channels before a customer has to ask.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_EN.pdf) |
| Kate Brain / decisioning | KBC refers publicly to data-driven proactive support and many personalized situations; external public detail on the technical “Kate brain” architecture is limited. | Likely event, customer, product, partner, engagement and propensity data | Delivers targeted support and commercial/service journeys | Do not claim it does not have a decision engine. Pitch an additive **state contract / consent / explainability layer** that could plug into existing decisioning.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_NL.pdf) |
| Kate Coins | Reward/benefits program, with automatic earning and spending across KBC and partners. Customers opting into personalized experience can earn Coins. KBC reported 6 million Coins earned in 2025. | Participating transactions, eligible partner interactions, consent to personalized experience, reward actions | Tangible benefit, loyalty and partner-network value | Risks reducing personalization to commercial targeting. The next layer should let customers choose non-commercial goals and prevent rewards from becoming a manipulation mechanism.  [kbc](https://www.kbc.com/en/investor-relations/reports/annual-reports.html) |
| MyMobility | Introduced as a mobility dashboard: car discovery, comparison, quotes, public transport, shared bikes, parking, fuel, loan and insurance routes; KBC described it as capturing signals for personalized suggestions. | Mobility searches, vehicle preferences, mobility purchases, parking/fuel/transport activity, quote and journey progress | Makes mobility choices and related finance/insurance easier | KBC has already framed it as a non-standalone ecosystem with personalization. The opportunity is detecting the *underlying mobility transition* before or beyond a vehicle-shopping journey.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251125_MyMobility_EN.pdf) |
| MyHome / housing | MyHome brings home budget, property value, renovation planning, energy consumption, certificates, loans, insurance, advice and partners together. KBC described an energy dashboard and digital access to renovation quotes. | Mortgage, home insurance, property/EPC data where available, energy data, renovation quotes, loan behavior, partner actions | Helps households plan, finance and execute home/renovation decisions | KBC is already moving toward a home dashboard. Avoid pitching “a renovation dashboard.” The gap is cross-domain detection and customer-controlled timing: e.g., recognizing a life transition, then coordinating home, cash flow, insurance and adviser support.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2026/20260129%20MyHome_NL.pdf) |
| Energy services | KBC provides energy insights and financing pathways for insulation, solar panels, heat pumps and batteries; it has noted strong growth in energy loans and certain technologies. | Energy consumption, EPC/certificate, home data, renovation plans, quotations, financing data | Helps customers understand/finance sustainability upgrades | Recommendations must distinguish factual insight from financial advice and avoid exploiting energy anxiety.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/Persbericht%20Batibouw_EN.pdf?zone=) |
| Insurance | Kate can guide claims and locate certificates; KBC Mobile integrates insurance management. | Policies, claims, insured assets, service contacts, contextual events where permitted | Faster service and reduced administrative burden | Insurance-related inferences are sensitive. Life-event inference should never auto-alter coverage or imply sensitive characteristics without confirmation.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/csr-vas-2025-en.pdf) |
| Payments and accounts | Core account management plus payments tied to parking, fuel and transit, with transaction data creating rich behavioral context. | Merchant data, amounts, timing, recurrence, balance, payment status, category | Convenient daily financial administration | Transaction data can be highly revealing. Use purpose limitation, minimum necessary features and short retention in the concept.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/investor-relations/Results/jvs-2025/csr-vas-2025-nl.pdf) |
| Savings, investments, loans | KBC offers standard banking-product journeys and can surface contextual assistance; its home and mobility ecosystems connect digitally into lending and insurance routes. | Savings balances, cash flow, investment holdings/trades, loan applications and repayments, simulation activity | Helps fund goals and manage finances | Never make a generative “approval” or “eligibility” engine. Creditworthiness/credit scoring is a high-risk AI use case under the EU AI Act framework.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251125_MyMobility_NL.pdf) |
| KBC Live, branches and human support | KBC’s home materials refer customers to KBC Live, branch appointments and Kate 24/7. | Appointment history, customer request, journey status, declared preference | Human expertise for complex/important decisions | A potential gap is a shared, consented “context brief” that lets an adviser begin where the customer left off instead of requiring retelling.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/Persbericht%20Batibouw_FR.pdf) |
| Third-party ecosystem | Partners support mobility, home, retail, leisure and related services. MyHome names partners including Setle, Eliq, Immoscoop and Impact Us Today. | Partner service activity, customer consent, journey metadata, transactional reward data | End-to-end problem solving beyond banking alone | Partner data must have clear purpose boundaries. A unified profile should not become unrestricted cross-partner surveillance.  [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/KTC%20PR%20EN%20Published%20Text%20Revised%20CLEAN.pdf) |
| Open banking / open finance | PSD2 supports payment-account data access by third parties at the customer’s request; EU open-finance proposals seek broader customer-controlled financial-data access. | External current-account data only with customer-authorized access; potentially broader finance data under future frameworks | More complete financial picture | Open data improves coverage, but it is not a license for unconstrained profiling. Consent must be granular, revocable and purpose-specific.  [finance.ec.europa](https://finance.ec.europa.eu/system/files/2022-10/2022-10-24-report-on-open-finance_en.pdf) |

### Important reality check

KBC is not starting from basic digital banking:

- Kate delivers proactive personalized suggestions in **more than 140 situations** in Belgium. [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_NL.pdf)
- KBC says Kate has engaged in **80 million conversations** since launch and contributes directly or indirectly to more than **400,000 products and services**. [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251124_Vijf%20jaar%20Kate_EN.pdf)
- MyMobility explicitly says it captures signals and offers relevant personalized insights. [kbc](https://www.kbc.com/content/dam/kbccom/doc/newsroom/pressreleases/2025/20251125_MyMobility_EN.pdf)
- MyHome explicitly promises personalized smart budget and energy indicators. [newsroom.kbc](https://newsroom.kbc.com/kbc-economics-belgiums-renovation-pace-remains-far-too-low)

So **“an AI that sees signals and sends recommendations” is probably not finalist-level differentiation**.

Your differentiation must be one or more of:

1. **Multi-signal state inference**, rather than one isolated trigger.
2. **Cross-domain orchestration**, rather than another vertical dashboard.
3. **Customer-visible explanations and correction**, rather than invisible scoring.
4. **Adaptive timing/channel/interface**, rather than more notifications.
5. **A trust architecture**, rather than compliance slides at the end.
6. **Temporary, uncertainty-aware context**, rather than permanent opaque customer labels.

***

## 3. Signal universe

### Design principle

A signal is not a fact about the customer’s identity or intention. It is evidence with uncertainty. The engine should retain a distinction between:

- **Observed event:** “A rent transfer stopped.”
- **Derived feature:** “Housing payment pattern changed.”
- **Hypothesis:** “The customer may be moving or buying a property.”
- **Confirmed state:** “The customer says they are moving.”
- **Permitted action:** “Offer a moving checklist and ask whether they want help.”

That separation is central to both trust and technical credibility.

### Customer signal map

| Signal family | Examples | Usefulness | Latency | Reliability | Sensitivity / consent | Scalability | Responsible benefit |
|---|---|---:|---:|---:|---|---:|---|
| Account cash-flow | Salary arrival, balance trend, recurring bills, overdraft pattern, income volatility | High | Near-real-time to daily | High for observed transactions; lower for interpretation | High sensitivity; contractual/service use may differ from personalization consent | Very high | Forecast pressure, help plan bills, build a buffer |
| Merchant and transaction patterns | Rent, utilities, childcare, travel, property deposits, subscriptions, recurring insurance payments | High | Near-real-time | Medium: merchant categorization can be wrong | High sensitivity; explicit personalized-context agreement recommended | Very high | Detect a recurring-cost rise, subscriptions, mobility or travel need |
| Product relationship | Loan, insurance, savings, investment, mortgage, claims, card type | High | Near-real-time | High | Sensitive financial data; strict purpose boundaries | Very high | Coordinate existing KBC services around a customer goal |
| Digital intent | Searches, simulator use, repeated product-page visits, comparison activity, abandoned forms | High | Immediate | Medium: curiosity is not intent | Consent and clear in-app transparency | Very high | Offer help after repeated friction, not after one click |
| Conversational intent | Kate question, explicit goal, stated preference, correction | Very high | Immediate | High if explicit; LLM extraction needs validation | Conversation privacy and transparent use | High | Convert customer wording into a customer-approved goal |
| Service interactions | Call reason, adviser note, complaint, appointment, claim progress | High | Hours to days | Medium to high | Sensitive; role-based access and purpose limitation | High | Avoid forcing repeated explanations and enable human continuity |
| Engagement signals | Read/dismiss/open, notification fatigue, preferred channel/time | Medium | Immediate | Medium | Consent needed for marketing/engagement profiling | Very high | Reduce interruptions and route only useful interventions |
| Ecosystem signals | Car quote, transit purchase, renovation quotation, energy dashboard activity, partner interaction | High in a relevant journey | Immediate to daily | Medium | Partner-specific consent, clear data-flow explanation | High | Connect fragmented tasks in an active life journey |
| Open-banking signals | External accounts, income, bills, cash flow | High for completeness | Daily / consent refresh | Varies by data quality | Explicit authorization and revocation needed | High | Prevent blind spots when KBC is not the main bank |
| Public contextual data | Interest-rate movements, energy prices, weather, public transport disruption, general market volatility | Medium | Real-time to daily | High for data, low for personal relevance | Usually lower sensitivity; relevance still requires restraint | Very high | Provide contextual timing, not invasive inference |
| Location/device context | Travel abroad, branch proximity, device/language/time zone | Medium | Immediate | Medium | High sensitivity, especially precise location; opt-in only | High | Offer travel help or relevant channel handoff |
| Declared goals/preferences | “Save €5,000,” “buy within 18 months,” risk tolerance, communication frequency, preferred channel | Very high | Immediate | High | Explicit, editable consent | Very high | Make personalization useful and controllable |
| Household / life-event data | Marriage, children, health, employment status, relationship context | Potentially high | Varies | Often low unless customer confirms | Extremely sensitive; do not infer or use without careful legal/ethical basis | Moderate | Use only customer-confirmed, purpose-bound goals; no sensitive-category speculation |
| Risk/security signals | New device, atypical payment, known scam cues, repeated authentication failure | High | Real-time | Medium to high | Security processing basis may differ, but limit repurposing | Very high | Fraud prevention and trusted intervention |

### Signal scoring rubric for your MVP

Use a clear, explainable formula rather than a hidden “AI confidence” number:

\[
\text{State confidence} =
\sum_i (\text{signal reliability}_i \times \text{relevance}_i \times \text{freshness}_i)
- \text{contradictory evidence}
\]

Then apply thresholds:

| Confidence | Allowed action |
|---|---|
| Low | Do nothing or display passive education only |
| Medium | Ask a lightweight confirmation question; show “Why this?” |
| High | Offer a reversible, low-risk task bundle |
| High + regulated/high-impact action | Hand off to existing rule-based regulated process or a human; do not let the inference engine decide |

### Signals to exclude from the hackathon vision

Avoid impressing judges with surveillance:

- Sensitive health, religion, political views, ethnicity, sexual orientation or similar special-category inference.
- Covert social-media scraping.
- Raw message content outside an explicitly scoped conversation.
- Precise continuous location tracking.
- Using security/fraud data to sell products.
- Turning life-event inference into automatic changes to credit, pricing, insurance coverage or investment suitability.
- “Emotion detection” from voice or facial signals.

These exclusions strengthen, rather than weaken, your trust story.

***

## 4. Fifteen high-value customer situations

The right question is not “Which product should KBC sell?” It is “Which customer situation has enough evidence, enough benefit and low enough downside to make a helpful intervention?”

| # | Signals | Inferred context / intent | Customer need | Best next action | Best channel | Expected value | Risk if wrong |
|---:|---|---|---|---|---|---|---|
| 1 | Salary increase; mortgage simulator returns; repeated MyHome visits; stable savings growth | Exploring first-home purchase | Understand affordability and next steps | Ask “Are you considering buying?” Then create an editable affordability plan, document checklist and optional adviser booking | Mobile state card; Kate for follow-up; KBC Live for high-value decision | High | Can feel presumptuous; customer may just be researching |
| 2 | Rent transfer stops; deposit payment; address-related search; moving-related merchants | Possible move or new home | Manage financial/admin transition | Confirm moving intent; present a time-boxed “moving lane”: budget, insurance review, utilities checklist, address-related tasks | Mobile; notification only after confirmation | High | Rent may stop for unrelated reasons |
| 3 | EPC/energy-dashboard activity; installer quote; recurring high energy costs; MyHome renovation views | Renovation planning | Sequence renovation, affordability and funding | A scenario planner showing cost, financing, expected energy impact and saved documents; no hard loan recommendation | MyHome / Mobile | High | Risk of inaccurate estimates or implying guaranteed savings |
| 4 | Salary delayed; low projected balance; bills due; historical irregular income | Short-term cash-flow stress | Avoid missed bills and regain control | Private cash-flow forecast, bill calendar, options to move money/save, and optional human support | Quiet in-app card; urgent alert only when customer chooses | Very high | Stigma, anxiety; do not market credit as default |
| 5 | Repeated overdraft/late-payment pattern; rising essential costs; declining savings | Financial vulnerability / sustained pressure | Stabilize finances | “Financial breathing room” plan: categorize essentials, identify subscriptions, set buffer target, explain support paths | Mobile with human escalation | Very high | Misclassification can shame or harm; must not become credit scoring |
| 6 | New recurring childcare/education merchants; shifts in household expenses; customer confirmation | Household-expense transition | Rebudget and understand coverage/benefits | Ask only general confirmed goal: “Would you like help planning a changing household budget?” | Mobile | Medium-high | Do not infer pregnancy, family status or sensitive facts |
| 7 | New employer/salary payer; employment-related benefit payments end; recurring commute change | Job transition | Set up a financial plan for new income/costs | Compare first 90 days of cash flow, automate savings allocation, update goals | Mobile; Kate on demand | High | Employer change may be internal/temporary |
| 8 | Benefit payments; salary disappearance; reduced inflows; affordability signal | Potential job loss or income disruption | Rapid stabilization and support | Offer a discreet “income changed?” check-in, cash-flow view, payment-support resources and human adviser option | In-app, never promotional push | Very high | High emotional risk; require cautious language and confirmation |
| 9 | Repeated car comparisons; repair payments; leasing end date; MyMobility activity | Vehicle replacement decision | Compare ownership, financing, insurance and mobility alternatives | Mobility Decision Canvas: total-cost comparison across used/new/lease/public transit, with customer priorities | MyMobility | High | KBC already supports vehicle discovery/quotes; differentiation must be decision orchestration, not a car marketplace |
| 10 | Transit/parking/fuel pattern shifts; travel or new commute; mobility searches | Changing mobility routine | Optimize cost/convenience | Ask goal: “Commuting differently?” Offer recurring cost snapshot and service options | MyMobility | Medium | Patterns are ambiguous; avoid tracking location beyond permission |
| 11 | International card use; travel bookings; destination-related payments; travel dates from customer confirmation | Upcoming travel | Prepare safely | Travel readiness card: card settings, insurance certificate, currency/spending view, emergency contacts | Mobile; time-limited notification | High | Trip may be someone else’s or a business trip |
| 12 | Larger recurring subscriptions; price increases; low use inferred only from customer confirmation | Subscription burden | Reduce waste | Subscription audit with “keep / review / cancel” workflow, customer chooses what to act on | Mobile | Medium-high | Merchant categorization errors; do not auto-cancel |
| 13 | Lump sum arrives; investment pages; repeated volatility checks; low-risk declared preference | Decision anxiety after cash/investment event | Understand options without unsuitable advice | Educational scenario explorer; suitability and regulated advice handled separately | Mobile; adviser handoff | High | Investment advice/suitability risk; no LLM recommendations |
| 14 | Mortgage nearing fixed-rate review; cash-flow change; rate environment change | Mortgage decision window | Understand choices in time | Deadline-aware preparation checklist and adviser appointment; explain rates and documents | Mobile + KBC Live | High | Avoid pressure tactics or personalized price claims |
| 15 | Savings pattern stable; retirement-account activity; age/goal explicitly declared; pension-related questions | Retirement planning exploration | Build confidence in long-horizon planning | Goal timeline, gap illustration and human expert handoff | Mobile + adviser | High | Sensitive profiling and regulated investment/pension guidance risk |

### Best three use cases for a hackathon

Do not demo all 15. Choose three that prove the engine generalizes:

1. **Home purchase / moving** — easy to explain; rich multi-signal evidence; KBC has relevant ecosystem assets.
2. **Cash-flow pressure** — high customer value and ethics; shows KBC is not merely selling products.
3. **Renovation decision** — naturally connects MyHome, energy, insurance, financing and partner services.

Together they show a system that can coordinate opportunity, support and sustainability without becoming a generic assistant.

***

## 5. Global benchmark

### What to learn—and what not to copy

Many leaders offer proactive financial insights. The distinction is whether they merely generate alerts or create a durable, trustable understanding of an evolving customer situation.

| Company / pattern | What it does | Why it works | What KBC could learn | What not to copy |
|---|---|---|---|---|
| Bank of America / Erica | Erica provides proactive insights, cash-flow help, personalized offers and specialist handoffs inside mobile banking. BofA reported 1.7 billion proactive personalized insights and examples such as subscription management, 7-day balance trends and appointment scheduling. | Practical, repeated, low-friction jobs; embedded in a channel customers already use; escalation to humans | Measure value through customer outcomes and service completion, not model novelty. Make handoff part of the experience | A high-volume alert machine. KBC already has an assistant; copying Erica features alone is not a strategic leap.  [info.bankofamerica](https://info.bankofamerica.com/en/digital-banking/erica) |
| Revolut | Commonly emphasizes real-time controls, analytics, subscription tools, saving mechanics and broad financial-product distribution | Immediate feedback and user agency make money management habitual | Build transparent real-time feedback loops and reversible controls | Feature accumulation without an integrated life-context model |
| Monzo | Known for budgeting, spending categorization, pots, salary-linked flows and a friendly financial-health orientation | Gives customers understandable, actionable money views rather than abstract banking data | Use plain language and micro-actions that restore control | Turning all personalization into budgeting; KBC needs broader home/mobility/insurance orchestration |
| N26 | Uses push insights and transaction-driven money management in a clean mobile experience | Timeliness and simplicity | Good moment selection and minimal UI | Notifications without evidence, consent or user control |
| ING | Has invested heavily in data-driven next-best-action and personalized customer engagement | Mature operating model for taking action from customer signals | Treat decisioning, experimentation and measurement as platform capabilities | Copying bank-internal propensity models without an explainable customer-facing layer |
| BBVA | Has pursued data-driven advisory and financial-health experiences, including personalized insights and PFM-style tools | Strong financial-data foundation coupled to education | Make guidance understandable and customer-beneficial before commercial | Over-interpreting financial data as certainty |
| Santander | Uses a broad ecosystem and platform approach across banking and partner services | Distribution, reach and partner ecosystems | KBC can use its existing ecosystems as action endpoints | Partner-led cross-selling masquerading as customer help |
| Capital One | Emphasizes intelligent experiences, real-time alerts and developer/data capabilities | Good data infrastructure and customer-facing utility reinforce each other | Architecture matters: build an event-driven signal-to-action loop | Building invisible complexity before proving a customer moment |
| Nubank | Combines simple UX, real-time messaging and financial inclusion orientation | Empathy, clarity and transparency reduce intimidation | Use conversational clarity and customer control for financially stressful moments | Oversimplifying European regulatory and multi-product constraints |
| Wise | Makes fees, exchange rates and payment status highly transparent | Trust grows from predictable, legible mechanics | “Why this?” and transparent trade-offs should be first-class UX | Treating all banking needs as payment-status problems |
| Klarna | Uses contextual shopping and payment signals to personalize checkout/payment options | Relevance is near the moment of intent | Meet customers at intent moments, not generic campaign calendars | Encouraging spending or credit where the customer may be financially vulnerable |
| Apple | Uses privacy-by-design framing, on-device processing and permission-centric UX | Privacy is understandable and visible, not buried in policy | Make “data used,” “purpose,” “duration” and “turn off” visible | Privacy theater: claims must match actual data flows |
| Google | Contextual assistance built from broad signals, preferences and device context | Cross-product context can remove friction | Context orchestration is powerful when users can inspect/control it | Cross-context surveillance or unexpected reuse of data |
| Spotify / Netflix | Behavioral recommendations adapt continually based on implicit and explicit feedback | Feedback loops improve relevance | Use accept/dismiss/correct as training signals; make correction easy | Treating financial life as entertainment. Wrong financial inference carries material consequences |
| Amazon | Uses browsing, purchasing and intent signals to rank likely needs | Strong next-best-action timing and experimentation | Event-driven experimentation and clear conversion measurement | Maximizing conversion rather than customer outcomes; banking must optimize welfare, trust and fairness |

### Benchmark conclusion

The market already proves that proactive insight, assistant interfaces and recommendation systems work at scale. KBC’s potential edge is not feature parity; it is the ability to connect **banking + insurance + home + energy + mobility + partner services + human expertise** into an accountable customer-state system.

That is more defensible than “our chatbot sounds more human.”

***

## 6. White space: where KBC can go next

### White-space opportunities

| Opportunity | Why it goes beyond current public KBC positioning | Strategic value | Hackathon viability |
|---|---|---|---|
| Customer State Engine | KBC already offers proactive suggestions, but public sources do not describe a customer-visible, evidence-based, temporary state model shared across domains | Very high | Excellent |
| Intent Graph | Connects signals, hypotheses, goals, actions and outcomes, so KBC can explain why a suggestion appeared | High | Good as a visual MVP |
| Personalization Control Center | Lets users inspect, correct, pause and scope the inferred profile | Very high for trust differentiation | Excellent |
| Cross-channel Context Passport | Customer-approved summary travels from Mobile to Kate to KBC Live/adviser | High | Excellent as a simulated demo |
| Life-event orchestration | Recognizes and coordinates a multi-step transition instead of firing isolated offers | Very high | Excellent |
| Financial-health guardrail | Prioritizes financial resilience, not sales, when the customer shows pressure | High ethical/customer value | Excellent |
| Adaptive interface | Changes the home screen’s “next task” based on confirmed state, confidence and urgency | High visible demo impact | Excellent |
| Agentic execution layer | Agents coordinate partner actions, paperwork and services within governed permissions | Potentially high | Risky; mock the orchestration, do not build autonomous agents |
| Autonomous finance | Moves money or buys/changes products automatically | Low near-term trust/regulatory viability | Reject for hackathon |
| Customer digital twin | Useful only if it is a bounded, editable state model—not a creepy immutable behavioral dossier | High if reframed | Good, but call it “Compass profile” or “State Map,” not “digital twin” |

### The key product move

Build a **Customer State Contract**.

Instead of KBC silently maintaining a profile, the customer sees:

> “KBC Compass currently thinks you may be planning a move.  
> **Why?** Your rent payment stopped, you saved a housing-related document, and you visited MyHome twice.  
> **Confidence:** Medium.  
> **What we will use:** your KBC transactions and MyHome activity for 30 days.  
> **You decide:** Confirm / Not relevant / Pause this kind of help.”

This transforms personalization from an opaque system acting *on* the customer into a system reasoning *with* the customer.

***

## 7. Ten hackathon concepts

### 1. KBC Compass — Customer State Engine

**One-line idea:** An explainable, consent-first intelligence layer that detects changing customer situations from multi-signal evidence and orchestrates the next best helpful journey across KBC channels.

- **Customer problem:** Customers repeatedly navigate fragmented banking, insurance, home and mobility services without KBC understanding the overall situation.
- **Insight:** Individual signals are weak; clusters of signals plus customer confirmation create useful, safe context.
- **Signals used:** Transactions, recurring-payment changes, app journeys, simulators, ecosystem events, explicit goals, engagement feedback.
- **How it works:** Event stream → feature extraction → rule/ML state hypotheses → confidence + policy gate → journey orchestrator → adaptive mobile/Kate/adviser experience → customer feedback.
- **Personalization mechanism:** A time-bounded state graph, not static segments.
- **Why different from Kate today:** Kate is a powerful interaction channel; Compass is the underlying cross-channel state, consent, evidence and orchestration layer.
- **WOW moment:** A customer’s home screen changes from generic accounts to “Your move, made simpler,” with visible evidence, confidence, a journey checklist and a one-click correction.
- **Tech architecture:** React/Next frontend, FastAPI/Node API, PostgreSQL/Supabase, rules/state engine, LLM only for controlled explanation/summary, SSE/WebSocket event animation.
- **Can fake/mock:** KBC APIs, product catalog, partner systems, adviser calendar, notifications.
- **Must work:** Event ingestion, multi-signal state inference, confidence scoring, explanation, adaptive UI, consent controls, three-person demo switching.
- **Privacy/security:** Synthetic data, consent ledger, purpose tags, state expiry, role-based channels, no autonomous regulated decision.
- **Scalability:** Stateless event processors + per-customer state store + policy engine; batch and streaming modes.
- **Risks:** Can look like a fancy rules engine unless you visualize evidence, contradictions, feedback and generalization.

### 2. Financial Weather — Early-Warning Resilience Engine

**One-line idea:** A non-judgmental financial-health system that predicts short-term cash-flow stress and offers customer-controlled micro-interventions before a problem becomes a crisis.

- **Customer problem:** Customers often discover cash-flow pressure after bills fail or savings are depleted.
- **Insight:** Delayed income, rising essential expenses, upcoming bills and declining buffers can produce a timely, actionable forecast.
- **Signals used:** Income timing, recurring bills, balance trend, bill due dates, subscriptions, opted-in external accounts, customer-set safety buffer.
- **How it works:** Forecast 14–30 day cash flow; identify source of pressure; choose least intrusive action; never treat stress as marketing eligibility.
- **Personalization mechanism:** Personal baseline, preferred buffer, pay-cycle model, notification preference and opt-in level.
- **Why different from Kate today:** Not a Q&A assistant or generic spend alert; it is a welfare-first intervention policy with customer-defined guardrails.
- **WOW moment:** A simulated delayed salary instantly updates the forecast, the system shows “not a crisis—here is the first bill at risk,” and offers three reversible actions.
- **Tech architecture:** Time-series simulator + deterministic cash-flow forecast + explanation templates + UI.
- **Can fake/mock:** Payment dates, connected-account data, debt-support partner referral.
- **Must work:** Forecast math, stress explanation, scenario simulator, safe action ranking.
- **Privacy/security:** No credit-score output; no sales targeting from vulnerability signals; local/minimized features; clear opt-out.
- **Scalability:** Simple daily batch scoring plus event-triggered recalculation.
- **Risks:** High emotional sensitivity; inaccurate prediction can cause anxiety. Keep language cautious and action reversible.

### 3. Life Event Router — Cross-Domain Journey Orchestrator

**One-line idea:** When a customer confirms a life transition, KBC assembles a personalized, time-aware journey across banking, insurance, housing, energy, mobility and human support.

- **Customer problem:** Major transitions require dozens of disconnected tasks.
- **Insight:** KBC’s real advantage is not predicting every event; it is coordinating relevant help once intent is confirmed.
- **Signals used:** State hypotheses from Compass, declared goal, product portfolio, lifecycle stage, timeline, partner availability.
- **How it works:** Generate a dependency-aware plan: “do now,” “before move,” “after move”; tasks map to products, education, partners and people.
- **Personalization mechanism:** Goal, timeline, financial comfort level, product ownership and channel preference.
- **Why different from Kate today:** A durable shared journey board, not a conversation and not an offer carousel.
- **WOW moment:** After confirming “I’m moving,” an animated journey appears, automatically skips irrelevant tasks and creates an adviser context brief.
- **Tech architecture:** Task graph + policy/rules engine + front-end checklist; LLM for plain-language plan only.
- **Can fake/mock:** Partner completion, calendar, documents, external government tasks.
- **Must work:** Task dependency engine, relevance filtering, context handoff and customer edits.
- **Privacy/security:** Customer confirms event; no life-event speculation shown as fact.
- **Scalability:** Reusable journey templates with personalization slots.
- **Risks:** Could become a checklist app if it lacks state inference and adaptive orchestration.

### 4. Explain My KBC — Personalization Control Center

**One-line idea:** A customer-facing dashboard that makes KBC’s personalization understandable, editable and revocable.

- **Customer problem:** Personalization feels creepy when customers cannot see why the system believes something or where data travels.
- **Insight:** Trust increases when customers can inspect, correct and constrain the model.
- **Signals used:** Existing profile features, app activity, transaction-derived categories, goals and consents.
- **How it works:** Shows “What KBC understands,” evidence, confidence, expiration, data source, purpose and controls.
- **Personalization mechanism:** Customer-edited state and permissions directly feed decisioning.
- **Why different from Kate today:** It is a control plane for *all* personalization, not a conversational interface.
- **WOW moment:** Customer taps “That is not me”; a wrong home-buying state disappears and the adaptive UI recalculates instantly.
- **Tech architecture:** Profile/state API + consent ledger + explainability component.
- **Can fake/mock:** Underlying KBC profile sources.
- **Must work:** Editable state, consent mutation, immediate impact on recommendation.
- **Privacy/security:** Strongest concept on transparency, access and revocation.
- **Scalability:** Central governance layer across all KBC journeys.
- **Risks:** Less flashy alone; pair with Compass for a compelling demo.

### 5. Decision Canvas — Major Purchase Trade-off Simulator

**One-line idea:** An AI-guided, explainable simulator that helps customers make complex home, car or renovation decisions based on total cost, cash flow and goals—not product push.

- **Customer problem:** Customers struggle to compare choices across cost, financing, insurance, energy and lifestyle.
- **Insight:** KBC knows enough to show consequences, but must keep the customer in control.
- **Signals used:** Declared goal, budget, cash-flow baseline, existing products, MyHome/MyMobility activity, public rates/prices.
- **How it works:** Converts options into comparable monthly/total-cost scenarios; highlights assumptions and uncertainty.
- **Personalization mechanism:** Adjustable priorities: lowest monthly cost, lowest carbon impact, flexibility, fastest completion.
- **Why different from Kate today:** A visual decision environment rather than advice in chat.
- **WOW moment:** Dragging “renovate first” changes cash flow, loan need, energy estimate and timeline live.
- **Tech architecture:** Scenario calculator + parameter store + visualization.
- **Can fake/mock:** Rates, energy estimates, car inventory.
- **Must work:** Transparent calculations and preference-driven ranking.
- **Privacy/security:** No approval or recommendation; educational scenario support.
- **Scalability:** Template-driven across home, mobility, education and retirement.
- **Risks:** Existing KBC simulators may overlap; win only if cross-product and explainable.

### 6. Context Passport — Never Repeat Yourself

**One-line idea:** A customer-approved portable context summary that follows a journey from Mobile to Kate to KBC Live/branch.

- **Customer problem:** Customers repeat their story across channels, lowering trust and completion.
- **Insight:** The key personalization moment may be human handoff, not a recommendation.
- **Signals used:** Customer-confirmed state, active journey, completed tasks, explicit question, shared documents.
- **How it works:** User presses “Share my context”; a compact, editable brief is created with expiry and purpose.
- **Personalization mechanism:** Context is role-specific and customer-curated.
- **Why different from Kate today:** It operationalizes omnichannel memory with explicit customer control.
- **WOW moment:** An adviser screen receives a redacted, customer-approved “Moving journey brief,” and starts with the exact unresolved question.
- **Tech architecture:** Encrypted context object, share token, role/purpose checks, mock adviser portal.
- **Can fake/mock:** CRM and adviser workflow.
- **Must work:** Consent grant, brief generation, selective sharing, expiry/revocation.
- **Privacy/security:** Strong: least privilege, one-time token, content preview, audit trail.
- **Scalability:** Standard context schema across service journeys.
- **Risks:** More operational than dazzling unless coupled with Compass.

### 7. Signal-to-Goal — Goal Discovery Assistant

**One-line idea:** Instead of guessing life events, the system turns weak behavior into low-pressure invitations to create explicit customer goals.

- **Customer problem:** Banks infer too much; customers do not always know which goal to set.
- **Insight:** The ethical value of weak signals is to prompt reflection, not make assertions.
- **Signals used:** Repeated simulator use, recurring spend shifts, searches, savings behavior, customer feedback.
- **How it works:** “You’ve been comparing housing costs. Want to start a private ‘explore home options’ goal? You can keep it private or let KBC help.”
- **Personalization mechanism:** The customer promotes a hypothesis into an explicit goal.
- **Why different from Kate today:** Reframes prediction as consented goal formation.
- **WOW moment:** A low-confidence home signal becomes a confirmed goal, instantly unlocking a tailored plan and hiding irrelevant sales prompts.
- **Tech architecture:** State hypothesis → invitation policy → goal object → journey triggers.
- **Can fake/mock:** Underlying product catalog.
- **Must work:** Hypothesis confidence, goal confirmation, adaptive plan.
- **Privacy/security:** Excellent: user consent is the conversion point.
- **Scalability:** High; reusable goal templates.
- **Risks:** More subtle than a “magic” inference demo; tell the ethics story well.

### 8. Quiet Mode — Notification Intelligence and Attention Budget

**One-line idea:** A system that decides when *not* to interrupt customers, preserving attention for genuinely valuable moments.

- **Customer problem:** Notification fatigue causes customers to ignore important banking information.
- **Insight:** Personalization is also restraint.
- **Signals used:** Open/dismiss patterns, urgency, time of day, channel preference, state confidence, interaction history.
- **How it works:** Applies an attention budget and ranks messages by customer benefit, urgency and confidence.
- **Personalization mechanism:** Individual interruption tolerance and preferred timing.
- **Why different from Kate today:** Systemic channel governance rather than another alert.
- **WOW moment:** The engine suppresses a promotional offer during cash-flow stress but delivers a relevant bill-risk alert at the customer’s preferred time.
- **Tech architecture:** Notification queue, policy engine, bandit/mock optimizer, audit log.
- **Can fake/mock:** Push delivery.
- **Must work:** Ranking, suppression and visual explanation.
- **Privacy/security:** Low-risk compared with credit/investment use cases; transparent controls.
- **Scalability:** Extremely high.
- **Risks:** Not enough breadth alone; integrate it into Compass.

### 9. Financial Health Autopilot, With Brakes

**One-line idea:** Customers define guardrails—minimum balance, savings target, bill priority—and KBC recommends or prepares actions while requiring confirmation for all money movement.

- **Customer problem:** Good intentions fail when financial actions require constant manual effort.
- **Insight:** Customers want assistance without surrendering agency.
- **Signals used:** Cash flow, goal progress, budget rules, upcoming bills, customer-set limits.
- **How it works:** Generates a proposed weekly plan; customer reviews/approves; can automate only permitted internal transfers.
- **Personalization mechanism:** Customer-defined rules plus observed cash-flow context.
- **Why different from Kate today:** A policy-driven planning layer rather than dialogue.
- **WOW moment:** A salary arrives; the system proposes a safe split into bills, buffer and goal—customer slides to approve.
- **Tech architecture:** Rules evaluator, forecast engine, action proposal queue.
- **Can fake/mock:** Transfer execution.
- **Must work:** Safe proposal generation and customer approval UI.
- **Privacy/security:** Strong confirmation, limits, simulation mode; do not use external-account data without consent.
- **Scalability:** High.
- **Risks:** Autonomous-finance implications; avoid actual execution in the MVP.

### 10. Household Money Map

**One-line idea:** A consented shared financial-goal space for households that preserves individual privacy while coordinating common obligations.

- **Customer problem:** Shared costs and life plans are hard to manage without exposing every transaction.
- **Insight:** Personalization often fails because the unit of need is a household, while data is individual.
- **Signals used:** Customer-declared shared goals, opted-in shared expenses, joint products, manually selected transactions.
- **How it works:** Each participant chooses exactly what is shared; the engine creates joint budget/goal visibility without full account surveillance.
- **Personalization mechanism:** Shared permissions plus individual boundaries.
- **Why different from Kate today:** A privacy-preserving multi-person context model.
- **WOW moment:** Two customers set a move goal; their shared plan reconciles contributions without revealing private spending.
- **Tech architecture:** Multi-party consent graph, encrypted scopes, shared goal ledger.
- **Can fake/mock:** Joint-account rails and partner sharing.
- **Must work:** Permissions model and shared-goal calculations.
- **Privacy/security:** The core innovation is granular, revocable consent.
- **Scalability:** High but complex.
- **Risks:** Highest consent/relationship complexity; likely too ambitious for three people unless strictly narrowed.

***

## 8. Comparison and selection

Scores are 1–5, where 5 is strongest for the stated hackathon criterion.

| Concept | Originality | Challenge fit | Visible AI intelligence | Demo wow | Feasible | Scalable | Customer value | Technical credibility | Privacy/trust | Explainable in 3 min | Total / 50 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1. KBC Compass | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | **49** |
| 2. Financial Weather | 4 | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | **48** |
| 3. Life Event Router | 4 | 5 | 4 | 4 | 5 | 5 | 5 | 4 | 4 | 5 | **45** |
| 4. Explain My KBC | 5 | 4 | 3 | 4 | 5 | 5 | 4 | 5 | 5 | 5 | **45** |
| 5. Decision Canvas | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | **40** |
| 6. Context Passport | 4 | 5 | 3 | 4 | 5 | 5 | 5 | 5 | 5 | 4 | **45** |
| 7. Signal-to-Goal | 5 | 5 | 4 | 4 | 5 | 5 | 5 | 4 | 5 | 5 | **47** |
| 8. Quiet Mode | 4 | 4 | 4 | 4 | 5 | 5 | 4 | 5 | 5 | 4 | **44** |
| 9. Health Autopilot | 4 | 4 | 4 | 5 | 4 | 5 | 5 | 4 | 4 | 4 | **43** |
| 10. Household Money Map | 5 | 4 | 4 | 4 | 2 | 4 | 5 | 4 | 5 | 3 | **40** |

### Top three directions

1. **KBC Compass** — recommended overall winner.
2. **Financial Weather** — recommended as the most emotionally compelling and technically buildable “proof use case.”
3. **Signal-to-Goal + Life Event Router** — combine them into Compass as the trustful conversion from inferred hypothesis to customer-confirmed journey.

### Recommendation: one coherent MVP

Do **not** build three products. Build one platform story:

> **KBC Compass = State Engine + Signal-to-Goal + Financial Weather + Journey Router + Explain My KBC.**

The main demo use case is **home/move**. The system then proves generalization with **cash-flow pressure** and **renovation**.

***

## 9. Detailed MVP plan

### MVP A: KBC Compass

#### Core loop

```text
Synthetic customer events
        ↓
Signal normalisation and feature extraction
        ↓
State-hypothesis engine
        ↓
Evidence, confidence, freshness and consent-policy checks
        ↓
Customer State Map
        ↓
Journey/action orchestration
        ↓
Adaptive KBC Mobile / Kate / KBC Live context
        ↓
Customer accepts, dismisses, corrects or confirms
        ↓
State and future actions are updated
```

#### MVP scope

Build only these three states:

| State | Key signals | Threshold | Customer action |
|---|---|---|---|
| Exploring home purchase / move | Salary change, rent disappears, MyHome visits, mortgage simulation, saving trend | 3 of 5 signals or weighted confidence > 0.70 | Confirm / not relevant / explore privately |
| Financial pressure | Income delay, bills due, projected negative balance, buffer erosion | Forecast below customer-set buffer | View plan / mute / ask for help |
| Renovation planning | EPC/energy dashboard activity, installer quote, renovation search, home-related spending | 2–3 signals plus fresh activity | Create renovation plan / ignore |

#### Synthetic customer dataset

Use 30–100 generated customers, with three deeply detailed personas.

**Persona 1: Elise, “home/move.”**

```json
{
  "customer_id": "C-001",
  "name": "Elise",
  "profile": {
    "age_band": "25-34",
    "preferred_channel": "in_app",
    "personalisation_consent": true,
    "goal_visibility": "customer_controlled"
  },
  "products": ["current_account", "savings_account", "tenant_insurance"],
  "states": [],
  "events": [
    {"day": 1, "type": "salary_received", "amount": 3350},
    {"day": 4, "type": "myhome_page_view", "topic": "mortgage_affordability"},
    {"day": 6, "type": "mortgage_simulation_completed", "budget": 355000},
    {"day": 9, "type": "savings_growth", "amount": 900},
    {"day": 12, "type": "rent_transfer_missing"},
    {"day": 13, "type": "property_document_saved"}
  ]
}
```

**Persona 2: Karim, “financial pressure.”**

```json
{
  "customer_id": "C-002",
  "name": "Karim",
  "profile": {
    "preferred_channel": "in_app",
    "personalisation_consent": true,
    "financial_health_opt_in": true,
    "minimum_buffer": 250
  },
  "products": ["current_account", "savings_account"],
  "events": [
    {"day": 1, "type": "salary_expected", "amount": 2450},
    {"day": 2, "type": "salary_missing"},
    {"day": 3, "type": "utility_payment", "amount": -280},
    {"day": 4, "type": "insurance_payment", "amount": -130},
    {"day": 5, "type": "subscription_price_increase", "amount": -18}
  ]
}
```

**Persona 3: Sofia, “renovation.”**

```json
{
  "customer_id": "C-003",
  "name": "Sofia",
  "profile": {
    "personalisation_consent": true,
    "home_energy_consent": true
  },
  "products": ["mortgage", "home_insurance", "current_account"],
  "events": [
    {"day": 1, "type": "energy_dashboard_opened"},
    {"day": 2, "type": "epc_certificate_uploaded", "rating": "E"},
    {"day": 4, "type": "partner_quote_requested", "category": "heat_pump"},
    {"day": 7, "type": "myhome_page_view", "topic": "energy_loan"}
  ]
}
```

#### AI reasoning layer

Use a hybrid architecture:

1. **Deterministic event rules** for auditability and reliable demo behavior.
2. **Weighted evidence scoring** for multi-signal inference.
3. **LLM only for controlled language tasks**, not for financial eligibility, credit, pricing, suitability or final decisioning:
   - Convert state + evidence into empathetic explanation.
   - Summarize a state for KBC Live.
   - Generate plain-language, policy-approved journey copy.
   - Extract explicit goals from a simulated customer conversation, with confirmation.

Example state object:

```json
{
  "state_id": "S-983",
  "customer_id": "C-001",
  "state_type": "HOME_PURCHASE_OR_MOVE",
  "status": "HYPOTHESIS",
  "confidence": 0.78,
  "freshness_days": 30,
  "evidence": [
    {
      "signal": "mortgage_simulation_completed",
      "weight": 0.28,
      "observed_at": "2026-09-24"
    },
    {
      "signal": "rent_transfer_missing",
      "weight": 0.22,
      "observed_at": "2026-09-28"
    },
    {
      "signal": "myhome_repeated_visits",
      "weight": 0.18,
      "observed_at": "2026-09-25"
    },
    {
      "signal": "property_document_saved",
      "weight": 0.10,
      "observed_at": "2026-09-29"
    }
  ],
  "consent_scope": ["personalised_life_journeys", "myhome_activity"],
  "allowed_actions": ["ASK_FOR_CONFIRMATION", "SHOW_EDUCATIONAL_JOURNEY"],
  "prohibited_actions": ["AUTOMATED_CREDIT_DECISION", "PUSH_SALES_OFFER"]
}
```

#### APIs

| Endpoint | Purpose |
|---|---|
| `POST /events` | Ingest a synthetic event |
| `GET /customers/{id}/state-map` | Return current states, confidence, evidence, expiry and controls |
| `POST /customers/{id}/states/{stateId}/confirm` | Customer confirms/rejects/corrects state |
| `GET /customers/{id}/journey` | Return personalized next actions and task dependencies |
| `POST /customers/{id}/consent` | Change data purpose/scope permissions |
| `POST /customers/{id}/feedback` | Capture accepted/dismissed/not-relevant feedback |
| `GET /adviser/context/{shareToken}` | Retrieve scoped, customer-approved handoff context |
| `GET /demo/replay/{persona}` | Run a deterministic event sequence for demo reliability |

#### Database

For a hackathon, use Supabase/Postgres or SQLite if speed matters.

Core tables:

```text
customers
customer_preferences
consents
events
signals
state_hypotheses
state_evidence
journeys
journey_tasks
recommendation_decisions
feedback
context_passports
audit_log
```

Every decision needs an audit record:

```text
timestamp
customer_id
event_ids_used
state_output
confidence
policy_result
action_shown
model_or_rule_version
customer_response
```

#### Frontend

Build three screens, not ten:

1. **Customer KBC Mobile view**
   - Before state activation: standard overview.
   - After: personalized “Compass card.”
   - Displays “Why am I seeing this?” and controls.

2. **Compass State Map**
   - Visual timeline of incoming signals.
   - State confidence thermometer.
   - Evidence chips.
   - Customer correction controls.
   - Consent and expiration settings.

3. **KBC Live / adviser view**
   - Simulated customer-approved context passport.
   - Shows only purpose-authorized information.
   - Adviser sees the customer’s question and unresolved tasks, not raw behavioral surveillance.

#### Dashboard / visualization

This is your technical-ability showcase:

```text
Event stream (left)
   → Signal cards (middle-left)
   → State graph + confidence (middle)
   → Policy guardrails (middle-right)
   → Customer experience output (right)
```

Color language:

- Blue: observed signal.
- Purple: inferred hypothesis.
- Green: customer-confirmed goal.
- Amber: requires customer confirmation.
- Red: action blocked by policy/high-risk boundary.
- Grey: expired or revoked context.

This makes the judges understand it is a **system**, not hand-authored recommendations.

***

### MVP B: Financial Weather

#### Core loop

```text
Transactions / scheduled bills / expected income
        ↓
Personal cash-flow baseline
        ↓
14-day balance projection
        ↓
Risk and sensitivity check
        ↓
Least-intrusive intervention selector
        ↓
Customer-controlled plan
        ↓
Outcome feedback
```

#### Essential functionality

- Calculate daily projected balance for 14 days.
- Show which event creates potential pressure.
- Offer three safe actions:
  - Review upcoming bills.
  - Move an amount from savings, simulated and confirmation-required.
  - Reduce/inspect selected subscriptions.
  - Optionally request human support.
- Demonstrate suppression of marketing during vulnerability state.

#### Critical wording

Never write:

> “You are financially vulnerable.”

Use:

> “Your upcoming payments may bring your balance below the buffer you chose. Want to review your next 14 days?”

That distinction is product maturity.

***

### MVP C: Signal-to-Goal + Life Event Router

#### Core loop

```text
Weak, non-conclusive signals
        ↓
Low-pressure goal invitation
        ↓
Customer confirmation or correction
        ↓
Goal created with scope, timeline and privacy setting
        ↓
Relevant multi-domain journey assembled
        ↓
Progress and user feedback continuously update it
```

#### Essential functionality

- Prompt with uncertainty.
- Let the user choose:
  - “Yes, I am exploring.”
  - “Not now.”
  - “Not relevant.”
  - “Keep this private; do not use it for suggestions.”
- Generate a three-phase journey:
  - Explore.
  - Prepare.
  - Act.
- Create a customer-approved Context Passport for KBC Live.

This is an excellent trust differentiator because it makes the user the authority on their own life context.

***

## 10. Recommended technical architecture

### Architecture diagram

```text
                        ┌──────────────────────────────┐
                        │ Synthetic Event Generator    │
                        │ transactions / app / partner │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────┐
│ Event & Signal Layer                                             │
│ event normalizer → feature extraction → signal reliability tags │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│ Customer State Engine                                            │
│ rules + weighted evidence + freshness + contradiction detection │
│ outputs: hypothesis, confidence, expiry, evidence               │
└───────────────┬────────────────────────────────┬───────────────┘
                │                                │
                ▼                                ▼
┌─────────────────────────┐      ┌────────────────────────────────┐
│ Consent & Policy Engine │      │ Journey Orchestrator           │
│ purpose / scope / limits│      │ next helpful task / channel    │
│ prohibited-use checks   │      │ dependency-aware task graph    │
└──────────────┬──────────┘      └───────────────┬────────────────┘
               │                                 │
               └───────────────┬─────────────────┘
                               ▼
              ┌──────────────────────────────────────┐
              │ Experience Layer                      │
              │ KBC Mobile / Kate / Push / KBC Live  │
              │ customer State Map / Context Passport│
              └──────────────────┬───────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────┐
              │ Feedback + Audit                      │
              │ accept / dismiss / correct / complete │
              │ monitoring / explanation / replay     │
              └──────────────────────────────────────┘
```

### Stack recommendation for a team of three

| Layer | Fast practical choice | Reason |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind + Framer Motion | High polish fast; visual event animation |
| Backend | FastAPI or Node/Express | Small API surface and fast demo iteration |
| Data | Supabase/Postgres | Auth, database, realtime events and dashboard capability |
| State logic | Python rules/scoring module or TypeScript service | Deterministic and inspectable |
| LLM | API with JSON-schema output / function calling | Controlled explanations and summaries only |
| Visualization | React Flow, D3, Recharts or simple SVG | State graph and confidence evidence visualization |
| Auth | Mock role switcher for demo; Supabase Auth if time allows | Customer/adviser persona split |
| Security demo | Signed mock context token, consent gate, audit log | Visibly demonstrates security thinking |

### Team split

| Team member | Main ownership | Secondary ownership |
|---|---|---|
| Person 1 | Frontend, mobile UI, state-map visualization, demo polish | Storyboard and presentation |
| Person 2 | Backend APIs, event simulator, database, state engine | Deployment |
| Person 3 | Product logic, synthetic personas, policy/consent layer, LLM prompts | Testing, pitch, trust UX |

### What actually needs to work

Prioritize these six things:

1. Event playback changes a real computed state.
2. State confidence comes from multiple evidence items.
3. Policy/consent can block an otherwise plausible action.
4. Customer confirmation modifies the state and UI immediately.
5. Three personas receive different experiences from the same engine.
6. The adviser handoff contains only customer-approved context.

### What should be mocked

Mock everything that creates integration burden:

- Core banking systems.
- Real customer data.
- Credit decisioning.
- Actual payments or transfers.
- Partner APIs and service execution.
- Real KBC push-notification delivery.
- Adviser CRM.
- Exact rates, underwriting, financial advice and insurance pricing.
- Real open-banking consent rails.

Be explicit: **“We are demonstrating the orchestration layer, not claiming we built a bank core.”**

***

## 11. 90-second demo storyboard

### Demo goal

The judges should leave with this exact thought:

> “This is not a manually coded offer. It is an explainable system that turns evolving customer context into useful, consented cross-channel help.”

### 0–10 seconds: before

Show Elise’s generic KBC Mobile home screen.

**Narration:**

> “Today, KBC sees many events: a salary, a simulator visit, a missing rent payment, a saved document. Each system sees a fragment. No one sees the situation.”

### 10–28 seconds: events happen

Animate four events entering the dashboard:

1. Salary arrives.
2. Elise completes mortgage affordability simulation.
3. Elise visits MyHome twice.
4. Her usual rent payment does not occur.
5. She saves a property-related document.

The event stream lights up.

### 28–42 seconds: AI understands, but does not pretend certainty

The Compass State Map animates:

```text
Observed facts → “Possible home purchase / move”
Confidence: 78% | Freshness: 30 days
```

Show the evidence chips and one contradictory/neutral factor if you have time.

**Narration:**

> “Compass does not label Elise as a home buyer. It holds a temporary hypothesis, shows its evidence, and checks whether it has permission to help.”

### 42–58 seconds: policy guardrail

Show a red blocked action:

```text
Blocked: “Pre-approved mortgage offer”
Reason: high-impact credit decision is not allowed from this inference.
```

Then show allowed action:

```text
Allowed: Ask customer to confirm, then offer education and planning support.
```

**Narration:**

> “The engine cannot turn behavioral inference into a credit decision. Instead, it offers low-risk, reversible help.”

This earns security and trust points.

### 58–72 seconds: adaptive customer experience

Elise’s mobile home screen updates:

> “Planning a move or home purchase?  
> We noticed a few signs, but we might be wrong.  
> **Why am I seeing this?**  
> [Yes, help me explore] [Not relevant] [Pause this kind of help]”

Elise clicks **Yes, help me explore**.

The UI becomes a personalized journey:

- Understand budget.
- Explore a property.
- Prepare documents.
- Review insurance.
- Book a KBC Live conversation.

### 72–82 seconds: omnichannel memory

Elise clicks **“Share my context with KBC Live.”**

Switch to adviser view:

> “Elise shared this context for a home exploration conversation, valid for 24 hours.”

It shows her confirmed objective and unresolved question—not raw transactions.

### 82–90 seconds: prove scale/generalization

Click through two small persona cards:

- **Karim:** salary delay → cash-flow forecast → no marketing; quiet supportive plan.
- **Sofia:** energy/quote/EPC events → renovation journey with MyHome.

**Closing line:**

> “One engine, three different situations, millions of possible customer journeys—always explainable, temporary and under customer control.”

***

## 12. Privacy, security and regulation

### Product posture

The product should be marketed as:

> **A context and orchestration layer for helpful, customer-confirmed support—not an autonomous decision maker.**

That framing matters.

### GDPR

The European Commission explains that profiling includes evaluating personal aspects to make predictions, and people generally have a right not to be subject to solely automated decisions that produce legal or similarly significant effects. Where such automation is exceptionally permitted, safeguards include information about human intervention and appropriate procedures. [commission.europa](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en)

Product implications:

- Separate **service necessity**, **security/fraud**, **personalization**, **marketing**, **open-banking** and **partner-data** purposes.
- Use granular, revocable opt-in for life-context personalization.
- Do not use one broad “personalization” consent to cover every data source or purpose.
- Make inferred states visible, correctable and expiring.
- Do not let the state engine make credit, pricing, insurance coverage, claims, investment-suitability or other high-impact automated decisions.
- Provide a human route for meaningful decisions.
- Maintain data minimization: store derived evidence where possible, avoid retaining raw behavioral detail indefinitely.

### EU AI Act

The European Commission identifies credit scoring / creditworthiness use cases among high-risk areas, with high-risk rules applying on the stated phased timeline; the EBA also describes natural-person creditworthiness evaluation or credit scoring as high-risk in banking and payments. [eba.europa](https://www.eba.europa.eu/sites/default/files/2025-11/d8b999ce-a1d9-4964-9606-971bbc2aaf89/AI%20Act%20implications%20for%20the%20EU%20banking%20sector.pdf)

Product implications:

- Explicitly scope out credit approval, credit score determination and underwriting from the hackathon engine.
- If demonstrating lending, show **education, document preparation or adviser handoff**, not algorithmic eligibility.
- Keep human oversight, logging, data governance and explainability in the architecture.
- Label GenAI-generated explanations as generated support text, grounded only in structured state/evidence.
- Never make the LLM the source of truth for state, consent or eligibility.

### PSD2, PSD3 and open finance

PSD2 enables third-party access to payment-account data upon customer request, while proposed EU open-finance arrangements seek broader, customer-controlled access across financial services. [finance.ec.europa](https://finance.ec.europa.eu/system/files/2022-10/2022-10-24-report-on-open-finance_en.pdf)

Product implications:

- In the MVP, simulate external-account connection with a clear permission screen.
- Explain scope: accounts, duration, purpose and revocation.
- If consent ends, remove open-banking-derived features and expire dependent states.
- Never imply that open banking provides universal access to investment, savings, insurance or utility data.

### Security controls to visibly demonstrate

| Threat / failure mode | Design control |
|---|---|
| A partner or adviser sees too much | Purpose-scoped Context Passport; minimization; role-based access |
| Customer cannot understand personalization | “Why this?” evidence, confidence and editable state |
| Stale inference persists | Automatic expiry; freshness score; expiry badge |
| LLM invents financial claims | LLM receives structured facts only; schema-constrained output; policy-approved templates |
| State drives high-impact decision | Policy gate blocks automated credit/investment/insurance decisions |
| Unauthorized sharing | Signed short-lived share tokens; consent preview; revocation |
| Model or rule bias | Monitor interventions, false-positive corrections, acceptance rates and disparity indicators where lawful/appropriate |
| Event tampering | Audit log, event IDs, signed server-side simulation in MVP |
| Notification overload | Attention budget, user preferences and “do not disturb” rules |
| Sensitive inference | Exclusion list; no special-category profiling; customer confirmation required for life-event state |

### Make helpful, not creepy

Use this formula in your UX:

1. **Say what you noticed, not what you assume.**
2. **Show only enough evidence to be intelligible.**
3. **Say “we may be wrong.”**
4. **Offer help, never pressure.**
5. **Let the customer correct, pause or delete.**
6. **Expire temporary context automatically.**
7. **Ask before linking contexts across domains.**
8. **Separate “support me” from “market to me.”**
9. **Always offer a human route for important choices.**

***

## 13. Biggest assumptions to validate

### Product assumptions

1. Customers will trade some data access for clearly useful, controllable life-event support.
2. Customers understand and value evidence/confidence explanations instead of seeing them as cognitive load.
3. Customer correction materially improves future relevance and trust.
4. The best intervention is often a coordinated task journey, not a product offer.
5. KBC can separate welfare-first help from commercial targeting in both governance and customer perception.
6. The same state model can work across Belgium and KBC’s other core markets without losing local relevance.
7. Customers will share a scoped Context Passport with KBC Live or advisers if they can preview and revoke it.
8. KBC’s existing data, decisioning and channel infrastructure can expose events and consume state outputs safely.
9. Existing Kate/decisioning teams would see the state layer as complementary rather than duplicative.
10. KBC can create suitable governance for model risk, data-purpose control and customer-facing explanation.

### Technical assumptions

1. Merchant enrichment and recurring-payment detection are accurate enough for supportive—not determinative—use cases.
2. Different signals can be normalized into a shared event schema.
3. Rules plus simple scoring outperform a black-box model for the first product version.
4. State expiry and customer feedback keep false positives tolerable.
5. KBC can operate streaming or near-real-time state updates at millions-of-customers scale.
6. GenAI can be safely constrained to language generation and summarization rather than high-impact decisions.

***

## 14. Questions for KBC representatives

Ask these early. They will tell you where your concept overlaps with existing work and how to position the novelty honestly.

### Product and strategy

1. Of Kate’s 140+ proactive situations, which are primarily transaction-triggered, and which combine multiple behavioral/contextual signals?
2. Does KBC already maintain a cross-channel customer-state or life-event model separate from individual next-best-action models?
3. What is the biggest known gap between KBC’s available data and its actual understanding of a customer’s current life situation?
4. Which customer outcomes matter most: financial health, service resolution, product completion, retention, ecosystem use, trust or something else?
5. Where does KBC see the highest customer friction today: home, renovation, mobility, cash-flow health, insurance claims, investment, or omnichannel service?
6. What would make this challenge submission meaningfully non-duplicative of Kate’s current roadmap?

### Data and architecture

7. Is there an enterprise event platform or customer-360 layer that already links product and ecosystem events?
8. Are MyHome, MyMobility, Kate, KBC Live and partner services able to consume a shared personalization decision/state?
9. How does KBC currently govern consent at the data-purpose level for personalized experiences?
10. How are signal quality, state confidence, timing and customer feedback measured today?
11. Is personalization predominantly rule-based, model-based, or hybrid—and where are the practical limitations?
12. What data is available only in batch versus near-real-time?

### Trust and compliance

13. What customer feedback has KBC received about proactive personalization feeling useful versus intrusive?
14. Does KBC already provide customer-facing “why am I seeing this?” explanations, inference correction or profile controls?
15. Which inferred life contexts are explicitly off-limits or too sensitive for personalization?
16. How does KBC prevent financially vulnerable customers from receiving inappropriate credit or commercial prompts?
17. What human oversight is required before an AI system can influence credit, insurance, investment or pricing-related journeys?
18. What consent model would KBC consider appropriate for combining banking activity with partner/ecosystem data?

### Hackathon execution

19. Which judging outcome would KBC value most: a visually powerful customer experience, a credible architecture, a trust model, or a realistic route to implementation?
20. May teams use synthetic data and mock integrations, and what should they clearly label?
21. Is there a preferred KBC design system, brand asset pack, sandbox or API set?
22. What would make a team’s concept feel “too close to Kate” in the jury’s view?
23. Would a customer-controlled “state map” or “personalization control center” be viewed as a genuinely novel contribution?
24. Can the jury assess an MVP that deliberately blocks automation for regulated decisions as a strength rather than a missing capability?

***

## Final recommendation

Build **KBC Compass** as the intelligence layer KBC can place beneath Kate, KBC Mobile, MyHome, MyMobility and KBC Live.

Your demo should make four claims—and visibly prove all four:

1. **KBC can understand situations, not just transactions.**
2. **It does so through multiple signals, not one hard-coded trigger.**
3. **It is uncertainty-aware, explainable and customer-controlled.**
4. **It coordinates meaningful help across channels while refusing unsafe autonomous decisions.**

