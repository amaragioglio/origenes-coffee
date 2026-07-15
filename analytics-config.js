// ===== Configuración de tracking de ads — Orígenes Coffee =====
// Rellena los IDs cuando existan las cuentas. Con un ID vacío ("") esa
// plataforma NO se carga: cero peticiones de red, cero errores.
const TRACKING = {
  metaPixelId: "",   // Meta/Facebook Pixel, ej. "1234567890"
  googleAdsId: "",   // Google Ads, ej. "AW-XXXXXXXXX"
  ga4Id: "",         // Google Analytics 4, ej. "G-XXXXXXXXXX"
  tiktokPixelId: ""  // TikTok Pixel, ej. "CXXXXXXXXXXXXXXXXX"
};

(function loadPixels() {
  // --- Meta Pixel ---
  if (TRACKING.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', TRACKING.metaPixelId);
    fbq('track', 'PageView');
  }

  // --- gtag (compartido por GA4 y Google Ads) ---
  const gtagId = TRACKING.ga4Id || TRACKING.googleAdsId;
  if (gtagId) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtagId;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    if (TRACKING.ga4Id) gtag('config', TRACKING.ga4Id);
    if (TRACKING.googleAdsId) gtag('config', TRACKING.googleAdsId);
  }

  // --- TikTok Pixel ---
  if (TRACKING.tiktokPixelId) {
    !function (w, d, t) { w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
    ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript";
    o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(o,a)};
    ttq.load(TRACKING.tiktokPixelId);
    ttq.page(); }(window, document, 'ttq');
  }
})();

// Evento de conversión unificado: se llama al capturar un lead.
// Dispara solo en las plataformas configuradas; con todo vacío no hace nada.
window.trackLead = function (pais) {
  try {
    if (TRACKING.metaPixelId && window.fbq) {
      fbq('track', 'Lead', { content_category: pais });
    }
    if ((TRACKING.ga4Id || TRACKING.googleAdsId) && window.gtag) {
      // Nota: para contar conversiones en Google Ads hará falta añadir el
      // 'send_to' con la etiqueta de conversión cuando exista la cuenta.
      gtag('event', 'generate_lead', { origin_country: pais });
    }
    if (TRACKING.tiktokPixelId && window.ttq) {
      ttq.track('SubmitForm', { content_id: pais });
    }
  } catch (e) { /* el tracking nunca debe romper el formulario */ }
};
