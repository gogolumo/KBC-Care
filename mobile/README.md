# KBC Care — mobile app

A native mobile version of the KBC Care web demo (`frontend/app/page.jsx`), built with **Expo + React Native**.
It uses the same backend, the same API contract and the same demo story (Elise exploring a home purchase), with the
web UI rebuilt from native components for phones.

This folder is self-contained. Nothing outside `mobile/` was changed. The backend, the web frontend, CI and the
Cloud Run image do not depend on it.

---

## 1. What is in the app

| Screen / sheet | Same as on the web | Notes |
|---|---|---|
| Customer home | header, “Good evening Elise”, *Your money*, quick actions, *Recent activity*, **Ask Kate** button | Web top nav → bottom tab bar (Home active). The greeting follows the phone’s clock. |
| Care panel (“Thinking about a home?”) | shown when confidence ≥ 60 and state is `inferred` | Buttons: *Yes, help me explore* / *Not right now* / *Why am I seeing this?* |
| Home journey | shown after confirm; tap the active step to complete it | *Talk to a KBC adviser* opens the share sheet |
| Everyday card | shown before the card (and not after reject/pause); *See the demo* runs the story | |
| Sheets | Kate, Why, Share (Context Passport), Demo controls | Web right-hand panels → bottom sheets. Close by tapping outside, the ✕, or Android back. |
| Adviser workspace | shared fields, decision confidence bar, recommended approach, Kate assistant, consent card | Single column. *← Back* or Android back returns to the customer view. |

Mobile-only additions (no backend changes needed, all endpoints exist on `main`):

- **Pause this kind of help** in the *Why* sheet, plus a *paused* card with *Turn help back on*
  (`POST /api/states/{id}/pause` and `/resume`, added in PR #20). The web UI does not show this yet.
- **Server setting** in *Demo controls*: shows the backend address in use, lets you type another one
  (tested with `/api/health` before it is saved) or go back to the default.
- **Pull to refresh**, and a quiet resync when the app comes back to the foreground. The phone and the web page
  share one backend, so you can run the story on the laptop and refresh on the phone.
- The tabs *Payments / Products / Support* and the quick actions are placeholders, as on the web. Tapping one shows
  “… is not part of this demo.”

## 2. Tech stack

| Package | Version | Why |
|---|---|---|
| `expo` | ~57.0.26 (SDK 57) | tooling, Expo Go, builds |
| `react-native` | 0.86.3 | native UI |
| `react` | 19.2.3 | |
| `react-native-svg` | 15.15.4 | the same 24×24 stroke icons as the web |
| `react-native-safe-area-context` | ~5.7.0 | notch / home-indicator insets |
| `@react-native-async-storage/async-storage` | 2.2.0 | replaces `sessionStorage` (passport id, server address) |
| `expo-constants` | ~57.0.20 | finds the IP of the computer running Expo |
| `expo-status-bar` | ~57.0.1 | dark status bar icons |
| `react-native-web`, `react-dom`, `@expo/metro-runtime` | ~0.21.0 / 19.2.3 / ~57.0.16 | optional browser preview (`npx expo start --web`) |

Versions are the ones Expo SDK 57 pins (`expo/bundledNativeModules.json`). Use `npx expo install <pkg>` when you
add packages so they stay compatible. The app is plain JavaScript like `frontend/`; there is no navigation library
because there are only two views, switched with the same `view` state the web page uses.

## 3. Requirements

- **Node.js** `^20.19.4 || ^22.13.0 || ^24.3.0 || >=25` (React Native 0.86 requirement) and npm.
- The backend from this repo (`backend/.venv`, see the root README).
- One of:
  - a phone with **Expo Go** from the App Store / Play Store (the store version supports SDK 57), on the **same Wi-Fi** as your computer;
  - Android Studio with an emulator;
  - Xcode with an iOS simulator (macOS only);
  - a desktop browser (web preview).

## 4. Quick start on a phone (Windows commands; macOS/Linux in brackets)

**Terminal 1: backend reachable from the network.** `--host 0.0.0.0` is the important part. The default
`127.0.0.1` only accepts connections from the computer itself.

```powershell
cd backend
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# [ .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 ]
```

On Windows, allow Python through the firewall on **private networks** when asked. If you missed the prompt, run
this in an administrator PowerShell:

```powershell
New-NetFirewallRule -DisplayName "KBC Care backend 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

**Terminal 2: the app.**

```powershell
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone). The app finds the backend automatically at
`http://<your computer's IP>:8000`, using the same IP Expo uses for the QR code. Open **Demo controls → Server** to
see the address in use.

Quick network check: on the phone’s browser, open `http://<your computer's IP>:8000/api/health`. It should
return `{"ok":true,...}`. Find the IP with `ipconfig` (Windows) or `ipconfig getifaddr en0` (macOS).

## 5. Choosing the backend address

