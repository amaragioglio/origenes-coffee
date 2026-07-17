const assert = require("node:assert/strict");
const handler = require("../api/leads");

function validPayload(overrides = {}) {
  const now = Date.now();
  return {
    email: "valid@example.com",
    landingCountry: "atlas",
    landingPath: "/",
    pagePath: "/",
    firstTouch: { landing: "/", referrer: "direct", capturedAt: new Date(now - 5000).toISOString() },
    lastTouch: { landing: "/", referrer: "direct", capturedAt: new Date(now - 4000).toISOString() },
    marketingConsent: false,
    privacyAcknowledged: true,
    consentVersion: "2026-07-17",
    honeypot: "",
    formStartedAt: new Date(now - 5000).toISOString(),
    idempotencyKey: `test-${now}-${Math.random().toString(36).slice(2)}`,
    anonymousSessionId: "session-123",
    formVersion: "lead-v1",
    ...overrides,
  };
}

function makeReq({ method = "POST", headers = {}, body = validPayload(), ip = "127.0.0.1" } = {}) {
  return {
    method,
    headers: {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(JSON.stringify(body), "utf8"),
      ...headers,
    },
    socket: { remoteAddress: ip },
    body,
  };
}

function makeRes() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    ended: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

async function call(req) {
  const res = makeRes();
  await handler(req, res);
  return res;
}

function clearEnv() {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.ALLOWED_ORIGINS;
}

async function withFetchMock(mock, fn) {
  const original = global.fetch;
  global.fetch = mock;
  try {
    await fn();
  } finally {
    global.fetch = original;
  }
}

(async () => {
  clearEnv();

  {
    const res = await call(makeReq({ method: "GET" }));
    assert.equal(res.statusCode, 405);
    assert.equal(res.body.error, "method_not_allowed");
  }

  {
    const res = await call(makeReq({ headers: { "content-type": "text/plain" } }));
    assert.equal(res.statusCode, 415);
  }

  {
    const res = await call(makeReq({ headers: { "content-length": "16385" } }));
    assert.equal(res.statusCode, 413);
  }

  {
    const body = `${" ".repeat(17000)}${JSON.stringify(validPayload())}`;
    const res = await call(makeReq({ headers: { "content-length": "0" }, body, ip: "127.0.0.10" }));
    assert.equal(res.statusCode, 413);
  }

  {
    const res = await call(makeReq({ body: validPayload({ honeypot: "bot" }) }));
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.leadStatus, "ignored");
  }

  {
    const res = await call(makeReq({ body: validPayload({ formStartedAt: new Date(Date.now()).toISOString() }) }));
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.leadStatus, "ignored");
  }

  {
    const res = await call(makeReq({ ip: "127.0.0.20" }));
    assert.equal(res.statusCode, 503);
  }

  {
    const ip = "127.0.0.30";
    for (let i = 0; i < 5; i += 1) {
      await call(makeReq({ ip, body: validPayload({ idempotencyKey: `rate-limit-key-${i}a` }) }));
    }
    const res = await call(makeReq({ ip, body: validPayload({ idempotencyKey: "rate-limit-key-final" }) }));
    assert.equal(res.statusCode, 429);
  }

  {
    process.env.ALLOWED_ORIGINS = "https://origenescoffee.com";
    const allowed = await call(makeReq({ headers: { origin: "https://origenescoffee.com" }, body: validPayload({ honeypot: "bot" }) }));
    assert.equal(allowed.headers["Access-Control-Allow-Origin"], "https://origenescoffee.com");
    const denied = await call(makeReq({ headers: { origin: "https://evil.example" }, body: validPayload({ honeypot: "bot" }) }));
    assert.equal(denied.headers["Access-Control-Allow-Origin"], undefined);
    clearEnv();
  }

  await withFetchMock(async (url, options = {}) => {
    if (options.method === "GET" && String(url).includes("email_normalized=eq.")) {
      return { ok: true, text: async () => "[]" };
    }
    if (options.method === "POST") {
      return { ok: true, text: async () => '[{"id":"lead-1"}]' };
    }
    throw new Error(`unexpected fetch ${options.method} ${url}`);
  }, async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
    const res = await call(makeReq({ ip: "127.0.0.40" }));
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.leadStatus, "accepted");
    clearEnv();
  });

  console.log("leads-http.test.js passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
