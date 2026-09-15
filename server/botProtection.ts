import { BlockList } from "node:net";
import { lookup, reverse } from "node:dns/promises";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export type MachineAccessClassification =
  | "verified-crawler"
  | "normal-browser"
  | "unverified-automation";

type CrawlerIdentity = "Googlebot" | "Bingbot" | "OAI-SearchBot";
type Verification = { verified: boolean; identity?: CrawlerIdentity };
type RateBucket = "static" | "html" | "read-api" | "write" | "expensive-write" | "telemetry-write";
type Report = {
  startTimestamp: string;
  classifications: Record<MachineAccessClassification, number>;
  responseStatuses: Record<string, number>;
  topRoutes: Array<{ route: string; count: number }>;
  blockedCount: number;
  rateLimitedCount: number;
};

/** Bounded least-recently-used hit storage used by the in-process limiter. */
export class BoundedHitLog {
  private readonly entries = new Map<string, number[]>();
  constructor(readonly capacity: number) {}
  hit(key: string, now: number, windowMs: number, maximum: number): boolean {
    const current = (this.entries.get(key) || []).filter((time) => now - time < windowMs);
    if (this.entries.has(key)) this.entries.delete(key);
    else if (this.entries.size >= this.capacity) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    current.push(now);
    this.entries.set(key, current);
    return current.length > maximum;
  }
  prune(now: number, windowMs: number): void {
    for (const [key, values] of this.entries) {
      const fresh = values.filter((time) => now - time < windowMs);
      if (fresh.length) this.entries.set(key, fresh);
      else this.entries.delete(key);
    }
  }
  clear(): void { this.entries.clear(); }
  get size(): number { return this.entries.size; }
}

const MALICIOUS_TOOLS = /\b(sqlmap|nikto|nuclei|masscan|nmap|dirbuster|metasploit)\b/i;
const SENSITIVE_PATH_PROBE = /(?:^|\/)(?:\.env(?:[./]|$)|\.git(?:[./]|$)|phpinfo(?:\.php)?$|(?:gcp|google|firebase|service-account|application_default)_?(?:key|credentials)?\.json$|credentials\.json$)/i;
const AUTOMATION_UA = /\b(bot|crawler|spider|scraper|slurp|headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|python-requests|python-urllib|go-http-client|curl\/|wget\/|axios\/|node-fetch|httpx\/|postmanruntime|insomnia)\b/i;
const BROWSER_UA = /\b(mozilla\/|chrome\/|safari\/|firefox\/|edg\/|opera\/)/i;
const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const WINDOW_MS = 5 * 60 * 1000;
const MAX_HIT_KEYS = 10_000;
const MAX_VERIFICATION_ENTRIES = 10_000;
const MAX_CONCURRENT_VERIFICATIONS = 20;
const MAX_ROUTE_LABELS = 500;
const hits = new BoundedHitLog(MAX_HIT_KEYS);
const verificationCache = new Map<string, { value: Verification; expires: number }>();
let oaiRanges: { list: BlockList; expires: number } | undefined;
let oaiRangeFetch: Promise<BlockList | undefined> | undefined;
let activeVerifications = 0;

const reportStart = new Date().toISOString();
const classifications: Record<MachineAccessClassification, number> = {
  "verified-crawler": 0, "normal-browser": 0, "unverified-automation": 0,
};
const responseStatuses = new Map<string, number>();
const routes = new Map<string, number>();
let blockedCount = 0;
let rateLimitedCount = 0;
let sampledAutomationSuccesses = 0;
const LOG_WINDOW_MS = 60_000;
const MAX_LOGS_PER_WINDOW = 120;
let logWindowStarted = Date.now();
let emittedLogs = 0;
let suppressedLogs = 0;

function pruneBoundedState(): void {
  const now = Date.now();
  hits.prune(now, WINDOW_MS);
  for (const [key, entry] of verificationCache) {
    if (entry.expires <= now) verificationCache.delete(key);
  }
}
const statePruner = setInterval(pruneBoundedState, WINDOW_MS);
statePruner.unref();

function normalizedIp(ip: string): string {
  return ip.replace(/^::ffff:/i, "");
}