The value is the **server root without `/api`**. The app adds `/api/...` itself, and a trailing `/api` or a
missing `http://` is corrected automatically.

Resolution order:

1. **Saved in the app**: *Demo controls → Server → Connect*. Stored on the device; *Use default* removes it.
2. **`EXPO_PUBLIC_API_URL`**: copy `.env.example` to `.env` (git-ignored), set the value, then restart
   `npx expo start` (the value is compiled into the bundle).
3. **Automatic default**:

| Where the app runs | Default |
|---|---|
| Phone with Expo Go / dev build | `http://<IP of the computer running expo start>:8000` |
| Android emulator | `http://10.0.2.2:8000` (the emulator’s alias for your computer) |
| iOS simulator | `http://127.0.0.1:8000` |
| Web preview | `http://<page host>:8000` |

**Cloud Run.** You can also use the deployed HTTPS URL (for example `https://kbc-care-….run.app`). The Next.js
service proxies `/api/*` to FastAPI. If the backend has its own Cloud Run service, its URL works too. Keep Cloud Run
at **one instance** (see the root README): demo state is in memory.

Native apps are not subject to CORS, so no backend change is needed for phones or emulators.

## 6. Other ways to run

| Target | Command | Notes |
|---|---|---|
| Android emulator | `npx expo start --android` (or press `a`) | Start the emulator in Android Studio first |
| iOS simulator | `npx expo start --ios` (or press `i`) | macOS + Xcode only |
| Browser | `npx expo start --web` (or press `w`), open `http://localhost:8081` | Needs CORS, see below |
| Clear Metro cache | `npx expo start -c` | After changing `.env` or when bundling looks stale |

**Web preview and CORS.** The page on `http://localhost:8081` calls the backend on another port, so the backend
must allow that origin. Start it with:

```powershell
$env:CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:8081,http://127.0.0.1:8081"
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The Cloud Run Next.js proxy does not add CORS headers, so for the web preview use a local backend (phones are
not affected).

## 7. Demo script (same story as the web)

1. Open the app: everyday card, *See the demo*.
2. *See the demo* (or *Demo controls → Run full story / Next signal*). After 5 signals the rule score is 83 and the
   card **Thinking about a home?** appears.
3. *Why am I seeing this?* “This is not a credit decision.” Optional: *Pause this kind of help*, then
   *Turn help back on*.
4. *Yes, help me explore*: “Thanks, Elise. Your home journey is ready.” and the journey list.
5. Tap the step marked *Continue*. It becomes *Done*.
6. *Talk to a KBC adviser*: choose the fields, *Continue to KBC Live*.
7. *Talk to a KBC adviser → Open adviser view*: only the shared fields, confidence 83 % · High, consent 24 h.
8. *Demo controls → Reset* to start again. *Not right now* on the card shows the reject path.

## 8. Project structure

```text
mobile/
├── App.js                    root: SafeAreaProvider, customer ⇄ adviser view, sheets, Android back, foreground resync
├── index.js                  registerRootComponent (Expo entry)
├── app.json                  Expo config: name, icons, bundle ids, portrait, light mode
├── eas.json                  EAS Build profiles (preview = installable APK, production)
├── package.json              dependencies pinned to Expo SDK 57
├── .env.example              EXPO_PUBLIC_API_URL template (copy to .env)
├── assets/                   app icon, Android adaptive/monochrome icon, web favicon
└── src/
    ├── api.js                API client (same endpoints/errors as frontend/lib/api.js + pause/resume/health), 10 s timeout
    ├── config.js             backend address resolution (env → Expo host IP → emulator/simulator defaults)
    ├── storage.js            AsyncStorage wrapper (passport id, saved server)
    ├── data.js               Elise constants, demo events, share fields, transactions, date/greeting helpers
    ├── theme.js              colours and tokens from frontend/app/globals.css
    ├── useCompass.js         all state + actions (port of page.jsx logic)
    ├── components/           Icon (react-native-svg), Logo, Buttons, Notice, Sheet (bottom sheet)
    ├── screens/              CustomerHome, AdviserScreen
    └── sheets/               KateSheet, WhySheet, ShareSheet, DemoSheet (+ Server setting)
