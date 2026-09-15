import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import express from "express";
import { runDataQA, type LauncherRecord } from "./dataQA";
import { registerDataQARoute } from "./dataQARoute";

const now = new Date("2026-08-21T12:00:00.000Z");

function validLauncher(): LauncherRecord {
  return {
    id: "test-launcher",
    slug: "test-launcher",
    provider: "Test Launch Services",
    vehicle_name: "Test Launcher",
    vehicle_status: "Operational",
    payload_leo_kg: 12_000,
    payload_sso_kg: 8_000,
    payload_gto_kg: 4_000,
    published_launch_price: 12_000_000,
    price_currency: "USD",
    rideshare_price_per_kg: 1_000,
    launch_sites: ["Test Range"],
    reachable_inclination_notes: "Mission-dependent.",
    next_launch_date: "2026-12-01",
    availability_status: "Contact provider",
    source_url: ["https://example.test/launcher"],
    source_name: "Test provider vehicle page",
    source_date: ["2026-08-20"],
    last_verified: "2026-08-20",
    confidence_level: "high",
    notes: "Validated fixture.",
    costPerKgLEO: 1_000,
    costPerLaunchM: 12,
    payloadLEO: 12_000,
  };
}

async function withFixture<T>(
  content: unknown,
  callback: (sourcePath: string) => Promise<T> | T,
): Promise<T> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "launcher-data-qa-"));
  const sourcePath = path.join(directory, "rockets.json");
  await writeFile(sourcePath, typeof content === "string" ? content : JSON.stringify(content), "utf8");
  try {
    return await callback(sourcePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function runFixture(records: unknown, legacyRecords?: readonly LauncherRecord[]) {
  return withFixture(records, (sourcePath) => runDataQA({ sourcePath, now, legacyRecords }));
}

function findFailure(report: Awaited<ReturnType<typeof runDataQA>>, field: string, ruleFragment: string) {
  const failure = report.failures.find((item) => item.field === field && item.rule.includes(ruleFragment));
  assert.ok(failure, `Expected ${field} failure containing "${ruleFragment}", got: ${JSON.stringify(report.failures)}`);
  return failure;
}

test("valid canonical launcher fixture passes every QA check", async () => {
  const report = await runFixture([validLauncher()], [validLauncher()]);

  assert.equal(report.ok, true);
  assert.equal(report.recordCount, 1);
  assert.equal(report.failureCount, 0);
  assert.deepEqual(report.failures, []);
  assert.deepEqual(report.ruleSummary, {});
  assert.match(report.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("QA rejects malformed datasets, required fields, duplicate IDs, and invalid numeric payloads", async () => {
  const invalidJson = await runFixture("{not valid JSON");
  assert.equal(invalidJson.ok, false);
  findFailure(invalidJson, "rockets.json", "readable JSON");

  const notAnArray = await runFixture({ rockets: [validLauncher()] });
  findFailure(notAnArray, "rockets.json", "array of records");

  const missingSourceName = validLauncher();
  delete missingSourceName.source_name;
  const missingField = await runFixture([missingSourceName]);
  const schemaFailure = findFailure(missingField, "source_name", "full required schema");
  assert.equal(schemaFailure.value, null);
  assert.equal(schemaFailure.currentValue, null);

  const invalidPayload = await runFixture([{ ...validLauncher(), payload_leo_kg: -1 }]);
  findFailure(invalidPayload, "payload_leo_kg", "finite, non-negative");

  const duplicateIds = await runFixture([validLauncher(), { ...validLauncher(), vehicle_name: "Second Test Launcher" }]);
  findFailure(duplicateIds, "id", "ids must be unique");
});

test("QA rejects zero prices and invalid calculation inputs", async () => {
  const zeroCanonicalPrice = await runFixture([{ ...validLauncher(), published_launch_price: 0 }]);
  findFailure(zeroCanonicalPrice, "published_launch_price", "prices must not be zero");

  const zeroLegacyPrice = await runFixture([{ ...validLauncher(), costPerLaunchM: 0 }]);
  findFailure(zeroLegacyPrice, "costPerLaunchM", "prices must not be zero");

  const invalidCalculationPayload = await runFixture([{ ...validLauncher(), payloadLEO: 0 }]);
  findFailure(invalidCalculationPayload, "payloadLEO", "payload must be greater than zero");
});

test("QA validates launch, source, and verification dates", async () => {
  const staleLaunch = await runFixture([{ ...validLauncher(), next_launch_date: "2026-08-01" }]);
  findFailure(staleLaunch, "next_launch_date", "future date or null");

  const invalidSourceDate = await runFixture([{ ...validLauncher(), source_date: ["not-a-date"] }]);
  findFailure(invalidSourceDate, "source_date", "valid dates");

  const futureVerification = await runFixture([{ ...validLauncher(), last_verified: "2026-12-01" }]);
  findFailure(futureVerification, "last_verified", "valid date that is not in the future");
});

test("QA requires sources, valid statuses, availability rules, and estimate labels", async () => {
  const missingSource = await runFixture([{ ...validLauncher(), source_url: [] }]);
  findFailure(missingSource, "source_url", "at least one source");

  const invalidStatus = await runFixture([{ ...validLauncher(), vehicle_status: "Unknown" }]);
  findFailure(invalidStatus, "vehicle_status", "must be one of");

  const retiredAvailability = await runFixture([
    {
      ...validLauncher(),
      vehicle_status: "Retired",
      availability_status: "Contact provider",
      next_launch_date: null,
    },
  ]);
  findFailure(retiredAvailability, "availability_status", "no availability exists");

  const unlabeledEstimate = await runFixture([
    { ...validLauncher(), published_launch_price_is_estimate: true },
  ]);
  findFailure(unlabeledEstimate, "estimate_label", "explicit estimate label");

  const labeledEstimate = await runFixture([
    {
      ...validLauncher(),
      published_launch_price_is_estimate: true,
      published_launch_price_label: "Indicative estimate",
    },
  ]);
  assert.equal(labeledEstimate.ok, true);
});

test("QA reports missing and mismatched launcher records across page datasets", async () => {
  const canonical = validLauncher();
  const mismatch = {
    ...validLauncher(),
    provider: "Different Provider",
    published_launch_price: 11_000_000,
  };
  const mismatchedReport = await runFixture([canonical], [mismatch]);
  findFailure(mismatchedReport, "provider", "match across launcher pages");
  findFailure(mismatchedReport, "published_launch_price", "match across launcher pages");

  const missingReport = await runFixture([canonical], []);
  findFailure(missingReport, "record", "missing from the comparison page dataset");

  const extraReport = await runFixture([], [validLauncher()]);
  assert.equal(extraReport.ok, false);
  findFailure(extraReport, "record", "missing from the canonical dataset");
});

test("the QA CLI emits a report and exits successfully or unsuccessfully with the fixture result", async () => {
  await withFixture([validLauncher()], async (validPath) => {
    const validResult = spawnSync(
      process.execPath,
      [path.resolve("node_modules/tsx/dist/cli.mjs"), "server/dataQA.ts"],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATA_QA_SOURCE_PATH: validPath },
        encoding: "utf8",
      },
    );
    assert.equal(validResult.status, 0, validResult.stderr);
    assert.equal(JSON.parse(validResult.stdout).ok, true);
  });

  await withFixture([{ ...validLauncher(), rideshare_price_per_kg: 0 }], async (invalidPath) => {
    const invalidResult = spawnSync(
      process.execPath,
      [path.resolve("node_modules/tsx/dist/cli.mjs"), "server/dataQA.ts"],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATA_QA_SOURCE_PATH: invalidPath },
        encoding: "utf8",
      },
    );
    assert.equal(invalidResult.status, 1, invalidResult.stderr);
    const report = JSON.parse(invalidResult.stdout);
    assert.equal(report.ok, false);
    findFailure(report, "rideshare_price_per_kg", "prices must not be zero");
  });
});

test("GET /api/admin/data-qa preserves the complete failure report contract", async () => {
  await withFixture([{ ...validLauncher(), rideshare_price_per_kg: 0 }], async (sourcePath) => {
    const previousSourcePath = process.env.DATA_QA_SOURCE_PATH;
    process.env.DATA_QA_SOURCE_PATH = sourcePath;

    const app = express();
    registerDataQARoute(app);
    const server = createServer(app);
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      assert.ok(address && typeof address !== "string");
      const response = await fetch(`http://127.0.0.1:${address.port}/api/admin/data-qa`);
      assert.equal(response.status, 200);
      const report = await response.json() as Awaited<ReturnType<typeof runDataQA>>;
      assert.equal(report.ok, false);
      assert.ok(report.failures.length > 0);

      for (const failure of report.failures) {
        assert.equal(typeof failure.launcherId, "string");
        assert.equal(typeof failure.field, "string");
        assert.ok(Object.hasOwn(failure, "value"));
        assert.ok(Object.hasOwn(failure, "currentValue"));
        assert.equal(typeof failure.rule, "string");
      }

      const priceFailure = findFailure(report, "rideshare_price_per_kg", "prices must not be zero");
      assert.equal(priceFailure.launcherId, "test-launcher");
      assert.equal(priceFailure.value, 0);
      assert.equal(priceFailure.currentValue, 0);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      if (previousSourcePath === undefined) {
        delete process.env.DATA_QA_SOURCE_PATH;
      } else {
        process.env.DATA_QA_SOURCE_PATH = previousSourcePath;
      }
    }
  });
});