const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const allowedOrigins = [
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "https://koacaiia.github.io"
];

function setCors(req, res) {
  const origin = req.headers.origin || "";
  // Public web app endpoint: always return ACAO to satisfy browser preflight.
  // Security is enforced by relay auth checks, not by CORS origin filtering.
  res.set("Access-Control-Allow-Origin", "*");
  if (allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-api-key, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

function normalizeIconPath(iconValue) {
  const value = String(iconValue || "").trim();
  if (!value) {
    return "/WmsMobile/images/icon.png";
  }
  if (value.startsWith("/images/")) {
    return "/WmsMobile" + value;
  }
  return value;
}

exports.sendFcmRelay = onRequest({ region: "asia-southeast1" }, async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const relayApiKey = process.env.RELAY_API_KEY || "";
  const requestApiKey = String(req.headers["x-api-key"] || "");
  const authorization = String(req.headers.authorization || "");

  let isAuthorized = false;

  // Preferred path: Firebase Auth ID token (Bearer)
  if (authorization.toLowerCase().startsWith("bearer ")) {
    const idToken = authorization.substring(7).trim();
    if (idToken) {
      try {
        await admin.auth().verifyIdToken(idToken);
        isAuthorized = true;
      } catch (error) {
        console.error("Invalid bearer token:", error);
      }
    }
  }

  // Backward-compatible path: API key header (optional)
  if (!isAuthorized && relayApiKey && requestApiKey === relayApiKey) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = req.body || {};
    const to = String(body.to || "").trim();
    const tokens = Array.isArray(body.tokens) ? body.tokens : [];
    const notification = body.notification || {};

    const normalizedTokens = tokens
      .map((item) => String(item || "").trim())
      .filter((item) => item.length > 0);

    const uniqueTokens = Array.from(new Set(normalizedTokens));
    const hasSingleToken = !!to;
    const hasMultiTokens = uniqueTokens.length > 0;

    if (!hasSingleToken && !hasMultiTokens) {
      res.status(400).json({ error: "Missing target token(s). Provide 'to' or 'tokens'." });
      return;
    }

    const notificationPayload = {
      title: String(notification.title || "WMS"),
      body: String(notification.body || "")
    };

    const webpushPayload = {
      notification: {
        icon: normalizeIconPath(notification.icon)
      }
    };

    if (hasMultiTokens) {
      const multicastMessage = {
        tokens: uniqueTokens,
        notification: notificationPayload,
        webpush: webpushPayload
      };

      const result = await admin.messaging().sendEachForMulticast(multicastMessage);
      res.status(200).json({
        ok: true,
        mode: "multicast",
        requested: uniqueTokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      });
      return;
    }

    const message = {
      token: to,
      notification: notificationPayload,
      webpush: webpushPayload
    };

    const messageId = await admin.messaging().send(message);
    res.status(200).json({ ok: true, mode: "single", messageId });
  } catch (error) {
    console.error("sendFcmRelay error:", error);
    res.status(500).json({ ok: false, error: error.message || "Unknown error" });
  }
});