```

## 9. How the web UI was ported

| Web (`frontend/`) | Mobile (`mobile/`) |
|---|---|
| `page.jsx` state + actions (`act`, `playAll`, `confirm`, `share`, …) | `src/useCompass.js`, same order of API calls and same messages |
| `lib/api.js` → Next.js `/api` proxy | `src/api.js` → server root from `src/config.js` (a phone cannot use a relative `/api`) |
| `lib/demo-events.js`, constants in `page.jsx` | `src/data.js` |
| `globals.css` variables and classes | `src/theme.js` + `StyleSheet.create` per component, mobile breakpoint (≤ 480 px) layout |
| inline `<svg>` icons | `src/components/Icon.js`, same path data |
| `sessionStorage['compass-passport']` | AsyncStorage key `compass-passport` (survives app restarts) |
| right-hand `.sheet` + backdrop | `Modal` bottom sheet with backdrop, spring animation, keyboard avoidance |
| header nav buttons | bottom tab bar |
| `<input type="checkbox">` | `Pressable` rows with `accessibilityRole="checkbox"` |
| `:hover`, `:focus-visible` | pressed states, `hitSlop`, accessibility roles/labels |
| `Intl.DateTimeFormat('en-GB')` | `fmtDate` in `data.js` (no Intl data needed on older devices) |

## 10. API calls used

| Call | Used for |
|---|---|
| `GET /api/health` | checking a new server address |
| `GET /api/customers` | first load |
| `GET /api/simulation/status?customerId=elise` | first load, pull to refresh, foreground resync |
| `POST /api/simulation/events/{eventId}` | *See the demo*, *Run full story*, *Next signal* |
| `POST /api/simulation/reset` | *Reset* |
| `GET /api/customers/elise/state` | after confirm/reject (`404 STATE_NOT_FOUND` → no state) |
| `POST /api/states/{id}/confirm` · `/reject` · `/pause` · `/resume` | care panel, Why sheet, paused card |
| `GET /api/customers/elise/journey` | journey after confirm / restart |
| `POST /api/journeys/{id}/steps/{stepId}/complete` | journey rows |
| `POST /api/context-passports` · `GET /api/context-passports/{id}` | share sheet, adviser view, restore after restart (`410 PASSPORT_EXPIRED` → forgotten) |

Errors use the backend shape `{"error":{"code","message","details"}}` and are shown in the red notice with
*Retry* / *Close*. Network failures and timeouts show which server address was tried.

## 11. Installable builds (EAS)

Expo Go is enough for the demo. For an installable app:

```powershell
npm install -g eas-cli
eas login                     # free Expo account
cd mobile
eas build -p android --profile preview      # APK you can install directly (internal distribution)
eas build -p ios --profile production       # needs an Apple Developer account
```

- Set the backend for a build in `eas.json`, for example
  `"preview": { "env": { "EXPO_PUBLIC_API_URL": "https://<your-service>.run.app" }, ... }`. The local `.env` is
  git-ignored, so EAS does not upload it.
- Use an **HTTPS** backend (Cloud Run) for installable builds. Release builds block plain HTTP by default
  (Android cleartext policy, iOS App Transport Security). Expo Go and dev builds allow HTTP on the LAN.
- `com.hackathon.kbccare` (Android package / iOS bundle id) is a placeholder. Change it before any store upload.
- Local native builds without EAS: `npx expo run:android` (Android SDK) or `npx expo run:ios` (macOS). They
  generate `android/` and `ios/`, which are git-ignored.

## 12. Checks

```powershell
npx expo install --check                                                 # dependency versions match SDK 57
npx expo export --platform android --output-dir $env:TEMP\kbc-mobile-check  # Android JS bundle (no device needed)
npx expo export --platform all --output-dir dist                         # Android + iOS + web (dist/ is git-ignored)
```

## 13. Troubleshooting

| Symptom | Fix |
|---|---|
| “Can't reach the KBC Care server at http://…:8000” | Start the backend with `--host 0.0.0.0`; same Wi-Fi (not a guest network); firewall rule for port 8000; turn off VPN; check `/api/health` in the phone browser; set the address in *Demo controls → Server*. |
| Expo Go says the project is incompatible | Update Expo Go. This project uses SDK 57. |
| QR code does not connect | Try `npx expo start --tunnel`. The tunnel covers the app bundle only, so point *Server* at the Cloud Run URL or the computer’s IP. |
| Web preview: CORS error in the browser console | Add `http://localhost:8081` to `CORS_ORIGINS` (section 6). |
| 404 on every call | The address should be the server root (`http://ip:8000`), not `…/api` or the Next.js page path. |
| Phone shows old state after using the web demo | Pull down to refresh (or switch apps and come back). |
| `.env` change ignored | Restart with `npx expo start -c`. |
| Node version error during `npm install` | Install Node 22 LTS or newer. |

## 14. Security and privacy

- No credentials in this folder. `EXPO_PUBLIC_*` values are compiled into the app and readable by anyone, so
  only put public URLs there.
- Synthetic demo data only (Elise). The device stores two values: the Context Passport id and the chosen server
  address.
- All decisions stay in the backend: confidence, state engine and policy engine. The app only shows them. As on the
  web, the UI says the card “is not a credit decision”.

## 15. Known limitations

- Kate suggestions are static text, as on the web.
- One demo customer, no login, no push notifications.
- The backend keeps state in memory, so a backend restart resets the story (pull to refresh on the phone).
- Tested on Android/web tooling. iOS uses the same code but was not run on a real iPhone during the hackathon.
