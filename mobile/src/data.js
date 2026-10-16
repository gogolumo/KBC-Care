// Same constants as frontend/app/page.jsx and frontend/lib/demo-events.js.
// Confidence, states and policy decisions always come from the backend.

export const CUSTOMER_ID = 'elise';

export const SHARE_FIELDS = [
  ['confirmedGoal', 'Confirmed goal', 'Exploring a home purchase'],
  ['journeyProgress', 'Journey progress', 'Steps Elise has completed'],
  ['unresolvedQuestions', 'Unresolved questions', 'What Elise wants to ask'],
];

export const TRANSACTIONS = [
  ['Delhaize', 'Today', '− € 42.18'],
  ['NMBS / SNCB', 'Yesterday', '− € 18.40'],
  ['Salary', '26 Sep', '+ € 2,840.00'],
  ['Energy bill', '24 Sep', '− € 126.70'],
];

// Presentation labels for the ordered synthetic events in backend/app/seed/elise.json.
export const DEMO_EVENTS = [
  { id: 'evt_salary', title: 'Salary received', source: 'Core banking' },
  { id: 'evt_mortgage', title: 'Mortgage simulation completed', source: 'Simulator' },
  { id: 'evt_myhome', title: 'MyHome visited several times', source: 'MyHome' },
  { id: 'evt_rent', title: 'Housing payment pattern changed', source: 'Core banking' },
  { id: 'evt_property_doc', title: 'Property document saved', source: 'Documents' },
];

// The backend shows the card from this confidence (state engine threshold).
export const CONFIDENCE_THRESHOLD = 60;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "1 Oct" like the web's Intl en-GB format, without depending on Intl data on the device.
export function fmtDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function confidenceLabel(confidence) {
  if (confidence >= 80) return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
}
