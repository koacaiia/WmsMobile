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

In browser console (once):

```javascript
localStorage.setItem("fcmRelayEndpoint", "https://asia-southeast1-fine-bondedwarehouse.cloudfunctions.net/sendFcmRelay");
localStorage.setItem("fcmRelayApiKey", "change-this-long-random-key");
```

## 6) Required frontend header

When calling relay endpoint, send `x-api-key` with `localStorage.fcmRelayApiKey`.

If your frontend currently omits this header, add it in `main.js` fetch options.