function getClientIp(req: Request): string {
  if (req.ip) return normalizedIp(req.ip);
  const cf = req.headers["cf-connecting-ip"];
  if (typeof cf === "string" && cf) return normalizedIp(cf);
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return normalizedIp(value?.split(",")[0].trim() || req.socket.remoteAddress || "unknown");
}

function claimedIdentity(ua: string): CrawlerIdentity | undefined {
  if (/googlebot/i.test(ua)) return "Googlebot";
  if (/bingbot/i.test(ua)) return "Bingbot";
  if (/oai-searchbot/i.test(ua)) return "OAI-SearchBot";
  return undefined;
}

function hasTrustedSuffix(hostname: string, suffixes: string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return suffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

async function within<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Crawler verification timed out")), milliseconds);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function verifyReverseDns(ip: string, suffixes: string[]): Promise<boolean> {
  try {
    const hostnames = await within(reverse(ip), 1_500);
    for (const hostname of hostnames) {
      if (!hasTrustedSuffix(hostname, suffixes)) continue;
      const addresses = await within(lookup(hostname, { all: true }), 1_500);
      if (addresses.some((address) => normalizedIp(address.address) === normalizedIp(ip))) return true;
    }
  } catch {
    // DNS failure intentionally leaves a claimed crawler unverified.
  }
  return false;
}

async function getOaiBlockList(): Promise<BlockList | undefined> {
  if (oaiRanges && oaiRanges.expires > Date.now()) return oaiRanges.list;
  if (!oaiRangeFetch) {
    oaiRangeFetch = (async () => {
      try {
        const response = await fetch("https://openai.com/searchbot.json", {
          signal: AbortSignal.timeout(2_500),
        });
        if (!response.ok) return undefined;
        const list = createOaiSearchBotBlockList(await response.json());
        oaiRanges = { list, expires: Date.now() + 6 * 60 * 60 * 1000 };
        return list;
      } catch {
        return undefined;
      } finally {
        oaiRangeFetch = undefined;
      }
    })();
  }
  return oaiRangeFetch;
}

/** Parses OpenAI's published SearchBot prefix document without hardcoding ranges. */
export function createOaiSearchBotBlockList(data: unknown): BlockList {
  const entries = Array.isArray(data) ? data : Array.isArray((data as { prefixes?: unknown })?.prefixes)
    ? (data as { prefixes: unknown[] }).prefixes : [];
  const list = new BlockList();
  for (const entry of entries) {
    const prefix = entry as { ipv4Prefix?: unknown; ipv6Prefix?: unknown; ip_prefix?: unknown };
    const values: unknown[] = typeof entry === "string" ? [entry] : [prefix.ipv4Prefix, prefix.ipv6Prefix, prefix.ip_prefix];
    for (const cidr of values) {
      if (typeof cidr !== "string") continue;
      const [network, length] = cidr.split("/");
      try {
        if (network && length && /^\d+$/.test(length)) {
          list.addSubnet(network, Number(length), network.includes(":") ? "ipv6" : "ipv4");
        }
      } catch {
        // A malformed entry must not make access control fail open or crash.
      }
    }
  }
  return list;
}

async function verifyClaim(identity: CrawlerIdentity | undefined, ip: string): Promise<Verification> {
  if (!identity || !ip || ip === "unknown") return { verified: false };
  const key = `${identity}:${ip}`;
  const cached = verificationCache.get(key);
  if (cached && cached.expires > Date.now()) {
    verificationCache.delete(key);
    verificationCache.set(key, cached);
    return cached.value;
  }
  if (activeVerifications >= MAX_CONCURRENT_VERIFICATIONS) return { verified: false };
  activeVerifications++;
  try {
    let verified = false;
    if (identity === "Googlebot") verified = await verifyReverseDns(ip, ["googlebot.com", "google.com"]);
    else if (identity === "Bingbot") verified = await verifyReverseDns(ip, ["search.msn.com"]);
    else {
      const list = await getOaiBlockList();
      try {
        verified = Boolean(list?.check(normalizedIp(ip), normalizedIp(ip).includes(":") ? "ipv6" : "ipv4"));
      } catch {
        verified = false;
      }
    }
    const value = verified ? { verified: true, identity } : { verified: false };
    if (!verificationCache.has(key) && verificationCache.size >= MAX_VERIFICATION_ENTRIES) {
      const oldest = verificationCache.keys().next().value;
      if (oldest !== undefined) verificationCache.delete(oldest);
    }
    verificationCache.set(key, { value, expires: Date.now() + (verified ? 60 : 10) * 60 * 1000 });
    return value;
  } finally {
    activeVerifications--;
  }
}

