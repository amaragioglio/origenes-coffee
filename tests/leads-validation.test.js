const assert = require("node:assert/strict");
const { validatePayload, normalizeEmail } = require("../api/_lib/validation");

const NOW = Date.parse("2026-07-17T18:00:00.000Z");

function validPayload(overrides = {}) {
  return {
    email: "Test@Example.COM ",
    landingCountry: "colombia",
    landingPath: "/colombia",
    pagePath: "/colombia",
    firstTouch: {
      utm_source: "meta",
      landing: "/colombia",
      referrer: "direct",
      capturedAt: "2026-07-17T17:59:00.000Z",
    },
    lastTouch: {
      utm_campaign: "launch",
      landing: "/colombia",
      referrer: "https://example.com",
      capturedAt: "2026-07-17T17:59:20.000Z",
    },
    marketingConsent: false,
    privacyAcknowledged: true,
    consentVersion: "2026-07-17",
    honeypot: "",
    formStartedAt: "2026-07-17T17:59:55.000Z",
    idempotencyKey: "1234567890abcdef",
    anonymousSessionId: "session-123",
    formVersion: "lead-v1",
    ...overrides,
  };
}

function assertInvalid(overrides) {
  const result = validatePayload(validPayload(overrides), NOW);
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.body.error, "invalid_request");
}

{
  const { email, emailNormalized } = normalizeEmail(" Test@Example.COM ");
  assert.equal(email, "Test@Example.COM");
  assert.equal(emailNormalized, "test@example.com");
}

{
  const result = validatePayload(validPayload(), NOW);
  assert.equal(result.ok, true);
  assert.equal(result.honeypot, false);
  assert.equal(result.data.email, "Test@Example.COM");
  assert.equal(result.data.email_normalized, "test@example.com");
  assert.equal(result.data.landing_country, "colombia");
  assert.equal(result.data.marketing_consent, false);
  assert.equal(result.data.privacy_acknowledged, true);
  assert.equal(result.data.first_referrer, "direct");
  assert.equal(result.data.last_referrer, "https://example.com");
}

{
  const result = validatePayload(validPayload({ honeypot: "filled" }), NOW);
  assert.equal(result.ok, true);
  assert.equal(result.honeypot, true);
  assert.equal(result.data, null);
}

{
  const result = validatePayload(validPayload({ formStartedAt: "2026-07-17T17:59:59.000Z" }), NOW);
  assert.equal(result.ok, true);
  assert.equal(result.honeypot, true);
}

assertInvalid({ email: "not-an-email" });
assertInvalid({ landingCountry: "peru" });
assertInvalid({ pagePath: "https://evil.example/colombia" });
assertInvalid({ firstTouch: { extra: "nope" } });
assertInvalid({ marketingConsent: "yes" });
assertInvalid({ privacyAcknowledged: false });
assertInvalid({ consentVersion: "" });
assertInvalid({ idempotencyKey: "short" });
assertInvalid({ idempotencyKey: "1234567890abcdef with spaces" });
assertInvalid({ formVersion: "" });
assertInvalid({ unexpected: "field" });

console.log("leads-validation.test.js passed");
