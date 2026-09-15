import fs from "fs";
import path from "path";
import { getUncachableResendClient } from "./resend";

interface PageView {
  path: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
  ip: string;
}

interface DailyStats {
  date: string;
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  viewsByHour: number[];
  botBlockedCount: number;
}

const STORE_FILE = path.resolve("./analytics-store.json");
const MAX_STORED_VIEWS = 10000;

const BOT_UA_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /slurp/i,
  /googlebot/i, /bingbot/i, /baiduspider/i, /yandexbot/i,
  /duckduckbot/i, /facebookexternalhit/i, /twitterbot/i,
  /linkedinbot/i, /whatsapp/i, /telegrambot/i, /applebot/i,
  /semrushbot/i, /ahrefsbot/i, /mj12bot/i, /dotbot/i,
  /rogerbot/i, /exabot/i, /seznambot/i, /sogou/i, /360spider/i,
  /headlesschrome/i, /phantomjs/i, /puppeteer/i, /playwright/i,
  /selenium/i, /webdriver/i, /slimerjs/i,
  /python-requests/i, /python-urllib/i, /go-http-client/i,
  /java\/\d/i, /curl\//i, /wget\//i, /axios\//i, /got\//i,
  /node-fetch/i, /node\.js/i, /http\.rb/i, /ruby/i,
  /uptimerobot/i, /pingdom/i, /gtmetrix/i, /statuscake/i,
  /site24x7/i, /newrelic/i, /datadog/i, /nagios/i,
  /archive\.org/i, /ia_archiver/i, /wayback/i,
  /prerender/i, /rendertron/i, /fetch\//i,
];

function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent === "unknown") return true;
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

const ipHitLog = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_HITS = 60;

function isRateLimited(ip: string, now: number): boolean {
  if (ip === "unknown") return false;
  const hits = (ipHitLog.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipHitLog.set(ip, hits);
  return hits.length > RATE_MAX_HITS;
}

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, hits] of ipHitLog.entries()) {
    const fresh = hits.filter((t) => t > cutoff);
    if (fresh.length === 0) ipHitLog.delete(ip);
    else ipHitLog.set(ip, fresh);
  }
}, 5 * 60 * 1000);

function loadFromDisk(): PageView[] {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        console.log(`[ANALYTICS] Loaded ${parsed.length} page views from disk`);
        return parsed;
      }
    }
  } catch (err) {
    console.error("[ANALYTICS] Failed to load analytics store from disk:", err);
  }
  return [];
}

const pageViews: PageView[] = loadFromDisk();
let botBlockedToday = 0;
let rateLimitedToday = 0;

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveToDisk() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(pageViews), "utf8");
    } catch (err) {
      console.error("[ANALYTICS] Failed to persist analytics store:", err);
    }
  }, 2000);
}

export function trackPageView(view: Omit<PageView, "timestamp">): { ok: boolean; reason?: string } {
  if (isBot(view.userAgent)) {
    botBlockedToday++;
    return { ok: false, reason: "bot" };
  }
  const now = Date.now();
  if (isRateLimited(view.ip, now)) {
    rateLimitedToday++;
    return { ok: false, reason: "rate-limited" };
  }
  pageViews.push({ ...view, timestamp: now });
  if (pageViews.length > MAX_STORED_VIEWS) {
    pageViews.splice(0, pageViews.length - MAX_STORED_VIEWS);
  }
  saveToDisk();
  return { ok: true };
}

function getStatsForDate(targetDate: string): DailyStats {
  const dayStart = new Date(targetDate + "T00:00:00Z").getTime();
  const dayEnd = new Date(targetDate + "T23:59:59.999Z").getTime();

  const dayViews = pageViews.filter(
    (v) => v.timestamp >= dayStart && v.timestamp <= dayEnd
  );

  const uniqueIPs = new Set(dayViews.map((v) => v.ip));

  const pageCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};
  const viewsByHour = new Array(24).fill(0);

  for (const view of dayViews) {
    pageCounts[view.path] = (pageCounts[view.path] || 0) + 1;
    const ref = view.referrer || "Direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    const hour = new Date(view.timestamp).getUTCHours();
    viewsByHour[hour]++;
  }

  const topPages = Object.entries(pageCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const topReferrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    date: targetDate,
    totalViews: dayViews.length,
    uniqueVisitors: uniqueIPs.size,
    topPages,
    topReferrers,
    viewsByHour,
    botBlockedCount: botBlockedToday + rateLimitedToday,
  };
}

