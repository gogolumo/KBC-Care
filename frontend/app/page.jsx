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
const TRANSACTIONS = [
  ['Delhaize', 'Today', '− € 42.18'],
  ['NMBS / SNCB', 'Yesterday', '− € 18.40'],
  ['Salary', '26 Sep', '+ € 2,840.00'],
  ['Energy bill', '24 Sep', '− € 126.70']
];
const fmtDate = value => value ? new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short' }).format(new Date(value)) : '—';

function Icon({ name, size=20 }) {
  const paths = {
    home:<><path d="m3 10 9-7 9 7v10H4z"/><path d="M9 21v-7h6v7"/></>,
    card:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    transfer:<><path d="M4 8h15m-4-4 4 4-4 4"/><path d="M20 16H5m4-4-4 4 4 4"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/></>,
    arrow:<path d="M5 12h14m-6-6 6 6-6 6"/>,
    check:<path d="m5 12 4 4L19 6"/>,
    close:<path d="M5 5l14 14M19 5 5 19"/>,
    reset:<path d="M20 11a8 8 0 1 1-2.3-5.7M20 4v6h-6"/>,
    lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    shield:<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
    spark:<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/>,
    menu:<path d="M4 7h16M4 12h16M4 17h16"/>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.5 2c-.9.5-1.3 1-1.3 2"/><path d="M12 17h.01"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Page() {
  const [state,setState]=useState(null), [confidence,setConfidence]=useState(0), [events,setEvents]=useState([]);
  const [journey,setJourney]=useState(null), [passport,setPassport]=useState(null), [view,setView]=useState('customer');
  const [modal,setModal]=useState(null), [selectedFields,setSelectedFields]=useState(SHARE_FIELDS.map(([k])=>k));
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [message,setMessage]=useState('');

  useEffect(()=>{ let active=true; (async()=>{ try {
    await api.getCustomers(); const result=await api.getSimulationStatus(CUSTOMER_ID); if(!active)return;
    setState(result.state); setConfidence(result.confidence);
    const ids=new Set((result.events||[]).map(x=>x.id)); setEvents(DEMO_EVENTS.filter(e=>ids.has(e.id)));
    if(result.state?.status==='confirmed'){ const j=await api.getJourney(CUSTOMER_ID); if(active)setJourney(j.journey);
      const id=sessionStorage.getItem('compass-passport'); if(id) try { const p=await api.getPassport(id); if(active)setPassport(p.passport); } catch { sessionStorage.removeItem('compass-passport'); }
    }
  } catch(e){if(active)setError(e.message)} })(); return()=>{active=false}; },[]);

  const visible=Boolean(state&&confidence>=60&&state.status==='inferred'), confirmed=state?.status==='confirmed', nextEvent=DEMO_EVENTS[events.length];
  async function act(fn){if(busy)return;setBusy(true);setError('');setMessage('');try{await fn()}catch(e){setError(e?.message||'Something went wrong.')}finally{setBusy(false)}}
  async function playAll(){await act(async()=>{let list=[...events];for(const event of DEMO_EVENTS.slice(events.length)){const r=await api.playEvent(event.id);list=[...list,event];setEvents(list);setConfidence(r.confidence);setState(r.state);if(list.length<DEMO_EVENTS.length)await new Promise(r=>setTimeout(r,350));}})}
  async function playNext(){if(!nextEvent)return;await act(async()=>{const r=await api.playEvent(nextEvent.id);setEvents([...events,nextEvent]);setConfidence(r.confidence);setState(r.state)})}
  async function reset(){await act(async()=>{await api.reset({customerId:CUSTOMER_ID});sessionStorage.removeItem('compass-passport');setState(null);setConfidence(0);setEvents([]);setJourney(null);setPassport(null);setView('customer');setModal(null);setMessage('Demo reset.')})}
  async function confirm(){await act(async()=>{await api.confirm(state.id,{customerId:CUSTOMER_ID});const [s,j]=await Promise.all([api.getState(CUSTOMER_ID),api.getJourney(CUSTOMER_ID)]);setState(s.state);setConfidence(s.state.confidence);setJourney(j.journey);setModal(null);setMessage('Thanks, Elise. Your home journey is ready.')})}
  async function reject(){await act(async()=>{await api.reject(state.id,{customerId:CUSTOMER_ID,reason:'not_relevant'});const r=await api.getState(CUSTOMER_ID);setState(r.state);setConfidence(r.state.confidence);setModal(null)})}
  async function completeStep(id){await act(async()=>{const r=await api.completeStep(journey.id,id);setJourney(r.journey)})}
  async function share(){if(!selectedFields.length)return;await act(async()=>{const r=await api.createPassport({customerId:CUSTOMER_ID,purpose:'kbc_live_home_exploration',selectedFields,ttlHours:24});sessionStorage.setItem('compass-passport',r.passport.id);setPassport(r.passport);setModal(null);setMessage('Your selected context is ready for KBC Live.')})}
  async function openAdviser(){if(!passport)return;await act(async()=>{const r=await api.getPassport(passport.id);setPassport(r.passport);setView('adviser')})}

  if(view==='adviser') return <Adviser passport={passport} onBack={()=>setView('customer')}/>;

  return <div className="app">
    <header className="kbc-header">
      <div className="header-inner"><button className="mobile-menu" aria-label="Menu"><Icon name="menu"/></button><div className="kbc-logo"><span>KBC</span><b>Care</b></div>
      <nav><button className="active">Home</button><button>Payments</button><button>Products</button><button>Support</button></nav>
      <div className="header-actions"><button aria-label="Help"><Icon name="help"/></button><div className="avatar">EL</div></div></div>
    </header>

    <main className="banking-page">
      <div className="welcome"><div><p>Good evening</p><h1>Elise</h1></div><button className="demo-control" onClick={()=>setModal('demo')}>Demo controls</button></div>
      {error&&<div className="notice error">{error}<button onClick={()=>setError('')}>Close</button></div>}
      {message&&<div className="notice success"><Icon name="check" size={17}/>{message}</div>}

      <section className="money-section">
        <div className="section-heading"><h2>Your money</h2><button>View all</button></div>
        <div className="accounts">
          <article className="account primary-account"><div><span>Current account</span><small>BE•• •••• •••• 4829</small></div><strong>€ 12,480.50</strong></article>
          <article className="account"><div><span>Savings account</span><small>Goal savings</small></div><strong>€ 24,320.00</strong></article>
        </div>
      </section>

      <div className="quick-actions">
        <button><span><Icon name="transfer"/></span>Transfer</button><button><span><Icon name="card"/></span>Cards</button><button><span><Icon name="home"/></span>Home</button>
      </div>

      {visible&&<section className="care-panel">
        <div className="care-icon"><Icon name="home" size={24}/></div><div className="care-copy"><span>For you</span><h2>Thinking about a home?</h2><p>Some recent activity suggests you may be exploring a home purchase. If that’s right, we can help you take the next steps at your pace.</p>
        <div className="care-actions"><button className="primary-btn" onClick={confirm} disabled={busy}>Yes, help me explore</button><button className="text-btn" onClick={reject} disabled={busy}>Not right now</button></div>
        <button className="why-link" onClick={()=>setModal('why')}>Why am I seeing this?</button></div>
      </section>}

      {confirmed&&<section className="journey">
        <div className="section-heading"><div><span className="overline">YOUR HOME JOURNEY</span><h2>One step at a time</h2><p>Pick up where you left off. You decide what happens next.</p></div><Icon name="home" size={26}/></div>
        <div className="journey-list">{journey?.steps.map((step,i)=><button key={step.id} className={'journey-row '+step.status} disabled={step.status!=='active'||busy} onClick={()=>completeStep(step.id)}><span className="step">{step.status==='done'?<Icon name="check" size={16}/>:i+1}</span><strong>{step.title}</strong><small>{step.status==='done'?'Done':step.status==='active'?'Continue':'Later'}</small></button>)}</div>
        <button className="primary-btn share-btn" onClick={()=>setModal('share')}><Icon name="lock" size={16}/> Talk to a KBC adviser</button>
      </section>}

      {!visible&&!confirmed&&state?.status!=='rejected'&&<section className="everyday"><div><span className="overline">KBC CARE</span><h2>Banking that adapts to what matters to you</h2><p>When your situation changes, KBC Care can make useful help easier to find — without turning every signal into an offer.</p></div><button className="primary-btn" onClick={playAll} disabled={busy||!nextEvent}>{busy?'Updating…':nextEvent?'See the demo':'Demo complete'}</button></section>}

      <section className="activity">
        <div className="section-heading"><h2>Recent activity</h2><button>See all</button></div>
        <div className="transactions">{TRANSACTIONS.map(([name,date,amount])=><div className="transaction" key={name}><div className="merchant">{name[0]}</div><div><strong>{name}</strong><small>{date}</small></div><b className={amount.startsWith('+')?'positive':''}>{amount}</b></div>)}</div>
      </section>
    </main>

    <button className="kate-fab" onClick={()=>setModal('kate')}><span><Icon name="spark" size={18}/></span> Ask Kate</button>

    {modal&&<div className="backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}>
      {modal==='kate'&&<section className="sheet kate-sheet"><SheetClose onClose={()=>setModal(null)}/><span className="overline">KATE · KBC CARE</span><h2>Hi Elise, how can I help?</h2><p>I can explain what changed, help you understand your next steps, or point you to the right KBC support.</p><div className="suggestions"><button>{visible?'Why did my home guidance change?':'What changed this month?'}</button><button>Can I afford my upcoming payments?</button><button>What can KBC help me with?</button></div><div className="kate-answer"><Icon name="spark" size={18}/><p>{visible?'I noticed a few signals that may fit with exploring a home purchase. Nothing has been decided for you — you can confirm whether that is relevant.':'Your accounts look ready for everyday banking. If something changes, I can help you understand the options available.'}</p></div></section>}
      {modal==='why'&&<section className="sheet"><SheetClose onClose={()=>setModal(null)}/><span className="overline">WHY THIS APPEARED</span><h2>You stay in control</h2><p>We noticed a pattern across recent activity that may fit with exploring a home purchase. We use it only to decide whether this guidance might be useful.</p><div className="privacy-note"><Icon name="shield"/><div><strong>This is not a credit decision.</strong><p>It does not approve a loan or automatically start an application. You can dismiss it at any time.</p></div></div><button className="primary-btn" onClick={confirm}>Yes, this is relevant</button></section>}
      {modal==='share'&&<section className="sheet"><SheetClose onClose={()=>setModal(null)}/><span className="overline">TALK TO KBC LIVE</span><h2>Choose what your adviser can see</h2><p>Only the context you select below will be shared for this conversation.</p><div className="share-fields">{SHARE_FIELDS.map(([key,title,detail])=><label key={key}><input type="checkbox" checked={selectedFields.includes(key)} onChange={e=>setSelectedFields(x=>e.target.checked?[...x,key]:x.filter(v=>v!==key))}/><span><strong>{title}</strong><small>{detail}</small></span></label>)}</div><button className="primary-btn full" onClick={share} disabled={!selectedFields.length||busy}>Continue to KBC Live</button>{passport&&<button className="text-btn full" onClick={openAdviser}>Open adviser view</button>}</section>}
      {modal==='demo'&&<section className="sheet demo-sheet"><SheetClose onClose={()=>setModal(null)}/><span className="overline">HACKATHON DEMO</span><h2>Elise’s story</h2><p>This panel is for the demo operator, not the customer experience.</p><div className="demo-status"><strong>{events.length} / {DEMO_EVENTS.length}</strong><span>signals applied</span></div><div className="demo-events">{events.map((e,i)=><div key={e.id}><Icon name="check" size={15}/><span>{e.title}</span></div>)}</div><div className="demo-buttons"><button className="primary-btn" onClick={playAll} disabled={!nextEvent||busy}>{nextEvent?'Run full story':'Story complete'}</button><button className="secondary-btn" onClick={playNext} disabled={!nextEvent||busy}>Next signal</button><button className="text-btn" onClick={reset}><Icon name="reset" size={15}/> Reset</button></div><small className="technical">Internal rule score: {confidence}/100. Hidden from the normal customer view.</small></section>}
    </div>}
  </div>;
}

function SheetClose({onClose}){return <button className="sheet-close" onClick={onClose} aria-label="Close"><Icon name="close"/></button>}

function Adviser({passport,onBack}){
  const fields=passport?.fields||{}, completed=Array.isArray(fields.journeyProgress)?fields.journeyProgress:[];
  return <div className="adviser-page"><header className="adviser-header"><div className="kbc-logo"><span>KBC</span><b>Care</b></div><div><span>Adviser workspace</span><div className="avatar">KL</div></div></header>
    <main className="adviser-content"><button className="back-link" onClick={onBack}>← Back to customer view</button><div className="adviser-title"><div><span className="overline">CUSTOMER CONTEXT</span><h1>Elise</h1><p>Home exploration · customer-approved context</p></div><span className="consent"><Icon name="shield" size={16}/> Consent active</span></div>
    <div className="adviser-grid"><section className="adviser-main">
      <div className="adviser-section"><h2>Current situation</h2><div className="situation"><div className="care-icon"><Icon name="home"/></div><div><strong>Exploring a home purchase</strong><p>Elise confirmed this goal and chose to share it for this conversation.</p></div></div></div>
      <div className="adviser-section"><h2>What Elise shared</h2>{Object.entries(fields).map(([key,value])=><div className="shared-row" key={key}><span>{SHARE_FIELDS.find(([f])=>f===key)?.[1]||key}</span><strong>{Array.isArray(value)?(value.length?value.join(' · '):'None shared'):value}</strong></div>)}</div>
      <div className="adviser-section"><h2>Recommended approach</h2><div className="approach"><strong>Continue from where Elise left off</strong><p>{completed.length?completed.length+' journey step(s) completed. Ask what she would like to cover next.':'Start by clarifying what Elise wants to understand before discussing products.'}</p></div></div>
    </section>
    <aside className="adviser-side"><div className="kate-adviser"><div className="kate-title"><span><Icon name="spark"/></span><div><small>KATE</small><strong>Conversation assistant</strong></div></div><p className="scope"><Icon name="lock" size={15}/> Uses only customer-approved context.</p><div className="brief"><small>SUGGESTED OPENING</small><blockquote>“Hi Elise. I can see you’re exploring a home purchase. Where would you like to pick up today?”</blockquote></div><div className="brief"><small>NEXT STEP</small><p>Focus on guidance first. Let Elise choose when she wants to discuss a product.</p></div><div className="guardrail">Kate can prepare the conversation. The adviser remains responsible for every action.</div></div>
    <div className="consent-card"><Icon name="shield"/><div><strong>Shared for 24 hours</strong><p>Raw transactions and unrelated account data are not included.</p><small>Expires {fmtDate(passport?.expiresAt)}</small></div></div></aside></div></main></div>
}