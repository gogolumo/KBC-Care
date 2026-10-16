// Where the app finds the KBC Care backend.
//
// Unlike the web app (which calls its own Next.js /api proxy), a phone has to call the server
// directly. Resolution order:
//   1. address saved in the app (Demo controls -> Server), handled in api.js
//   2. EXPO_PUBLIC_API_URL (from mobile/.env or the shell, inlined at bundle time)
//   3. automatic default for the platform (see defaultBaseUrl)
// The value is the server root; the client appends /api/... itself. Both FastAPI directly
// (port 8000) and the deployed Cloud Run service (Next.js proxy) serve the same /api routes.
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const BACKEND_PORT = 8000;

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

export function normalizeBaseUrl(value) {
  let url = String(value ?? '').trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/api$/i, '');
  return url;
}

// IP of the computer running `npx expo start`, as seen by the phone (Expo Go / dev builds only).
// hostUri looks like "192.168.1.23:8081". Tunnel hosts (*.exp.direct) are ignored because the
// backend is not tunnelled.
function devServerIp() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    '';
  const host = String(hostUri).split(':')[0];
  return IPV4.test(host) && host !== '127.0.0.1' ? host : '';
}

export function defaultBaseUrl() {
  const fromEnv = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  if (fromEnv) return { url: fromEnv, source: 'EXPO_PUBLIC_API_URL' };

  if (Platform.OS === 'web') {
    const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
    return { url: `http://${host}:${BACKEND_PORT}`, source: 'web default' };
  }

  const ip = devServerIp();
  if (ip) return { url: `http://${ip}:${BACKEND_PORT}`, source: 'computer running Expo' };

  if (Platform.OS === 'android') return { url: `http://10.0.2.2:${BACKEND_PORT}`, source: 'Android emulator default' };
  return { url: `http://127.0.0.1:${BACKEND_PORT}`, source: 'simulator default' };
}
