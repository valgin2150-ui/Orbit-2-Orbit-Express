// Plausible custom event tracking for alginrealestate.com
// Paste this file into your site, or copy the relevant snippets
// into each element directly.
//
// Prerequisite: Plausible script must already be in <head>:
//   <script defer data-domain="alginrealestate.com"
//           src="https://plausible.io/js/script.manual.outbound-links.js"></script>
//   <script>
//     window.plausible = window.plausible ||
//       function() { (window.plausible.q = window.plausible.q || []).push(arguments) }
//   </script>

// ─── 1. Contact form submit ───────────────────────────────────────────────────
// Add to your contact form's submit handler, after a successful POST:
//
//   form.addEventListener("submit", async function (e) {
//     e.preventDefault();
//     const res = await fetch("/api/contact", { method: "POST", body: ... });
//     if (res.ok) {
//       plausible("Contact Submit");   // <-- fire here
//       showSuccessMessage();
//     }
//   });
//
// Or if your form is React-based, call it after the awaited API request succeeds:
//   window.plausible?.("Contact Submit");

// ─── 2. Market report download ────────────────────────────────────────────────
// Add onclick to every download button / link:
//
//   <a href="/reports/market-report-2026.pdf"
//      download
//      onclick="plausible('Report Download')">
//     Download Market Report
//   </a>
//
// Or in JS/React:
//   <button onClick={() => {
//     window.plausible?.("Report Download");
//     window.open("/reports/market-report-2026.pdf");
//   }}>
//     Download Market Report
//   </button>

// ─── 3. Expired listings CTA click ───────────────────────────────────────────
// Add onclick to each expired-listings CTA button / link:
//
//   <a href="/expired-listings"
//      onclick="plausible('Expired CTA Click')">
//     See Expired Listings
//   </a>
//
// Or in JS/React:
//   <button onClick={() => {
//     window.plausible?.("Expired CTA Click");
//     router.push("/expired-listings");
//   }}>
//     See Expired Listings
//   </button>

// ─── Generic helper (optional) ────────────────────────────────────────────────
// Use this anywhere to fire a named Plausible event safely:
function trackEvent(eventName, props) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(eventName, props ? { props } : undefined);
  }
}

// Usage:
//   trackEvent("Contact Submit");
//   trackEvent("Report Download", { report: "2026 Market Report" });
//   trackEvent("Expired CTA Click", { location: "hero" });
