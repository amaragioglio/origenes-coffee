const assert = require("node:assert/strict");
const { upsertLead } = require("../api/_lib/supabase");

const config = {
  url: "https://example.supabase.co",
  serviceRoleKey: "test-service-role",
};

function lead(overrides = {}) {
  return {
    email: "valid@example.com",
    email_normalized: "valid@example.com",
    landing_country: "atlas",
    landing_path: "/",
    page_path: "/",
    first_referrer: "direct",
    last_referrer: "direct",
    first_touch: { landing: "/", referrer: "direct" },
    last_touch: { landing: "/", referrer: "direct" },
    marketing_consent: false,
    privacy_acknowledged: true,
    consent_version: "2026-07-17",
    anonymous_session_id: "session-123",
    form_version: "lead-v1",
    idempotency_key: "idempotency-key-1",
    ...overrides,
  };
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
  await withFetchMock(async (url, options = {}) => {
    if (options.method === "GET") {
      return {
        ok: true,
        text: async () => JSON.stringify([{
          id: "lead-1",
          email_normalized: "valid@example.com",
          idempotency_key: "old-key",
          marketing_consent: true,
          last_touch: { utm_source: "old" },
          last_referrer: "https://old.example",
        }]),
      };
    }
    if (options.method === "PATCH") {
      const body = JSON.parse(options.body);
      assert.equal(body.marketing_consent, true);
      assert.deepEqual(body.last_touch, { utm_source: "new" });
      assert.equal(body.last_referrer, "https://old.example");
      return { ok: true, text: async () => '[{"id":"lead-1"}]' };
    }
    throw new Error("unexpected fetch");
  }, async () => {
    const result = await upsertLead(config, lead({ last_touch: { utm_source: "new" }, last_referrer: null }));
    assert.equal(result.leadStatus, "accepted");
  });

  await withFetchMock(async (url, options = {}) => {
    if (options.method === "GET") {
      return {
        ok: true,
        text: async () => JSON.stringify([{
          id: "lead-1",
          email_normalized: "valid@example.com",
          idempotency_key: "old-key",
          marketing_consent: false,
          last_touch: { utm_source: "old" },
          last_referrer: "https://old.example",
        }]),
      };
    }
    if (options.method === "PATCH") {
      const body = JSON.parse(options.body);
      assert.equal(Object.hasOwn(body, "last_touch"), false);
      assert.equal(body.last_referrer, "https://old.example");
      return { ok: true, text: async () => '[{"id":"lead-1"}]' };
    }
    throw new Error("unexpected fetch");
  }, async () => {
    const result = await upsertLead(config, lead({ last_touch: {}, last_referrer: null }));
    assert.equal(result.leadStatus, "accepted");
  });

  await withFetchMock(async (url, options = {}) => {
    if (options.method === "GET" && String(url).includes("email_normalized=eq.")) {
      return { ok: true, text: async () => "[]" };
    }
    if (options.method === "POST") {
      return { ok: false, status: 409, text: async () => '{"code":"23505"}' };
    }
    if (options.method === "GET" && String(url).includes("idempotency_key=eq.")) {
      return { ok: true, text: async () => '[{"id":"lead-1","idempotency_key":"idempotency-key-1"}]' };
    }
    throw new Error(`unexpected fetch ${options.method} ${url}`);
  }, async () => {
    const result = await upsertLead(config, lead());
    assert.equal(result.leadStatus, "duplicate");
  });

  console.log("supabase-upsert.test.js passed");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
