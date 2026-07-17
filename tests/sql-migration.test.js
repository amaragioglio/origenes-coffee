const assert = require("node:assert/strict");
const fs = require("node:fs");

const sql = fs.readFileSync("supabase/migrations/001_create_leads.sql", "utf8");

assert.match(sql, /constraint leads_privacy_acknowledged_true check \(privacy_acknowledged is true\)/);
assert.match(sql, /constraint leads_idempotency_key_shape check/);
assert.match(sql, /create unique index if not exists leads_idempotency_key_unique_idx/);
assert.match(sql, /where idempotency_key is not null/);

console.log("sql-migration.test.js passed");
