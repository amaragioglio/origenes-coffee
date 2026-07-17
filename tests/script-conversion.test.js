const assert = require("node:assert/strict");
const fs = require("node:fs");

const script = fs.readFileSync("script.js", "utf8");

assert.match(script, /result\.leadStatus === "accepted" && typeof window\.trackLead === "function"/);
assert.doesNotMatch(script, /result\.ok === true\)\s*\{\s*window\.trackLead/s);

console.log("script-conversion.test.js passed");
