const MAX_PAYLOAD_BYTES = Number(process.env.LEADS_MAX_PAYLOAD_BYTES || 16384);
const MIN_SUBMIT_MS = Number(process.env.LEADS_MIN_SUBMIT_MS || 2000);
const MAX_TOUCH_BYTES = 4096;
const ALLOWED_COUNTRIES = new Set(["atlas", "colombia", "mexico", "venezuela", "guatemala", "brasil"]);
const ALLOWED_FIELDS = new Set([
  "email",
  "landingCountry",
  "landingPath",
  "pagePath",
  "firstTouch",
  "lastTouch",
  "marketingConsent",
  "privacyAcknowledged",
  "consentVersion",
  "honeypot",
  "formStartedAt",
  "idempotencyKey",
  "anonymousSessionId",
  "formVersion",
]);
const TOUCH_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ttclid",
  "landing",
  "referrer",
  "page",
  "capturedAt",
]);
const ALLOWED_PATHS = new Set([
  "/",
  "/index.html",
  "/colombia",
  "/colombia.html",
  "/mexico",
  "/mexico.html",
  "/venezuela",
  "/venezuela.html",
  "/guatemala",
  "/guatemala.html",
  "/brasil",
  "/brasil.html",
]);

function publicError(status, code = "invalid_request") {
  return { ok: false, status, body: { ok: false, error: code } };
}

function byteLength(value) {
  return Buffer.byteLength(String(value || ""), "utf8");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeEmail(email) {
  const trimmed = String(email || "").trim();
  return {
    email: trimmed,
    emailNormalized: trimmed.toLowerCase(),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function validatePath(path) {
  if (path === undefined || path === null || path === "") return null;
  if (typeof path !== "string") return false;
  if (path.length > 256 || !path.startsWith("/") || path.includes("://")) return false;
  return ALLOWED_PATHS.has(path) ? path : false;
}

function sanitizeTouch(value) {
  if (value === undefined || value === null) return {};
  if (!isPlainObject(value)) return false;
  const clean = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!TOUCH_KEYS.has(key)) return false;
    if (typeof raw !== "string") return false;
    const val = raw.trim();
    if (val.length > 512) return false;
    if (val) clean[key] = val;
  }
  if (byteLength(JSON.stringify(clean)) > MAX_TOUCH_BYTES) return false;
  return clean;
}

function parseFormStartedAt(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : false;
  }
  return false;
}

function validatePayload(payload, now = Date.now()) {
  if (!isPlainObject(payload)) return publicError(400);
  for (const key of Object.keys(payload)) {
    if (!ALLOWED_FIELDS.has(key)) return publicError(400);
  }

  const honeypot = typeof payload.honeypot === "string" ? payload.honeypot.trim() : "";
  if (honeypot) {
    return { ok: true, honeypot: true, data: null };
  }

  const { email, emailNormalized } = normalizeEmail(payload.email);
  if (!isValidEmail(emailNormalized)) return publicError(400);

  if (!ALLOWED_COUNTRIES.has(payload.landingCountry)) return publicError(400);

  const landingPath = validatePath(payload.landingPath);
  const pagePath = validatePath(payload.pagePath);
  if (landingPath === false || pagePath === false) return publicError(400);

  const firstTouch = sanitizeTouch(payload.firstTouch);
  const lastTouch = sanitizeTouch(payload.lastTouch);
  if (firstTouch === false || lastTouch === false) return publicError(400);

  if (payload.marketingConsent !== undefined && typeof payload.marketingConsent !== "boolean") return publicError(400);
  if (payload.privacyAcknowledged !== true) return publicError(400);

  const consentVersion = String(payload.consentVersion || "").trim();
  if (!consentVersion || consentVersion.length > 64) return publicError(400);

  const formStartedAt = parseFormStartedAt(payload.formStartedAt);
  if (formStartedAt === false) return publicError(400);
  if (now - formStartedAt < MIN_SUBMIT_MS) {
    return { ok: true, honeypot: true, data: null };
  }

  const idempotencyKey = String(payload.idempotencyKey || "").trim();
  if (idempotencyKey.length < 16 || idempotencyKey.length > 128) return publicError(400);
  if (!/^[A-Za-z0-9._:-]+$/.test(idempotencyKey)) return publicError(400);

  const anonymousSessionId = String(payload.anonymousSessionId || "").trim();
  if (anonymousSessionId && anonymousSessionId.length > 128) return publicError(400);

  const formVersion = String(payload.formVersion || "").trim();
  if (!formVersion || formVersion.length > 64) return publicError(400);

  const firstReferrer = firstTouch.referrer || lastTouch.referrer || null;
  const lastReferrer = lastTouch.referrer || firstReferrer;

  return {
    ok: true,
    honeypot: false,
    data: {
      email,
      email_normalized: emailNormalized,
      landing_country: payload.landingCountry,
      landing_path: landingPath,
      page_path: pagePath,
      first_referrer: firstReferrer,
      last_referrer: lastReferrer,
      first_touch: firstTouch,
      last_touch: lastTouch,
      marketing_consent: Boolean(payload.marketingConsent),
      privacy_acknowledged: true,
      consent_version: consentVersion,
      anonymous_session_id: anonymousSessionId || null,
      form_version: formVersion,
      idempotency_key: idempotencyKey,
    },
  };
}

module.exports = {
  MAX_PAYLOAD_BYTES,
  ALLOWED_COUNTRIES,
  validatePayload,
  normalizeEmail,
  publicError,
};
