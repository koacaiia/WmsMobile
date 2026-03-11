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
  if (allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
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
  if (!relayApiKey || requestApiKey !== relayApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const body = req.body || {};
    const to = String(body.to || "").trim();
    const notification = body.notification || {};

    if (!to) {
      res.status(400).json({ error: "Missing 'to' token" });
      return;
    }

    const message = {
      token: to,
      notification: {
        title: String(notification.title || "WMS"),
        body: String(notification.body || "")
      },
      webpush: {
        notification: {
          icon: String(notification.icon || "/images/default-icon.png")
        }
      }
    };

    const messageId = await admin.messaging().send(message);
    res.status(200).json({ ok: true, messageId });
  } catch (error) {
    console.error("sendFcmRelay error:", error);
    res.status(500).json({ ok: false, error: error.message || "Unknown error" });
  }
});
