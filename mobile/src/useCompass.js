// All demo state and actions, ported 1:1 from frontend/app/page.jsx so the phone and the
// web page drive the same backend flow. Mobile additions: pause/resume, server address,
// pull-to-refresh / resync when the app returns to the foreground.
import { useCallback, useRef, useState } from 'react';
import { api, getServer, loadSavedServer, saveServer } from './api';
import { normalizeBaseUrl } from './config';
import { CONFIDENCE_THRESHOLD, CUSTOMER_ID, DEMO_EVENTS, SHARE_FIELDS } from './data';
import { KEYS, getItem, removeItem, setItem } from './storage';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export function useCompass() {
  const [state, setState] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [events, setEvents] = useState([]);
  const [journey, setJourney] = useState(null);
  const [passport, setPassport] = useState(null);
  const [view, setView] = useState('customer'); // 'customer' | 'adviser'
  const [modal, setModal] = useState(null); // 'kate' | 'why' | 'share' | 'demo' | null
  const [selectedFields, setSelectedFields] = useState(SHARE_FIELDS.map(([key]) => key));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null); // { tone: 'success' | 'info', text }
  const [server, setServer] = useState(getServer());
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const busyRef = useRef(false);

  const visible = Boolean(state && confidence >= CONFIDENCE_THRESHOLD && state.status === 'inferred');
  const confirmed = state?.status === 'confirmed';
  const paused = state?.status === 'paused';
  const nextEvent = DEMO_EVENTS[events.length];

  // Mirrors the web page's initial load: status -> events -> journey + stored passport.
  const sync = useCallback(async () => {
    const result = await api.getSimulationStatus(CUSTOMER_ID);
    setState(result.state || null);
    setConfidence(result.confidence || 0);
    const ids = new Set((result.events || []).map(event => event.id));
    setEvents(DEMO_EVENTS.filter(event => ids.has(event.id)));
    if (result.state?.status === 'confirmed') {
      const j = await api.getJourney(CUSTOMER_ID);
      setJourney(j.journey);
      const id = await getItem(KEYS.passport);
      if (id) {
        try {
          const p = await api.getPassport(id);
          setPassport(p.passport);
        } catch {
          await removeItem(KEYS.passport);
          setPassport(null);
        }
      }
    } else {
      setJourney(null);
      setPassport(null);
    }
  }, []);

  const start = useCallback(async () => {
    setServer(await loadSavedServer());
    try {
      await api.getCustomers();
      await sync();
    } catch (e) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setReady(true);
    }
  }, [sync]);

  async function act(fn) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  // Pull-to-refresh: same data as a fresh start, useful when the web demo drives the backend.
  async function refresh() {
    if (busyRef.current) return;
    busyRef.current = true;
    setRefreshing(true);
    try {
      await sync();
      setError('');
    } catch (e) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      busyRef.current = false;
      setRefreshing(false);
    }
  }

  // Foreground resync: silent, never shows an error on its own.
  async function syncQuietly() {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      await sync();
    } catch {
      // keep what is on screen
    } finally {
      busyRef.current = false;
    }
  }

  async function playAll() {
    await act(async () => {
      let list = [...events];
      for (const event of DEMO_EVENTS.slice(events.length)) {
        const r = await api.playEvent(event.id);
        list = [...list, event];
        setEvents(list);
        setConfidence(r.confidence);
        setState(r.state);
        if (list.length < DEMO_EVENTS.length) await wait(350);
      }
    });
  }

  async function playNext() {
    if (!nextEvent) return;
    await act(async () => {
      const r = await api.playEvent(nextEvent.id);
      setEvents([...events, nextEvent]);
      setConfidence(r.confidence);
      setState(r.state);
    });
  }

  async function reset() {
    await act(async () => {
      await api.reset({ customerId: CUSTOMER_ID });
      await removeItem(KEYS.passport);
      setState(null);
      setConfidence(0);
      setEvents([]);
      setJourney(null);
      setPassport(null);
      setView('customer');
      setModal(null);
      setNotice({ tone: 'success', text: 'Demo reset.' });
    });
  }

  async function confirm() {
    await act(async () => {
      await api.confirm(state.id, { customerId: CUSTOMER_ID });
      const [s, j] = await Promise.all([api.getState(CUSTOMER_ID), api.getJourney(CUSTOMER_ID)]);
      setState(s.state);
      setConfidence(s.state.confidence);
      setJourney(j.journey);
      setModal(null);
      setNotice({ tone: 'success', text: 'Thanks, Elise. Your home journey is ready.' });
    });
  }

  async function reject() {
    await act(async () => {
      await api.reject(state.id, { customerId: CUSTOMER_ID, reason: 'not_relevant' });
      const r = await api.getState(CUSTOMER_ID);
      setState(r.state);
      setConfidence(r.state?.confidence ?? 0);
      setModal(null);
    });
  }

  // "Pause this kind of help" (backend: POST /api/states/{id}/pause and /resume).
  async function pause() {
    await act(async () => {
      const r = await api.pause(state.id, { customerId: CUSTOMER_ID });
      setState(r.state);
      setModal(null);
      setNotice({ tone: 'info', text: 'Home-purchase help is paused. You can turn it back on at any time.' });
    });
  }

  async function resume() {
    await act(async () => {
      const r = await api.resume(state.id, { customerId: CUSTOMER_ID });
      setState(r.state);
      setNotice({ tone: 'success', text: 'Home-purchase help is back on.' });
    });
  }

  async function completeStep(stepId) {
    await act(async () => {
      const r = await api.completeStep(journey.id, stepId);
      setJourney(r.journey);
    });
  }

  function toggleField(key) {
    setSelectedFields(list => (list.includes(key) ? list.filter(value => value !== key) : [...list, key]));
  }

  async function share() {
    if (!selectedFields.length) return;
    await act(async () => {
      const r = await api.createPassport({
        customerId: CUSTOMER_ID,
        purpose: 'kbc_live_home_exploration',
        selectedFields,
        ttlHours: 24,
      });
      await setItem(KEYS.passport, r.passport.id);
      setPassport(r.passport);
      setModal(null);
      setNotice({ tone: 'success', text: 'Your selected context is ready for KBC Live.' });
    });
  }

  async function openAdviser() {
    if (!passport) return;
    await act(async () => {
      const r = await api.getPassport(passport.id);
      setPassport(r.passport);
      setModal(null);
      setView('adviser');
    });
  }

  // Demo controls -> Server. Tests the new address before saving it; empty = default.
  async function changeServer(value) {
    await act(async () => {
      const candidate = normalizeBaseUrl(value);
      if (candidate) await api.health(candidate);
      const info = await saveServer(candidate);
      setServer(info);
      await api.getCustomers();
      await sync();
      setNotice({ tone: 'success', text: `Connected to ${info.url}.` });
    });
  }

  function showInfo(text) {
    setError('');
    setNotice({ tone: 'info', text });
  }

  return {
    // data
    state, confidence, events, journey, passport, view, modal, selectedFields,
    busy, error, notice, server, ready, refreshing,
    // derived
    visible, confirmed, paused, nextEvent,
    // actions
    start, refresh, syncQuietly, playAll, playNext, reset, confirm, reject, pause, resume,
    completeStep, toggleField, share, openAdviser, changeServer, showInfo,
    setModal, setView, setError, setNotice,
  };
}
