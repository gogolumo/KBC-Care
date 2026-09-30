// Browser requests use the Next.js rewrite in next.config.mjs, which avoids CORS
// and keeps the frontend on the documented /api response contract.
async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options, headers: { 'content-type': 'application/json', ...options.headers },
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Request failed (${response.status})`);
    error.code = data.error?.code;
    throw error;
  }
  return data;
}
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const api = {
  getCustomers: () => request('/customers'),
  reset: body => post('/simulation/reset', body),
  playEvent: eventId => post(`/simulation/events/${encodeURIComponent(eventId)}`, { customerId: 'elise' }),
  getState: async id => {
    try { return await request(`/customers/${encodeURIComponent(id)}/state`); }
    catch (error) { if (error.code === 'STATE_NOT_FOUND') return { state: null }; throw error; }
  },
  evaluatePolicy: body => post('/policy/evaluate', body),
  confirm: (stateId, body) => post(`/states/${encodeURIComponent(stateId)}/confirm`, body),
  reject: (stateId, body) => post(`/states/${encodeURIComponent(stateId)}/reject`, body),
  getJourney: id => request(`/customers/${encodeURIComponent(id)}/journey`),
  completeStep: (journeyId, stepId) => post(`/journeys/${encodeURIComponent(journeyId)}/steps/${encodeURIComponent(stepId)}/complete`, { customerId: 'elise' }),
  createPassport: body => post('/context-passports', body),
  getPassport: id => request(`/context-passports/${encodeURIComponent(id)}`)
};
