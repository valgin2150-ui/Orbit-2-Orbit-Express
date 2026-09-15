// UTM Link Generator
// Sites: orbit2orbitexpress.com | alginrealestate.com

export function generateUTM(baseUrl, source, medium, campaign) {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

// ─── ORBIT TO ORBIT EXPRESS ──────────────────────────────────────────────────

const O2O_BASE = "https://orbit2orbitexpress.com";

export const O2O_SUBSTACK   = generateUTM(O2O_BASE, "substack",   "newsletter", "orbital_econ");
export const O2O_LINKEDIN   = generateUTM(O2O_BASE, "linkedin",   "social",     "brand");
export const O2O_MEDIUM     = generateUTM(O2O_BASE, "medium",     "content",    "orbital_econ");
export const O2O_FACEBOOK   = generateUTM(O2O_BASE, "facebook",   "social",     "brand");
export const O2O_X          = generateUTM(O2O_BASE, "x",          "social",     "brand");
export const O2O_INSTAGRAM  = generateUTM(O2O_BASE, "instagram",  "social",     "brand");
export const O2O_TIKTOK     = generateUTM(O2O_BASE, "tiktok",     "social",     "brand");
export const O2O_CROSSLINK  = generateUTM(O2O_BASE, "internal",   "referral",   "cross");

// ─── ALGIN REAL ESTATE ───────────────────────────────────────────────────────

const ALGIN_BASE = "https://alginrealestate.com";

export const ALGIN_SUBSTACK   = generateUTM(ALGIN_BASE, "substack",   "newsletter", "orbital_econ");
export const ALGIN_LINKEDIN   = generateUTM(ALGIN_BASE, "linkedin",   "social",     "brand");
export const ALGIN_MEDIUM     = generateUTM(ALGIN_BASE, "medium",     "content",    "orbital_econ");
export const ALGIN_FACEBOOK   = generateUTM(ALGIN_BASE, "facebook",   "social",     "brand");
export const ALGIN_X          = generateUTM(ALGIN_BASE, "x",          "social",     "brand");
export const ALGIN_INSTAGRAM  = generateUTM(ALGIN_BASE, "instagram",  "social",     "brand");
export const ALGIN_TIKTOK     = generateUTM(ALGIN_BASE, "tiktok",     "social",     "brand");
export const ALGIN_CROSSLINK  = generateUTM(ALGIN_BASE, "internal",   "referral",   "cross");
