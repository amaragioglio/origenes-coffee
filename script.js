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

// ===== Captura de leads (Formspree) =====
// Configuración: crea un formulario gratis en https://formspree.io con tu
// correo, copia el ID (la parte final de https://formspree.io/f/XXXXXXXX)
// y pégalo aquí. Mientras el ID sea el placeholder, el formulario usa un
// mailto como respaldo para no perder ningún lead.
const FORMSPREE_ID = "TU_ID_AQUI";

const leadForm = document.getElementById("leadForm");

if (leadForm) {
  const button = leadForm.querySelector("button");
  const emailInput = leadForm.querySelector("input[name=email]");

  function showSuccess() {
    leadForm.innerHTML =
      '<p class="lead-success">¡Gracias! Estás en la lista. ' +
      "Te llegará la primera historia muy pronto. ☕</p>";
  }

  function mailtoFallback(email) {
    const subject = encodeURIComponent("Join la lista — Orígenes Coffee");
    const body = encodeURIComponent(
      `I want in!\n\nMy email: ${email}\nMy origin (country): ${leadForm.dataset.origen || ""}`
    );
    window.location.href = `mailto:andresmaragiogliop@gmail.com?subject=${subject}&body=${body}`;
    button.textContent = "¡Gracias!";
    setTimeout(() => (button.textContent = "I want in"), 4000);
  }

  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (FORMSPREE_ID === "TU_ID_AQUI") {
      mailtoFallback(email);
      return;
    }

    button.disabled = true;
    button.textContent = "Enviando…";

    try {
      const data = new FormData(leadForm);
      data.append("origen", leadForm.dataset.origen || "atlas");
      data.append("pagina", window.location.pathname);
      data.append("_subject", "Nuevo lead — Orígenes Coffee");

      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        showSuccess();
      } else {
        throw new Error(`Formspree ${res.status}`);
      }
    } catch (err) {
      button.disabled = false;
      button.textContent = "I want in";
      mailtoFallback(email);
    }
  });
}

// ===== Año del pie =====
document.getElementById("year").textContent = new Date().getFullYear();
