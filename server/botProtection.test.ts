import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { once } from "node:events";
import http from "node:http";
import test from "node:test";
import express from "express";
import { BoundedHitLog, botProtectionMiddleware, createOaiSearchBotBlockList, getMachineAccessReport, resetMachineAccessReportForTests } from "./botProtection";

function request(options: { ua: string; method?: string; path?: string; country?: string; ip?: string; sameOrigin?: boolean }) {
  const res = new EventEmitter() as EventEmitter & { statusCode: number; status: (code: number) => typeof res; send: (_body: string) => typeof res; setHeader: (_key: string, _value: string) => void };
  res.statusCode = 200;
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = () => { res.emit("finish"); return res; };
  res.setHeader = () => undefined;
  const headers: Record<string, string> = { "user-agent": options.ua, "x-forwarded-for": options.ip || "198.51.100.45" };
  if (options.country) headers["cf-ipcountry"] = options.country;
  if (options.sameOrigin) {
    headers.host = "example.test";
    headers.origin = "https://example.test";
    headers["sec-fetch-site"] = "same-origin";
    headers["x-forwarded-proto"] = "https";
  }
  const req = { method: options.method || "GET", path: options.path || "/", headers, protocol: options.sameOrigin ? "https" : "http", socket: { remoteAddress: options.ip || "198.51.100.45" } };
  return { req, res };
}

async function invoke(options: Parameters<typeof request>[0]): Promise<number> {
  const { req, res } = request(options);
  let nextCalled = false;
  await botProtectionMiddleware(req as any, res as any, () => { nextCalled = true; });
  if (nextCalled) res.emit("finish");
  return res.statusCode;
}

test("generic CLI low-volume public GET is allowed", async () => {
  resetMachineAccessReportForTests();
  assert.equal(await invoke({ ua: "curl/8.5.0" }), 200);
});

test("spoofed crawler is not granted verified classification", async () => {
  resetMachineAccessReportForTests();
  assert.equal(await invoke({ ua: "Googlebot/2.1", ip: "127.0.0.1" }), 200);
  assert.equal(getMachineAccessReport().classifications["verified-crawler"], 0);
  assert.equal(getMachineAccessReport().classifications["unverified-automation"], 1);
});

test("Singapore is a risk signal, not a blanket block", async () => {
  resetMachineAccessReportForTests();
  assert.equal(await invoke({ ua: "Mozilla/5.0 Chrome/120 Safari/537.36", country: "SG" }), 200);
});

test("malicious scanners are rejected", async () => {
  resetMachineAccessReportForTests();
  assert.equal(await invoke({ ua: "sqlmap/1.8" }), 403);
  assert.equal(await invoke({ ua: "Go-http-client/1.1", path: "/production/.env" }), 403);
});

test("automation writes are rejected while browser GETs work", async () => {
  resetMachineAccessReportForTests();
  const previous = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "unit-test-session-secret";
  try {
    assert.equal(await invoke({ ua: "curl/8.5.0", method: "POST", path: "/api/track" }), 403);
    assert.equal(await invoke({ ua: "Mozilla/5.0 Chrome/120 Safari/537.36" }), 200);
  } finally {
    if (previous === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous;
  }
});

test("same-origin headers do not authorize a write without a signed permit", async () => {
  resetMachineAccessReportForTests();
  const previous = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "unit-test-session-secret";
  const ua = "Mozilla/5.0 Chrome/120 Safari/537.36";
  try {
    assert.equal(await invoke({ ua, method: "POST", path: "/api/track" }), 403);
    assert.equal(await invoke({ ua, method: "POST", path: "/api/track", sameOrigin: true }), 403);
  } finally {
    if (previous === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous;
  }
});

test("OpenAI's current ipv4Prefix and ipv6Prefix shape is parsed", () => {
  const list = createOaiSearchBotBlockList({ prefixes: [
    { ipv4Prefix: "192.0.2.0/24" }, { ipv6Prefix: "2001:db8::/32" },
  ] });
  assert.equal(list.check("192.0.2.7", "ipv4"), true);
  assert.equal(list.check("2001:db8::7", "ipv6"), true);
});

test("bounded hit storage evicts LRU clients instead of globally denying newcomers", () => {
  const store = new BoundedHitLog(2);
  assert.equal(store.hit("first", 1, 1_000, 3), false);
  assert.equal(store.hit("second", 2, 1_000, 3), false);
  assert.equal(store.hit("first", 3, 1_000, 3), false); // refresh recency
  assert.equal(store.hit("new-client", 4, 1_000, 3), false);
  assert.equal(store.size, 2);
  assert.equal(store.hit("second", 5, 1_000, 3), false); // was evicted, not globally denied
});

test("Express issues a permit on HTML GET and requires it with same-origin writes", async () => {
  resetMachineAccessReportForTests();
  const previous = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "integration-test-session-secret";
  const app = express();
  app.set("trust proxy", 1);
  app.use(botProtectionMiddleware);
  app.use(express.json());
  app.get("/", (_req, res) => res.status(200).send("ok"));
  app.post("/api/track", (_req, res) => res.status(204).end());
  app.post("/api/inquiry", (_req, res) => res.status(204).end());
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const send = (method: string, path: string, headers: http.OutgoingHttpHeaders) => new Promise<{ status: number; cookie?: string }>((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port: address.port, path, method, headers }, (res) => {
      res.resume(); res.on("end", () => resolve({ status: res.statusCode || 0, cookie: res.headers["set-cookie"]?.[0]?.split(";")[0] }));
    });
    req.on("error", reject); req.end(method === "POST" ? "{}" : undefined);
  });
  const base = { "user-agent": "Mozilla/5.0 Chrome/120 Safari/537.36", host: "example.test", "content-type": "application/json" };
  try {
    const metadata = { ...base, origin: "https://example.test", "sec-fetch-site": "same-origin", "x-forwarded-proto": "https" };
    assert.equal((await send("POST", "/api/track", metadata)).status, 403);
    const admission = await send("GET", "/", { ...base, accept: "text/html", "x-forwarded-proto": "https" });
    assert.equal(admission.status, 200);
    assert.match(admission.cookie || "", /^machine_write_permit=/);
    assert.equal((await send("POST", "/api/track", { ...metadata, cookie: admission.cookie })).status, 204);
    for (let index = 0; index < 5; index++) {
      assert.equal((await send("POST", "/api/inquiry", { ...metadata, cookie: admission.cookie })).status, 204);
    }
    assert.equal((await send("POST", "/api/inquiry", { ...metadata, cookie: admission.cookie })).status, 429);
  } finally {
    server.close();
    await once(server, "close");
    if (previous === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous;
  }
});

test("automation abuse is temporarily rate limited", async () => {
  resetMachineAccessReportForTests();
  let status = 200;
  for (let i = 0; i < 81; i++) status = await invoke({ ua: "curl/8.5.0", ip: "198.51.100.55" });
  assert.equal(status, 429);
});

test("aggregate report records classifications and response statuses", async () => {
  resetMachineAccessReportForTests();
  await invoke({ ua: "Mozilla/5.0 Chrome/120 Safari/537.36", path: "/orbits" });
  await invoke({ ua: "nuclei/3.0", path: "/admin" });
  const report = getMachineAccessReport();
  assert.equal(report.classifications["normal-browser"], 1);
  assert.equal(report.classifications["unverified-automation"], 1);
  assert.equal(report.responseStatuses["200"], 1);
  assert.equal(report.responseStatuses["403"], 1);
  assert.equal(report.topRoutes[0]?.route, "/orbits");
});