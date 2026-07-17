// ===== Barra superior: fondo al hacer scroll =====
const topbar = document.getElementById("topbar");

function updateTopbar() {
  topbar.classList.toggle("scrolled", window.scrollY > 40);
}

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

// ===== Menú móvil =====
const navToggle = document.getElementById("navToggle");
const topnav = document.getElementById("topnav");

navToggle.addEventListener("click", () => {
  const open = topnav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
  if (open) topbar.classList.add("scrolled");
  else updateTopbar();
});

topnav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    topnav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    updateTopbar();
  });
});

// ===== Aparición suave al hacer scroll =====
const revealTargets = document.querySelectorAll(
  ".reveal, .atlas-row, .interlude, .pullquote, .facts, .feature-head .container, .article .narrow"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

revealTargets.forEach((el) => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});

// ===== Parallax sutil del hero (páginas de país) =====
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const featureHero = document.getElementById("featureHero");

if (featureHero && !reducedMotion) {
  const heroImg = featureHero.querySelector("img");
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, featureHero.offsetHeight);
        heroImg.style.transform = `translateY(${y * 0.18}px)`;
        ticking = false;
      });
    },
    { passive: true }
  );
}

// ===== Barra de progreso de lectura =====
const progressBar = document.getElementById("progressBar");

if (progressBar) {
  window.addEventListener(
    "scroll",
    () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = `${(window.scrollY / total) * 100}%`;
    },
    { passive: true }
  );
}

// ===== CTA fijo móvil: aparece durante el artículo, se oculta en el formulario =====
const stickyCta = document.getElementById("stickyCta");
const leadBlock = document.getElementById("unete");

if (stickyCta && leadBlock) {
  let nearForm = false;

  const formObserver = new IntersectionObserver(
    (entries) => {
      nearForm = entries[0].isIntersecting;
      updateCta();
    },
    { threshold: 0.1 }
  );
  formObserver.observe(leadBlock);

  function updateCta() {
    const pastHero = window.scrollY > window.innerHeight * 0.9;
    stickyCta.classList.toggle("show", pastHero && !nearForm);
  }

  window.addEventListener("scroll", updateCta, { passive: true });
}

// ===== Atribucion y captura de leads =====
const LEAD_FORM_VERSION = "lead-v1";
const LEAD_CONSENT_VERSION = "2026-07-17";
const ATTRIBUTION_KEY = "oc_attribution_v1";
const SESSION_KEY = "oc_anonymous_session_id";
const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ttclid",
];

function safeParseJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return null;
  }
}

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    // El formulario sigue funcionando sin almacenamiento local.
  }
}

function randomId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function currentPath() {
  const path = window.location.pathname || "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function limitValue(value) {
  return String(value || "").slice(0, 512);
}

function campaignParams() {
  const params = new URLSearchParams(window.location.search);
  const found = {};
  ATTRIBUTION_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 512);
  });
  return found;
}

function touchSnapshot() {
  return {
    ...campaignParams(),
    landing: limitValue(currentPath()),
    referrer: limitValue(document.referrer || "direct"),
    capturedAt: new Date().toISOString(),
  };
}

function attributionState() {
  const now = Date.now();
  const stored = safeParseJson(storageGet(ATTRIBUTION_KEY));
  const expired = !stored || !stored.expiresAt || stored.expiresAt < now;
  const snapshot = touchSnapshot();
  const next = expired
    ? { firstTouch: snapshot, lastTouch: snapshot, expiresAt: now + ATTRIBUTION_TTL_MS }
    : { ...stored, lastTouch: snapshot, expiresAt: now + ATTRIBUTION_TTL_MS };
  storageSet(ATTRIBUTION_KEY, JSON.stringify(next));
  return next;
}

function anonymousSessionId() {
  const stored = storageGet(SESSION_KEY);
  if (stored) return stored;
  const created = randomId("session");
  storageSet(SESSION_KEY, created);
  return created;
}

const leadForm = document.getElementById("leadForm");

if (leadForm) {
  const button = leadForm.querySelector("button[type=submit]");
  const emailInput = leadForm.querySelector("input[name=email]");
  const honeypotInput = leadForm.querySelector("input[name=_gotcha]");
  const privacyInput = leadForm.querySelector("input[name=privacyAcknowledged]");
  const marketingInput = leadForm.querySelector("input[name=marketingConsent]");
  const errorMessage = leadForm.querySelector(".lead-error");
  const formStartedAt = new Date().toISOString();
  const initialButtonText = button ? button.textContent : "I want in";
  const attribution = attributionState();
  const sessionId = anonymousSessionId();

  function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function hideError() {
    if (errorMessage) errorMessage.hidden = true;
  }

  function showSuccess() {
    leadForm.innerHTML =
      '<p class="lead-success">Gracias. Estas en la lista. Te llegara la primera historia muy pronto.</p>';
  }

  function setLoading(isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.textContent = isLoading ? "Enviando..." : initialButtonText;
  }

  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    if (!emailInput || !button) return;
    if (!leadForm.reportValidity()) return;

    const payload = {
      email: emailInput.value.trim(),
      landingCountry: leadForm.dataset.origen || "atlas",
      landingPath: attribution.firstTouch && attribution.firstTouch.landing ? attribution.firstTouch.landing : currentPath(),
      pagePath: currentPath(),
      firstTouch: attribution.firstTouch || {},
      lastTouch: touchSnapshot(),
      marketingConsent: Boolean(marketingInput && marketingInput.checked),
      privacyAcknowledged: Boolean(privacyInput && privacyInput.checked),
      consentVersion: LEAD_CONSENT_VERSION,
      honeypot: honeypotInput ? honeypotInput.value : "",
      formStartedAt,
      idempotencyKey: randomId("lead"),
      anonymousSessionId: sessionId,
      formVersion: LEAD_FORM_VERSION,
    };

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.ok !== true) {
        throw new Error(result.error || `lead_capture_${res.status}`);
      }

      showSuccess();
      if (result.leadStatus === "accepted" && typeof window.trackLead === "function") {
        window.trackLead(leadForm.dataset.origen || "atlas");
      }
    } catch (err) {
      setLoading(false);
      showError("No pudimos guardar tu email. Intentalo de nuevo.");
    }
  });
}

// ===== Video: reproducir solo en pantalla (y nunca con movimiento reducido) =====
const filmVideo = document.getElementById("filmVideo");

if (filmVideo && !reducedMotion) {
  const filmObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) filmVideo.play().catch(() => {});
        else filmVideo.pause();
      });
    },
    { threshold: 0.35 }
  );
  filmObserver.observe(filmVideo);
}

// ===== Año del pie =====
document.getElementById("year").textContent = new Date().getFullYear();