const EXPENSIVE_WRITE_PATHS = new Set([
  "/api/missions",
  "/api/yeets",
  "/api/company-suggestions",
  "/api/inquiry",
  "/api/privacy-request",
  "/api/download-report",
  "/api/lead-capture",
  "/api/mission-intake",
  "/api/campaign-lead",
]);

function bucketFor(req: Request): RateBucket {
  if (req.path.startsWith("/assets/") || /\.(?:js|css|map|png|jpe?g|svg|ico|woff2?)$/i.test(req.path)) return "static";
  if (req.path.startsWith("/api/") && READ_METHODS.has(req.method)) return "read-api";
  if (!READ_METHODS.has(req.method) && req.path === "/api/track") return "telemetry-write";
  if (!READ_METHODS.has(req.method) && EXPENSIVE_WRITE_PATHS.has(req.path)) return "expensive-write";
  if (req.path.startsWith("/api/") || !READ_METHODS.has(req.method)) return "write";
  return "html";
}

function limited(ip: string, bucket: RateBucket, automation: boolean): boolean {
  if (!ip || ip === "unknown") return false;
  const normalLimits: Record<RateBucket, number> = {
    static: 600,
    html: 240,
    "read-api": 180,
    write: 60,
    "expensive-write": 5,
    "telemetry-write": 120,
  };
  const automationLimits: Record<RateBucket, number> = {
    static: 200,
    html: 80,
    "read-api": 60,
    write: 20,
    "expensive-write": 5,
    "telemetry-write": 60,
  };
  const max = (automation ? automationLimits : normalLimits)[bucket];
  const key = `${ip}:${bucket}`;
  return hits.hit(key, Date.now(), WINDOW_MS, max);
}

function uaSummary(ua: string): string {
  return ua.replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").slice(0, 120) || "missing";
}

function routeLabel(path: string): string {
  return path.replace(/[\r\n\t]/g, "").slice(0, 160) || "/";
}

// Origin/fetch metadata is defense-in-depth, not proof of a browser.
function hasMatchingSameOriginMetadata(req: Request): boolean {
  const origin = req.headers.origin;
  const site = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  if (typeof origin !== "string" || !["same-origin", "same-site"].includes(site)) return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === `${req.protocol}:` && parsed.host.toLowerCase() === String(req.headers.host || "").toLowerCase();
  } catch {
    return false;
  }
}

const WRITE_PERMIT_COOKIE = "machine_write_permit";
const WRITE_PERMIT_SECONDS = 60 * 60;

