const { MAX_PAYLOAD_BYTES, validatePayload } = require("./_lib/validation");
const { checkRateLimit, getClientIdentity } = require("./_lib/rate-limit");
const { getSupabaseConfig, upsertLead } = require("./_lib/supabase");

function json(res, status, body, extraHeaders = {}) {
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.setHeader("Content-Type", "application/json");
  res.status(status).json(body);
}

function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_PAYLOAD_BYTES) {
      const error = new Error("payload_too_large");
      error.status = 413;
      throw error;
    }
    return JSON.parse(req.body);
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(String(chunk), "utf8");
    if (total > MAX_PAYLOAD_BYTES) {
      const error = new Error("payload_too_large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

module.exports = async function leadsHandler(req, res) {
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "method_not_allowed" }, { Allow: "POST" });
    return;
  }

  const contentType = String(req.headers["content-type"] || "");
  if (!contentType.toLowerCase().startsWith("application/json")) {
    json(res, 415, { ok: false, error: "unsupported_media_type" });
    return;
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    json(res, 413, { ok: false, error: "payload_too_large" });
    return;
  }

  const rate = checkRateLimit(getClientIdentity(req));
  if (!rate.allowed) {
    json(res, 429, { ok: false, error: "too_many_requests" }, { "Retry-After": String(rate.retryAfter || 60) });
    return;
  }

  let payload;
  try {
    payload = await readBody(req);
    if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_PAYLOAD_BYTES) {
      json(res, 413, { ok: false, error: "payload_too_large" });
      return;
    }
  } catch (err) {
    if (err.status === 413) {
      json(res, 413, { ok: false, error: "payload_too_large" });
      return;
    }
    json(res, 400, { ok: false, error: "invalid_request" });
    return;
  }

  const validated = validatePayload(payload);
  if (!validated.ok) {
    json(res, validated.status, validated.body);
    return;
  }

  if (validated.honeypot) {
    json(res, 200, { ok: true, leadStatus: "ignored" });
    return;
  }

  const config = getSupabaseConfig();
  if (!config) {
    json(res, 503, { ok: false, error: "service_unavailable" });
    return;
  }

  try {
    const result = await upsertLead(config, validated.data);
    json(res, 200, { ok: true, leadStatus: result.leadStatus || "accepted" });
  } catch (err) {
    console.error("lead_capture_failed", {
      status: err.status || 500,
      landingCountry: validated.data.landing_country,
      pagePath: validated.data.page_path,
    });
    json(res, err.status && err.status < 500 ? 500 : 503, { ok: false, error: "service_unavailable" });
  }
};