function generateEmailHTML(stats: DailyStats): string {
  const pageRows = stats.topPages
    .map(
      (p) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-family:monospace">${p.path}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${p.views}</td></tr>`
    )
    .join("");

  const referrerRows = stats.topReferrers
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${r.referrer}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${r.count}</td></tr>`
    )
    .join("");

  const maxHourViews = Math.max(...stats.viewsByHour, 1);
  const hourBars = stats.viewsByHour
    .map((count, hour) => {
      const pct = Math.round((count / maxHourViews) * 100);
      return `<div style="display:flex;align-items:center;gap:8px;margin:2px 0"><span style="width:30px;font-size:11px;color:#666;text-align:right">${hour}:00</span><div style="background:#e3000f;height:14px;width:${pct}%;min-width:${count > 0 ? 2 : 0}px;border-radius:2px"></div><span style="font-size:11px;color:#999">${count}</span></div>`;
    })
    .join("");

  const botNote = stats.botBlockedCount > 0
    ? `<p style="margin:12px 0 0;font-size:12px;color:#999;text-align:center">🤖 ${stats.botBlockedCount.toLocaleString()} bot/automated requests filtered out — not included in counts above.</p>`
    : "";

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#1a1a1a;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Orbit to Orbit Express</h1>
        <p style="color:#e3000f;margin:4px 0 0;font-size:14px">Daily Visitor Report — ${stats.date}</p>
      </div>

      <div style="padding:24px">
        <div style="display:flex;gap:16px;margin-bottom:24px">
          <div style="flex:1;background:#f8f8f8;padding:20px;text-align:center;border-left:3px solid #e3000f">
            <div style="font-size:32px;font-weight:bold;color:#1a1a1a">${stats.totalViews}</div>
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px">Page Views</div>
          </div>
          <div style="flex:1;background:#f8f8f8;padding:20px;text-align:center;border-left:3px solid #e3000f">
            <div style="font-size:32px;font-weight:bold;color:#1a1a1a">${stats.uniqueVisitors}</div>
            <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px">Unique Visitors</div>
          </div>
        </div>
        ${botNote}

        <h2 style="font-size:16px;margin:24px 0 12px;color:#1a1a1a;border-bottom:2px solid #e3000f;padding-bottom:8px">Top Pages</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr><th style="text-align:left;padding:6px 12px;background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666">Page</th><th style="text-align:right;padding:6px 12px;background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666">Views</th></tr></thead>
          <tbody>${pageRows || '<tr><td colspan="2" style="padding:12px;text-align:center;color:#999">No page views recorded</td></tr>'}</tbody>
        </table>

        <h2 style="font-size:16px;margin:24px 0 12px;color:#1a1a1a;border-bottom:2px solid #e3000f;padding-bottom:8px">Traffic Sources</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr><th style="text-align:left;padding:6px 12px;background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666">Source</th><th style="text-align:right;padding:6px 12px;background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666">Visits</th></tr></thead>
          <tbody>${referrerRows || '<tr><td colspan="2" style="padding:12px;text-align:center;color:#999">No referrer data</td></tr>'}</tbody>
        </table>

        <h2 style="font-size:16px;margin:24px 0 12px;color:#1a1a1a;border-bottom:2px solid #e3000f;padding-bottom:8px">Activity by Hour (UTC)</h2>
        <div style="background:#f8f8f8;padding:12px;border-radius:4px">${hourBars}</div>
      </div>

      <div style="background:#f0f0f0;padding:16px;text-align:center;font-size:11px;color:#999">
        Orbit to Orbit Express — www.orbit2orbitexpress.com<br>
        Automated daily analytics report
      </div>
    </div>
  `;
}

export async function sendDailyAnalyticsEmail() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  const stats = getStatsForDate(dateStr);

  try {
    const { client, fromEmail } = await getUncachableResendClient();
    await client.emails.send({
      from: fromEmail,
      to: "VALGIN2150@gmail.com",
      subject: `O2O Express Daily Report — ${stats.date} | ${stats.totalViews} views, ${stats.uniqueVisitors} visitors`,
      html: generateEmailHTML(stats),
    });
    console.log(
      `[ANALYTICS] Daily email sent for ${dateStr}: ${stats.totalViews} views, ${stats.uniqueVisitors} unique, ${stats.botBlockedCount} bots blocked`
    );
  } catch (err) {
    console.error("[ANALYTICS] Failed to send daily email:", err);
  }

  botBlockedToday = 0;
  rateLimitedToday = 0;
}

export function scheduleDailyEmail() {
  function scheduleNext() {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setUTCHours(8, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    const msUntilNext = nextRun.getTime() - now.getTime();
    console.log(
      `[ANALYTICS] Next daily email scheduled for ${nextRun.toISOString()} (in ${Math.round(msUntilNext / 3600000)}h)`
    );
    setTimeout(() => {
      sendDailyAnalyticsEmail();
      scheduleNext();
    }, msUntilNext);
  }
  scheduleNext();
}

export function getAnalyticsStats() {
  const today = new Date().toISOString().split("T")[0];
  return getStatsForDate(today);
}