function signPermit(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function issueWritePermit(res: Response, secret: string): void {
  const payload = String(Date.now() + WRITE_PERMIT_SECONDS * 1000);
  const value = `${payload}.${signPermit(payload, secret)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.append("Set-Cookie", `${WRITE_PERMIT_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${WRITE_PERMIT_SECONDS}${secure}`);
}

function hasValidWritePermit(req: Request, secret: string): boolean {
  const cookies = String(req.headers.cookie || "").split(";");
  const value = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${WRITE_PERMIT_COOKIE}=`))?.slice(WRITE_PERMIT_COOKIE.length + 1);
  if (!value) return false;
  const [payload, signature, extra] = value.split(".");
  const now = Date.now();
  const expiry = Number(payload);
  if (!payload || !signature || extra || !/^\d+$/.test(payload) || expiry <= now || expiry > now + WRITE_PERMIT_SECONDS * 1000) return false;
  const expected = Buffer.from(signPermit(payload, secret));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function emitBoundedLog(record: Record<string, unknown>): void {
  const now = Date.now();
  if (now - logWindowStarted >= LOG_WINDOW_MS) {
    logWindowStarted = now;
    emittedLogs = 0;
    if (suppressedLogs > 0) {
      console.info(JSON.stringify({ event: "machine-access-log-suppression", timestamp: new Date().toISOString(), suppressedCount: suppressedLogs }));
      emittedLogs++;
      suppressedLogs = 0;
    }
  }
  if (emittedLogs >= MAX_LOGS_PER_WINDOW) {
    suppressedLogs++;
    return;
  }
  console.info(JSON.stringify(record));
  emittedLogs++;
}

export function getMachineAccessReport(): Report {
  return {
    startTimestamp: reportStart,
    classifications: { ...classifications },
    responseStatuses: Object.fromEntries(responseStatuses),
    topRoutes: [...routes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([route, count]) => ({ route, count })),
    blockedCount, rateLimitedCount,
  };
}

/** Test-only reset; production telemetry remains process-lifetime aggregate. */
export function resetMachineAccessReportForTests(): void {
  for (const key of Object.keys(classifications) as MachineAccessClassification[]) classifications[key] = 0;
  responseStatuses.clear(); routes.clear(); hits.clear(); verificationCache.clear();
  blockedCount = 0; rateLimitedCount = 0; sampledAutomationSuccesses = 0;
}

export async function botProtectionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const started = Date.now();
  const ua = String(req.headers["user-agent"] || "");
  const ip = getClientIp(req);
  const country = String(req.headers["cf-ipcountry"] || "").toUpperCase();
  const claimed = claimedIdentity(ua);
  const verification = await verifyClaim(claimed, ip);
  let wasBlocked = false;
  const classification: MachineAccessClassification = verification.verified
    ? "verified-crawler"
    : BROWSER_UA.test(ua) && !AUTOMATION_UA.test(ua) ? "normal-browser" : "unverified-automation";

  res.on("finish", () => {
    classifications[classification]++;
    responseStatuses.set(String(res.statusCode), (responseStatuses.get(String(res.statusCode)) || 0) + 1);
    const route = routeLabel(req.path);
    if (routes.has(route) || routes.size < MAX_ROUTE_LABELS) routes.set(route, (routes.get(route) || 0) + 1);
    else routes.set("<other>", (routes.get("<other>") || 0) + 1);
    const shouldLog = Boolean(claimed) || verification.verified || wasBlocked || res.statusCode === 429
      || (classification === "unverified-automation" && ++sampledAutomationSuccesses % 100 === 0);
    if (shouldLog) {
      emitBoundedLog({
        event: "machine-access", timestamp: new Date().toISOString(), route, method: req.method,
        status: res.statusCode, ua: uaSummary(ua), claimedIdentity: claimed || null,
        verifiedIdentity: verification.identity || null, classification, country: country || null,
        durationMs: Date.now() - started,
      });
    }
  });

  if (MALICIOUS_TOOLS.test(ua) || SENSITIVE_PATH_PROBE.test(req.path)) {
    wasBlocked = true;
    blockedCount++;
    res.status(403).send("Forbidden");
    return;
  }
  const bucket = bucketFor(req);
  if (limited(
    ip,
    bucket,
    classification === "unverified-automation" || bucket === "write",
  )) {
    rateLimitedCount++;
    res.setHeader("Retry-After", String(Math.ceil(WINDOW_MS / 1000)));
    res.status(429).send("Too Many Requests");
    return;
  }
  // Country is intentionally only a log/risk signal; it never makes an access decision.
  if (!READ_METHODS.has(req.method)) {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      wasBlocked = true;
      blockedCount++;
      res.status(503).send("Write access temporarily unavailable");
      return;
    }
    if (!hasMatchingSameOriginMetadata(req) || !hasValidWritePermit(req, secret)) {
      wasBlocked = true;
      blockedCount++;
      res.status(403).send("Forbidden");
      return;
    }
  }
  if (req.method === "GET" && bucket === "html" && classification === "normal-browser"
      && String(req.headers.accept || "").toLowerCase().includes("text/html") && process.env.SESSION_SECRET) {
    issueWritePermit(res, process.env.SESSION_SECRET);
  }
  next();
}