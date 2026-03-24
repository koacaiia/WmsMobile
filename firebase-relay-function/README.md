# FCM Relay Function (CORS-safe)

This folder provides a Firebase Cloud Function relay so your web app does **not** call FCM directly from the browser.

## 1) Prerequisites

- Firebase CLI installed: `npm i -g firebase-tools`
- Logged in: `firebase login`
- Select project in this folder:
  - `firebase use fine-bondedwarehouse`

## 2) Install and deploy

```bash
cd firebase-relay-function
npm install
firebase deploy --only functions
```

## 3) Configure secret API key

Set a relay key in your deploy environment (Windows PowerShell example):

```powershell
$env:RELAY_API_KEY="change-this-long-random-key"; firebase deploy --only functions
```

Note: For production, set this via your CI/CD secure secrets and redeploy.

## 4) Function endpoint

After deploy, copy the generated HTTPS URL for `sendFcmRelay`.

Example shape:

`https://asia-southeast1-fine-bondedwarehouse.cloudfunctions.net/sendFcmRelay`

## 5) Connect from frontend

Endpoint is auto-filled in `main.js` by default.

Set relay API key in each browser once:

```javascript
localStorage.setItem("fcmRelayEndpoint", "https://asia-southeast1-fine-bondedwarehouse.cloudfunctions.net/sendFcmRelay");
localStorage.setItem("fcmRelayApiKey", "change-this-long-random-key");
```

## 6) Required frontend header

Use `x-api-key` with the value configured in `RELAY_API_KEY`.

If the key is missing, `main.js` prompts once and stores it in localStorage.

## 7) Request payload modes

Single device send:

```json
{
  "to": "<FCM_TOKEN>",
  "notification": {
    "title": "WMS",
    "body": "single send",
    "icon": "https://koacaiia.github.io/WmsMobile/images/icon.png"
  }
}
```

Multi-device send (broadcast):

```json
{
  "tokens": ["<FCM_TOKEN_1>", "<FCM_TOKEN_2>"],
  "notification": {
    "title": "WMS",
    "body": "broadcast send",
    "icon": "https://koacaiia.github.io/WmsMobile/images/icon.png"
  }
}
```

## 8) Realtime Database rules for device token registry

`main.js` now stores tokens under:

`DeptName/<deptName>/DeviceTokens/<sanitizedToken>`

If your Realtime Database rules are strict, allow this path (or apply the sample below).

Sample rules file has been added at:

`../database.rules.sample.json`

You can paste it in Firebase Console > Realtime Database > Rules, or wire it into your Firebase CLI deployment.

## 9) End-to-end checklist (multi-device)

Use this checklist when other devices are not receiving notifications.

1. Deploy latest relay function code:

```bash
cd firebase-relay-function
npm install
firebase deploy --only functions
```

1. Set relay config in each test browser (once):

```javascript
localStorage.setItem("fcmRelayEndpoint", "https://asia-southeast1-fine-bondedwarehouse.cloudfunctions.net/sendFcmRelay");
localStorage.setItem("fcmRelayApiKey", "<YOUR_RELAY_API_KEY>");
```

1. Apply Realtime Database rules that allow writing/reading:

`DeptName/<deptName>/DeviceTokens/*`

1. Open app on each device and allow notification permission.

1. In each device browser DevTools, confirm there are no relay auth errors and token registration logs appear.

1. On one device, press the test button (`#otherPlt`) to send broadcast.

1. If still failing, inspect these logs:

- Frontend console: `등록된 FCM 토큰 수`, `test 발송 실패: ...`
- Cloud Function logs for `sendFcmRelay` (success/failure counts)

1. If one specific device never receives:

- Re-open app on that device and re-allow notifications
- Clear site data/service worker and reload
- Re-open DevTools and verify token registration / relay send logs
