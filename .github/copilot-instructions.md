# Copilot Instructions for WmsMobile

## Architecture

Static PWA (no build step) deployed to GitHub Pages at `/WmsMobile`. All scripts are loaded as plain `<script>` tags; no module system. Cross-file communication uses global variables on `window`.

**Frontend** (root):
| Files | Purpose |
|-------|---------|
| `index.html`, `main.js`, `style.css` | Main entry point, core logic, primary UI |
| `otherPlt.{html,js,css}` | Pallet management |
| `otherEnF.{html,js,css}` | Equipment & facility inspection |
| `imagePop.{html,js,css}` (img.css) | Image gallery pop-up |
| `firebase-messaging-sw.js` | Service worker for FCM background notifications |
| `images/` | Static image assets |

**Backend** (`firebase-relay-function/`): Node 20 Cloud Function that proxies FCM sends. See [firebase-relay-function/README.md](../firebase-relay-function/README.md) for full setup.

## Build and Deploy

Frontend: no build. Open any HTML file directly in a browser or serve from GitHub Pages.

Relay function:
```bash
cd firebase-relay-function
npm install
npm run serve          # local emulator
npm run deploy         # deploy to Firebase (Asia Southeast 1)
```

Set the relay API key before deploying (PowerShell):
```powershell
$env:RELAY_API_KEY="your-long-random-key"; firebase deploy --only functions
```

## Conventions

- **Feature files**: each feature gets its own `feature.{html,js,css}` trio; link them together inside the feature HTML.
- **Firebase paths**: always follow `DeptName/{deptName}/{Feature}` — e.g. `DeptName/WareHouseDept2/PltManagement`.
- **`deptName` is hardcoded** as `"WareHouseDept2"` in every feature file. Do not parameterize unless explicitly asked.
- **`FCM_RELAY_API_KEY`**: set on `window` in `index.html` before `main.js` loads. Also stored in `localStorage` under key `fcmRelayApiKey`. The placeholder value `"WMS_RELAY_AUTO_KEY_20260324"` is the default auto-key; a missing or placeholder key triggers a prompt.
- **localStorage keys**: `wmsUserName`, `fcmRelayApiKey`, `fcmRelayEndpoint`.
- **Icon paths**: both frontend (`normalizeNotificationIconUrl`) and relay function normalize `/images/` → `/WmsMobile/images/`. Don't break this in either place.
- **Mobile simulation**: append `?sim=1` to URL to force mobile UI layout for testing.
- **Date formatting**: use the existing `dateT(d)` helper (returns `YYYY-MM-DD`, falls back to `"미정"`).
- **CSS classes for state**: `.popUp`, `.file-selected`, `.schedule-selected` toggle modals/panels.

## Pitfalls

- **Service worker scope**: `firebase-messaging-sw.js` must be at the root (not in a subfolder) because GitHub Pages serves the app from `/WmsMobile/`. Pass an explicit `serviceWorkerRegistration` to `messaging.getToken` to avoid 404s.
- **No duplicate `getToken` calls**: request once after notification permission is granted.
- **Relay 401**: occurs when the frontend sends the placeholder key. Always load from `window.FCM_RELAY_API_KEY` / localStorage; treat the placeholder as missing and prompt the user.
- No automated tests — verify changes manually in a browser with DevTools open.
