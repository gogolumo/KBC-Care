// Mobile version of frontend/lib/api.js: same endpoints, same error shape
// ({"error": {"code", "message", "details"}}), plus pause/resume and health.
import { CUSTOMER_ID } from './data';
import { defaultBaseUrl, normalizeBaseUrl } from './config';
import { KEYS, getItem, removeItem, setItem } from './storage';

const TIMEOUT_MS = 10000;

let current = defaultBaseUrl();

export function getServer() {
  return { ...current };
}

// Called once at start-up: an address saved in Demo controls wins over the defaults.
export async function loadSavedServer() {
  const saved = normalizeBaseUrl(await getItem(KEYS.apiUrl));
  if (saved) current = { url: saved, source: 'saved in the app' };
  return getServer();
}

// Empty value = forget the saved address and go back to the default.
export async function saveServer(value) {
  const url = normalizeBaseUrl(value);
  if (url) {
    await setItem(KEYS.apiUrl, url);
    current = { url, source: 'saved in the app' };
  } else {
    await removeItem(KEYS.apiUrl);
    current = defaultBaseUrl();
  }
  return getServer();
}

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}, base = current.url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${base}/api${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', accept: 'application/json', ...options.headers },
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    throw new ApiError(
      timedOut
        ? `The KBC Care server at ${base} did not answer in time.`
        : `Can't reach the KBC Care server at ${base}. Check the server address in Demo controls.`,
      timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
      0,
    );
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error?.message || `Request failed (${response.status})`, data.error?.code, response.status);
  }
  return data;
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
const enc = encodeURIComponent;

export const api = {
  health: base => request('/health', {}, base ? normalizeBaseUrl(base) : current.url),
  getCustomers: () => request('/customers'),
  reset: body => post('/simulation/reset', body),
  getSimulationStatus: id => request(`/simulation/status?customerId=${enc(id)}`),
  playEvent: (eventId, customerId = CUSTOMER_ID) => post(`/simulation/events/${enc(eventId)}`, { customerId }),
  getState: async id => {
    try {
      return await request(`/customers/${enc(id)}/state`);
    } catch (error) {
      if (error.code === 'STATE_NOT_FOUND') return { state: null };
      throw error;
    }
  },
  evaluatePolicy: body => post('/policy/evaluate', body),
  confirm: (stateId, body) => post(`/states/${enc(stateId)}/confirm`, body),
  reject: (stateId, body) => post(`/states/${enc(stateId)}/reject`, body),
  pause: (stateId, body) => post(`/states/${enc(stateId)}/pause`, body),
  resume: (stateId, body) => post(`/states/${enc(stateId)}/resume`, body),
  getJourney: id => request(`/customers/${enc(id)}/journey`),
  completeStep: (journeyId, stepId, customerId = CUSTOMER_ID) =>
    post(`/journeys/${enc(journeyId)}/steps/${enc(stepId)}/complete`, { customerId }),
  createPassport: body => post('/context-passports', body),
  getPassport: id => request(`/context-passports/${enc(id)}`),
};
