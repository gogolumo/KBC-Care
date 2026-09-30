'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { DEMO_EVENTS } from '../lib/demo-events.js';

const CUSTOMER_ID = 'elise';
const SHARE_FIELDS = [
  ['confirmedGoal', 'Confirmed goal', 'Exploring a home purchase'],
  ['journeyProgress', 'Journey progress', 'Steps Elise has completed'],
  ['unresolvedQuestions', 'Unresolved questions', 'What Elise wants to ask']
];
const fmtDate = value => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

function Icon({ name, size = 20 }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/></>,
    pulse: <path d="M2 12h5l3-7 4 14 3-7h5"/>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    close: <path d="M5 5l14 14M19 5 5 19"/>,
    reset: <path d="M20 11a8 8 0 1 1-2.3-5.7M20 4v6h-6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/></>,
    spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Page() {
  const [state, setState] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [events, setEvents] = useState([]);
  const [journey, setJourney] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [passport, setPassport] = useState(null);
  const [view, setView] = useState('customer');
  const [modal, setModal] = useState(null);
  const [selectedFields, setSelectedFields] = useState(SHARE_FIELDS.map(([key]) => key));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        await api.getCustomers();
        const result = await api.getSimulationStatus(CUSTOMER_ID);
        if (!active) return;
        setState(result.state);
        setConfidence(result.confidence);
        const appliedIds = new Set((result.events || []).map(item => item.id));
        setEvents(DEMO_EVENTS.filter(event => appliedIds.has(event.id)));
        if (!result.state) {
          setJourney(null);
          setPassport(null);
          sessionStorage.removeItem('compass-passport');
          return;
        }
        if (result.state?.status === 'confirmed') {
          const response = await api.getJourney(CUSTOMER_ID);
          if (active) setJourney(response.journey);
          const passportId = sessionStorage.getItem('compass-passport');
          if (passportId) {
            try { const shared = await api.getPassport(passportId); if (active) setPassport(shared.passport); }
            catch { sessionStorage.removeItem('compass-passport'); }
          }
        }
      } catch (err) { if (active) setError(err.message); }
    }
    restore();
    return () => { active = false; };
  }, []);

  const score = confidence;
  const visibleState = Boolean(state && score >= 60 && state.status === 'inferred');
  const confirmed = state?.status === 'confirmed';
  const rejected = state?.status === 'rejected';
  const nextEvent = DEMO_EVENTS[events.length];

  async function act(task) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await task(); }
    catch (err) { setError(err?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  async function reset() {
    await act(async () => {
      await api.reset({ customerId: CUSTOMER_ID });
      sessionStorage.removeItem('compass-passport');
      setState(null); setConfidence(0); setEvents([]); setJourney(null); setPolicy(null); setPassport(null);
      setModal(null); setView('customer'); setMessage('Demo reset. Elise starts with a neutral banking view.');
    });
  }

  async function playNext() {
    if (!nextEvent) return;
    await act(async () => {
      const applied = await api.playEvent(nextEvent.id);
      const updated = [...events, nextEvent];
      setEvents(updated);
      setConfidence(applied.confidence); setState(applied.state);
    });
  }

  async function playAll() {
    await act(async () => {
      let updated = [...events];
      for (const event of DEMO_EVENTS.slice(events.length)) {
        const applied = await api.playEvent(event.id);
        updated = [...updated, event];
        setEvents(updated);
        setConfidence(applied.confidence); setState(applied.state);
      }
    });
  }

  async function evaluatePolicy() {
    await act(async () => setPolicy(await api.evaluatePolicy({ customerId: CUSTOMER_ID, stateId: state.id, action: 'PRE_APPROVED_MORTGAGE_OFFER' })));
  }

  async function confirm() {
    await act(async () => {
      await api.confirm(state.id, { customerId: CUSTOMER_ID });
      const [nextState, nextJourney] = await Promise.all([api.getState(CUSTOMER_ID), api.getJourney(CUSTOMER_ID)]);
      setState(nextState.state); setConfidence(nextState.state.confidence); setJourney(nextJourney.journey); setModal(null); setMessage('Elise confirmed her goal. The Home Journey is now available.');
    });
  }

  async function reject() {
    await act(async () => {
      await api.reject(state.id, { customerId: CUSTOMER_ID, reason: 'not_relevant' });
      const result = await api.getState(CUSTOMER_ID);
      setState(result.state); setConfidence(result.state.confidence); setJourney(null); setModal(null); setMessage('Insight dismissed. No Home Journey was created.');
    });
  }

  async function completeStep(stepId) {
    await act(async () => {
      const result = await api.completeStep(journey.id, stepId);
      setJourney(result.journey);
    });
  }

  async function share() {
    if (!selectedFields.length) { setError('Choose at least one field to share.'); return; }
    await act(async () => {
      const result = await api.createPassport({ customerId: CUSTOMER_ID, purpose: 'kbc_live_home_exploration', selectedFields, ttlHours: 24 });
      sessionStorage.setItem('compass-passport', result.passport.id);
      setPassport(result.passport); setModal(null); setMessage('Context Passport created. Open Adviser View to inspect the shared fields.');
    });
  }

  async function openAdviser() {
    if (!passport) return;
    await act(async () => { const result = await api.getPassport(passport.id); setPassport(result.passport); setView('adviser'); });
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Icon name="compass" size={23}/></div><div><strong>KBC Compass</strong><span>CUSTOMER CONTEXT DEMO</span></div></div>
      <div className="side-label">DEMO WORKSPACE</div>
      <button className={`side-nav ${view === 'customer' ? 'active' : ''}`} onClick={() => setView('customer')}><Icon name="home"/> Customer experience</button>
      <button className={`side-nav ${view === 'adviser' ? 'active' : ''}`} onClick={openAdviser} disabled={!passport}><Icon name="user"/> Adviser view</button>
      <div className="side-bottom"><span className="status-dot"/><div><strong>Synthetic demo mode</strong><small>FastAPI · no real customer data</small></div></div>
    </aside>
    <div className="page">
      <header className="topbar"><span>Personal banking <b>/</b> {view === 'customer' ? 'Overview' : 'KBC Live adviser'}</span><div><span className="demo-badge">SYNTHETIC DATA</span><div className="avatar">{view === 'customer' ? 'EL' : 'KL'}</div></div></header>
      <div className="content">
        <div className="title-row"><div><span className="eyebrow">{view === 'customer' ? 'WELCOME BACK' : 'CUSTOMER-APPROVED CONTEXT'}</span><h1>{view === 'customer' ? 'Good afternoon, Elise' : 'KBC Live handoff'} <span className="title-star">✳</span></h1><p>{view === 'customer' ? 'Your banking, with help that respects your choices.' : 'Only the information Elise chose to share is shown here.'}</p></div><div className="persona"><span className="persona-dot"/><div><strong>Elise</strong><small>Home purchase demo</small></div></div></div>
        {error && <div className="notice error" role="alert"><Icon name="info" size={17}/>{error}<button onClick={() => setError('')}>Dismiss</button></div>}
        {message && <div className="notice success" role="status"><Icon name="check" size={17}/>{message}</div>}
        {view === 'customer' ? <div className="grid">
          <main>
            <div className="section-title"><h2>Your money, at a glance</h2><span>Demo account</span></div>
            <div className="account-card"><div className="account-top"><span>CURRENT ACCOUNT</span><span className="account-rings"><i/><i/></span></div><strong>€ 12,480.50</strong><div className="account-bottom"><span>Available balance</span><span>•••• 4829</span></div></div>
            {!confirmed && <div className="section-title next-title"><h2>For you</h2><span>{visibleState ? 'A possible next step' : 'Everyday banking'}</span></div>}
            {confirmed ? <section className="journey-card"><div className="journey-head"><div><span className="card-kicker">GOAL CONFIRMED BY ELISE</span><h2>Your Home Journey</h2><p>Explore one step at a time. You stay in control.</p></div><div className="journey-symbol"><Icon name="home" size={31}/></div></div><div className="journey-progress"><span>{journey?.steps.filter(step => step.status === 'done').length ?? 0} of 5 steps completed</span><div><span style={{ width: `${((journey?.steps.filter(step => step.status === 'done').length ?? 0) / 5) * 100}%` }}/></div></div><div className="journey-steps">{journey?.steps.map((step, index) => <button key={step.id} className={`journey-step ${step.status}`} disabled={step.status !== 'active' || busy} onClick={() => completeStep(step.id)}><span className="step-index">{step.status === 'done' ? <Icon name="check" size={16}/> : index + 1}</span><span>{step.title}</span><small>{step.status === 'done' ? 'Done' : step.status === 'active' ? 'Mark complete' : 'Upcoming'}</small></button>)}</div><button className="primary share-cta" onClick={() => setModal('share')}><Icon name="lock" size={17}/> Share with KBC Live <Icon name="arrow" size={17}/></button></section>
              : visibleState ? <section className="state-card"><div className="state-card-top"><span className="card-kicker">A TEMPORARY HYPOTHESIS</span><span className="state-pill">POSSIBLE</span></div><h2>Exploring a home purchase?</h2><p>We noticed a few signals that may be relevant. We may be wrong — only you can tell us.</p><div className="state-score"><strong>{score}%</strong><div><span>Compass confidence</span><small>Based on {state.evidence?.length ?? 0} observed signals · Expires {fmtDate(state.expiresAt)}</small></div></div><div className="score-bar"><span style={{ width: `${score}%` }}/></div><div className="card-buttons"><button className="primary" onClick={confirm} disabled={busy}>Yes, help me explore <Icon name="arrow" size={17}/></button><button className="secondary" onClick={reject} disabled={busy}>Not relevant</button></div><div className="state-links"><button onClick={() => setModal('why')}>Why am I seeing this?</button></div></section>
              : <section className="neutral-card"><div className="neutral-art"><div><Icon name="spark" size={38}/></div></div><div><span className="card-kicker">HERE FOR WHAT MATTERS</span><h2>Banking that moves with you.</h2><p>Explore your everyday finances in one clear place. Useful help appears when you choose it.</p><button className="soft-button" onClick={() => setMessage('Your everyday banking is ready.')}>Explore your banking <Icon name="arrow" size={16}/></button></div></section>}
            {rejected && <div className="dismissed"><Icon name="check" size={18}/><span>Elise marked the home-purchase suggestion as not relevant. It will stay out of this demo.</span></div>}
            {(visibleState || confirmed) && <section className="policy-card"><div className="section-title"><h2>Trust &amp; policy check</h2><span>Safe help first</span></div><p>Can a possible life moment trigger a pre-approved mortgage offer?</p><button className="outline-button" onClick={evaluatePolicy} disabled={busy}>Evaluate proposed action <Icon name="arrow" size={16}/></button>{policy && <div className="blocked"><span>BLOCKED</span><div><strong>Pre-approved mortgage offer</strong><p>{policy.reason}</p><small>Safe alternative: ask Elise to confirm her goal, then offer educational steps.</small></div></div>}</section>}
          </main>
          <aside className="simulation"><div className="sim-head"><div className="sim-icon"><Icon name="pulse" size={19}/></div><div><strong>Compass live</strong><small>Event simulation</small></div><span className="live-tag">LIVE</span></div><div className="sim-body"><div className="sim-label">DEMO CONTROLS</div><div className="controls"><button className="play-next" onClick={playNext} disabled={!nextEvent || busy}>{busy ? 'Processing…' : nextEvent ? `Play next · ${events.length + 1}/5` : 'All events played'} <Icon name="arrow" size={17}/></button><button className="play-all" onClick={playAll} disabled={!nextEvent || busy}>Play all</button></div><button className="reset" onClick={reset} disabled={busy}><Icon name="reset" size={16}/> Reset demo</button><div className="divider"/><div className="sim-label">LIVE EVENT STREAM <span>{events.length}/5</span></div><div className="event-list">{events.length ? events.slice().reverse().map((event, index) => <div className="event" key={event.id}><div className="event-symbol"><Icon name="pulse" size={15}/></div><div><strong>{event.title}</strong><small>{event.source} · {index === 0 ? 'just now' : 'earlier'}</small></div></div>) : <div className="empty-events"><Icon name="clock" size={24}/><strong>Waiting for the first signal</strong><small>Use Play next to begin Elise’s story.</small></div>}</div><div className="divider"/><div className="sim-label">COMPASS STATE</div><div className="confidence-box"><span>{state ? state.status === 'confirmed' ? 'Goal confirmed by Elise' : state.status === 'rejected' ? 'Hypothesis rejected' : score >= 60 ? 'Possible Home Purchase' : 'Below activation threshold' : score > 0 ? 'Below activation threshold' : 'No hypothesis yet'}</span><strong>{score}<small>/ 100</small></strong><div className="score-bar"><span style={{ width: `${score}%` }}/></div><p>{score < 60 ? 'A customer-facing card appears at 60.' : confirmed ? 'Customer confirmation changes the experience.' : rejected ? 'The inference will not reactivate during cooldown.' : 'Several signals now support a temporary hypothesis.'}</p></div><div className="score-steps">{[0, 30, 45, 63, 83].map((number, index) => <div className={index <= events.length ? 'reached' : ''} key={index}><i/><span>{number}</span></div>)}</div><div className="sim-foot">Observed events are synthetic. Compass confidence is a rule score, not a probability.</div></div></aside>
        </div> : <Adviser passport={passport} onBack={() => setView('customer')}/>}
      </div>
    </div>
    {modal === 'why' && <div className="backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="why-title"><button className="close" aria-label="Close" onClick={() => setModal(null)}><Icon name="close"/></button><div className="modal-symbol"><Icon name="compass" size={25}/></div><span className="eyebrow">TRANSPARENT BY DESIGN</span><h2 id="why-title">Why am I seeing this?</h2><p>Compass noticed several observed signals. “Possible Home Purchase” is an <strong>inference</strong>, not a fact about Elise or a credit decision.</p><div className="modal-score"><span>Compass confidence</span><strong>{score}/100</strong></div><div className="score-bar"><span style={{ width: `${score}%` }}/></div><div className="freshness"><Icon name="clock" size={16}/> Temporary state · expires {fmtDate(state?.expiresAt)}</div><div className="evidence-heading">OBSERVED SIGNALS <span>CONTRIBUTION</span></div><div className="evidence-list">{state?.evidence?.map(item => <div key={item.code}><span><Icon name="check" size={16}/>{item.label}</span><strong>+{item.weight}</strong></div>)}</div><div className="modal-footer"><button className="primary" onClick={confirm} disabled={busy}>Yes, help me explore</button><button className="secondary" onClick={reject} disabled={busy}>Not relevant</button></div></section></div>}
    {modal === 'share' && <div className="backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="close" aria-label="Close" onClick={() => setModal(null)}><Icon name="close"/></button><div className="modal-symbol"><Icon name="lock" size={25}/></div><span className="eyebrow">EXPLICIT SHARING</span><h2 id="share-title">Share context with KBC Live</h2><p>Choose exactly what Elise’s adviser can see for a home exploration conversation.</p><div className="share-meta"><div><span>PURPOSE</span><strong>KBC Live home exploration</strong></div><div><span>EXPIRES</span><strong>24 hours after sharing</strong></div></div><div className="evidence-heading">SELECTED FIELDS</div><div className="share-fields">{SHARE_FIELDS.map(([key, title, detail]) => <label key={key}><input type="checkbox" checked={selectedFields.includes(key)} onChange={event => setSelectedFields(current => event.target.checked ? [...current, key] : current.filter(item => item !== key))}/><span><strong>{title}</strong><small>{detail}</small></span></label>)}</div><div className="excluded"><Icon name="shield" size={17}/><span>Not shared: raw transactions, full event log, unrelated balances or products.</span></div><button className="primary modal-primary" onClick={share} disabled={busy || selectedFields.length === 0}>Confirm and create Context Passport <Icon name="arrow" size={17}/></button></section></div>}
  </div>;
}

function Adviser({ passport, onBack }) {
  return <div className="adviser-layout"><section className="passport"><div className="passport-head"><div><span className="card-kicker">SHARED BY CUSTOMER</span><h2>Elise’s Context Passport</h2><p>For a KBC Live home exploration conversation.</p></div><div className="passport-mark"><Icon name="shield" size={30}/></div></div><div className="passport-meta"><span><Icon name="clock" size={17}/> Expires {fmtDate(passport?.expiresAt)}</span><span><Icon name="lock" size={17}/> Customer-approved scope</span></div><div className="passport-fields">{passport && Object.entries(passport.fields).map(([key, value]) => <div key={key}><span>{SHARE_FIELDS.find(([field]) => field === key)?.[1] || key}</span><strong>{Array.isArray(value) ? value.join(' · ') : value}</strong></div>)}</div><div className="passport-note">This view contains approved context only. Raw transactions and full event history are excluded.</div></section><aside className="adviser-side"><div className="side-card-icon"><Icon name="user" size={25}/></div><h3>A warmer handoff</h3><p>Elise can continue the conversation without repeating her goal. The adviser receives only what she chose to share.</p><button className="outline-button" onClick={onBack}>Back to Elise’s view</button></aside></div>;
}
