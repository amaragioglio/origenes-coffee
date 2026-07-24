function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceRoleKey) {
    return null;
  }
  return { url, serviceRoleKey };
}

function headers(config, extra = {}) {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function request(config, path, options = {}) {
  const res = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: headers(config, options.headers),
  });
  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (err) {
      body = text;
    }
  }
  if (!res.ok) {
    const error = new Error("supabase_request_failed");
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function findLeadByEmail(config, emailNormalized) {
  const query = `leads?select=id,idempotency_key,email_normalized,marketing_consent,last_touch,last_referrer&email_normalized=eq.${encodeURIComponent(emailNormalized)}&limit=1`;
  const rows = await request(config, query, { method: "GET" });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function findLeadByIdempotencyKey(config, idempotencyKey) {
  const query = `leads?select=id,idempotency_key,email_normalized&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&limit=1`;
  const rows = await request(config, query, { method: "GET" });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function insertLead(config, lead) {
  const rows = await request(config, "leads?select=id,created_at,updated_at", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(lead),
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

function hasUsefulTouch(touch) {
  return touch && typeof touch === "object" && !Array.isArray(touch) && Object.keys(touch).length > 0;
}

async function updateLead(config, emailNormalized, lead, existing = {}) {
  const update = {
    email: lead.email,
    page_path: lead.page_path,
    last_referrer: lead.last_referrer || existing.last_referrer || null,
    marketing_consent: Boolean(existing.marketing_consent || lead.marketing_consent),
    privacy_acknowledged: lead.privacy_acknowledged,
    consent_version: lead.consent_version,
    anonymous_session_id: lead.anonymous_session_id,
    form_version: lead.form_version,
    idempotency_key: lead.idempotency_key,
  };
  if (hasUsefulTouch(lead.last_touch)) {
    update.last_touch = lead.last_touch;
  }
  const rows = await request(config, `leads?email_normalized=eq.${encodeURIComponent(emailNormalized)}&select=id,created_at,updated_at`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(update),
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function upsertLead(config, lead) {
  const existing = await findLeadByEmail(config, lead.email_normalized);
  if (existing && existing.idempotency_key === lead.idempotency_key) {
    return { leadStatus: "duplicate", idempotent: true };
  }
  if (existing) {
    const row = await updateLead(config, lead.email_normalized, lead, existing);
    return { leadStatus: "accepted", updated: true, row };
  }
  try {
    const row = await insertLead(config, lead);
    return { leadStatus: "accepted", created: true, row };
  } catch (err) {
    if (err.status === 409) {
      const duplicate = await findLeadByIdempotencyKey(config, lead.idempotency_key);
      if (duplicate) {
        return { leadStatus: "duplicate", idempotent: true };
      }
      const concurrent = await findLeadByEmail(config, lead.email_normalized);
      if (concurrent) {
        const row = await updateLead(config, lead.email_normalized, lead, concurrent);
        return { leadStatus: "accepted", updated: true, row };
      }
    }
    throw err;
  }
}

module.exports = {
  getSupabaseConfig,
  hasUsefulTouch,
  upsertLead,
};
