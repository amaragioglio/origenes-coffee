const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const buckets = new Map();

function hashIdentity(value) {
  const input = String(value || "unknown");
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

function getClientIdentity(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.socket?.remoteAddress || "unknown");
  return hashIdentity(ip.split(",")[0].trim());
}

function checkRateLimit(identity, now = Date.now()) {
  const current = buckets.get(identity);
  if (!current || now > current.resetAt) {
    buckets.set(identity, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  current.count += 1;
  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

module.exports = {
  checkRateLimit,
  getClientIdentity,
};
