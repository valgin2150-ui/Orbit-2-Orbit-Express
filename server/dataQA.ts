import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const KNOWN_LAUNCHER_STATUSES = [
  "Operational",
  "Limited–government only",
  "In flight test",
  "In development",
  "Retired",
  "Planned",
] as const;

type RecordValue = unknown;
export type LauncherRecord = Record<string, RecordValue>;

export interface DataQAFailure {
  launcherId: string;
  field: string;
  value: RecordValue;
  currentValue: RecordValue;
  rule: string;
}

export interface DataQAReport {
  ok: boolean;
  checkedAt: string;
  source: string;
  recordCount: number;
  failureCount: number;
  failures: DataQAFailure[];
  ruleSummary: Record<string, number>;
}

export interface RunDataQAOptions {
  sourcePath?: string;
  now?: Date;
  comparePages?: boolean;
  legacyRecords?: readonly LauncherRecord[];
}

const requiredFields = [
  "id", "provider", "vehicle_name", "vehicle_status", "payload_leo_kg", "payload_sso_kg",
  "payload_gto_kg", "published_launch_price", "price_currency", "rideshare_price_per_kg",
  "launch_sites", "reachable_inclination_notes", "next_launch_date", "availability_status",
  "source_url", "source_name", "source_date", "last_verified", "confidence_level", "notes",
] as const;

const numericFields = [
  "payload_leo_kg",
  "payload_sso_kg",
  "payload_gto_kg",
  "published_launch_price",
  "rideshare_price_per_kg",
] as const;

const legacyNumericFields = [
  "costPerKgLEO",
  "costPerLaunchM",
  "payloadLEO",
  "payloadGTO",
  "firstFlight",
] as const;

const estimateFlagFields = [
  "is_estimate",
  "estimated",
  "published_launch_price_is_estimate",
  "published_launch_price_estimated",
  "rideshare_price_per_kg_is_estimate",
  "rideshare_price_per_kg_estimated",
  "costPerKgLEOIsEstimate",
  "costPerKgLEOEstimated",
  "costPerLaunchMIsEstimate",
  "costPerLaunchMEstimated",
] as const;

const estimateLabelFields = [
  "estimate_label",
  "pricing_label",
  "published_launch_price_label",
  "rideshare_price_per_kg_label",
  "costPerKgLEOLabel",
  "costPerLaunchMLabel",
] as const;

const defaultSourcePath = path.resolve(process.cwd(), "client/public/data/rockets.json");

function recordId(record: LauncherRecord): string {
  for (const field of ["id", "slug", "vehicle_name", "name"]) {
    const value = record[field];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "(missing id)";
}

function reportValue(value: RecordValue): RecordValue {
  if (value === undefined) return null;
  if (typeof value !== "number" || Number.isFinite(value)) return value;
  return Number.isNaN(value) ? "NaN" : value > 0 ? "Infinity" : "-Infinity";
}

function fail(
  failures: DataQAFailure[],
  record: LauncherRecord,
  field: string,
  rule: string,
  currentValue: RecordValue = record[field],
): void {
  const value = reportValue(currentValue);
  failures.push({ launcherId: recordId(record), field, value, currentValue: value, rule });
}

function hasValue(value: RecordValue): boolean {
  return value !== null
    && value !== undefined
    && (!(typeof value === "string") || value.trim().length > 0)
    && (!Array.isArray(value) || value.length > 0);
}

function isValidDate(value: RecordValue): boolean {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isValidPastOrCurrentDate(value: RecordValue, now: Date): boolean {
  return isValidDate(value) && Date.parse(value as string) <= now.getTime();
}

function isValidFutureDate(value: RecordValue, now: Date): boolean {
  return value === null || (isValidDate(value) && Date.parse(value as string) > now.getTime());
}

function slugFor(record: LauncherRecord): string {
  const value = record.id ?? record.slug ?? record.vehicle_name ?? record.name;
  return typeof value === "string"
    ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "";
}

function getFirstValue(record: LauncherRecord, fields: readonly string[]): RecordValue {
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(record, field)) return record[field];
  }
  return undefined;
}

function validateNumericFields(record: LauncherRecord, failures: DataQAFailure[]): void {
  for (const field of numericFields) {
    const value = record[field];
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
      fail(failures, record, field, "numeric launcher values must be finite, non-negative numbers or null");
    }
    if (value === 0 && (field === "published_launch_price" || field === "rideshare_price_per_kg")) {
      fail(failures, record, field, "launch prices must not be zero; use null when pricing is not public");
    }
  }

  for (const field of legacyNumericFields) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) continue;
    const value = record[field];
    if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
      fail(failures, record, field, "calculations and numeric launcher values must be finite, non-negative numbers or null");
    }
    if (value === 0 && (field === "costPerKgLEO" || field === "costPerLaunchM")) {
      fail(failures, record, field, "launch prices must not be zero; use null when pricing is not public");
    }
  }
}

function validateCalculationInputs(record: LauncherRecord, failures: DataQAFailure[]): void {
  const costPerKg = record.costPerKgLEO;
  const launchCostMillions = record.costPerLaunchM;
  const hasCalculation = typeof costPerKg === "number" || typeof launchCostMillions === "number";
  if (!hasCalculation) return;

  const payload = record.payloadLEO;
  if (typeof payload !== "number" || !Number.isFinite(payload) || payload <= 0) {
    fail(failures, record, "payloadLEO", "payload must be greater than zero when it is used in a $/kg calculation");
    return;
  }

  if (typeof launchCostMillions === "number") {
    const derivedPerKg = (launchCostMillions * 1_000_000) / payload;
    if (!Number.isFinite(derivedPerKg) || derivedPerKg < 0) {
      fail(failures, record, "costPerLaunchM", "derived $/kg calculations must be finite and non-negative", derivedPerKg);
    }
  }
  if (typeof costPerKg === "number") {
    const derivedLaunchCost = costPerKg * payload;
    if (!Number.isFinite(derivedLaunchCost) || derivedLaunchCost < 0) {
      fail(failures, record, "costPerKgLEO", "derived launch-cost calculations must be finite and non-negative", derivedLaunchCost);
    }
  }
}

function validateSources(record: LauncherRecord, failures: DataQAFailure[], now: Date): void {
  for (const field of ["source_url", "source_date"] as const) {
    const value = record[field];
    if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || !item.trim())) {
      fail(failures, record, field, "every launcher must have at least one source");
    }
  }

  const sourceDates = record.source_date;
  if (Array.isArray(sourceDates) && sourceDates.some((value) => !isValidPastOrCurrentDate(value, now))) {
    fail(failures, record, "source_date", "source_date entries must be valid dates that are not in the future");
  }

  if (!hasValue(record.source_name)) {
    fail(failures, record, "source_name", "every launcher must include source_name and last_verified");
  }
}

function validateDates(record: LauncherRecord, failures: DataQAFailure[], now: Date): void {
  if (!isValidPastOrCurrentDate(record.last_verified, now)) {
    fail(failures, record, "last_verified", "last_verified must be a valid date that is not in the future");
  }
  if (!isValidFutureDate(record.next_launch_date, now)) {
    fail(failures, record, "next_launch_date", "next_launch_date must be a future date or null");
  }
}

function validateStatus(record: LauncherRecord, failures: DataQAFailure[]): void {
  if (!KNOWN_LAUNCHER_STATUSES.includes(record.vehicle_status as (typeof KNOWN_LAUNCHER_STATUSES)[number])) {
    fail(failures, record, "vehicle_status", `vehicle_status must be one of: ${KNOWN_LAUNCHER_STATUSES.join(", ")}`);
  }
  if (record.vehicle_status === "Retired" && record.availability_status !== "Retired — no availability") {
    fail(failures, record, "availability_status", "retired vehicles must state that no availability exists");
  }
  if (record.vehicle_status === "Limited–government only" && record.availability_status !== "Limited–government only") {
    fail(failures, record, "availability_status", "government-only vehicles must state their restricted availability");
  }
  if (record.vehicle_status !== "Retired" && record.availability_status === "Retired — no availability") {
    fail(failures, record, "availability_status", "non-retired vehicles must not claim retired availability");
  }
}

function validateEstimateLabels(record: LauncherRecord, failures: DataQAFailure[]): void {
  const isEstimate = estimateFlagFields.some((field) => record[field] === true);
  const hasPublicPrice = typeof record.published_launch_price === "number"
    || typeof record.rideshare_price_per_kg === "number"
    || typeof record.costPerKgLEO === "number"
    || typeof record.costPerLaunchM === "number";
  if (!isEstimate || !hasPublicPrice) return;

  const label = getFirstValue(record, estimateLabelFields);
  if (typeof label !== "string" || !/\b(est(?:imate|imated)?|project(?:ed|ion)?|target|indicative|historic)\b/i.test(label)) {
    fail(
      failures,
      record,
      "estimate_label",
      "estimated or projected values must be displayed with an explicit estimate label",
      label,
    );
  }
}

function validateRecord(record: LauncherRecord, failures: DataQAFailure[], now: Date): void {
  for (const field of requiredFields) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      fail(failures, record, field, "canonical launcher records must include the full required schema");
    }
  }
  validateNumericFields(record, failures);
  validateCalculationInputs(record, failures);
  validateSources(record, failures, now);
  validateDates(record, failures, now);
  validateStatus(record, failures);
  validateEstimateLabels(record, failures);
}

function comparePageData(
  canonical: readonly LauncherRecord[],
  legacy: readonly LauncherRecord[],
  failures: DataQAFailure[],
): void {
  const legacyBySlug = new Map(legacy.map((record) => [slugFor(record), record]));
  const canonicalSlugs = new Set(canonical.map(slugFor));
  const fields: Array<{ canonical: string; legacy: readonly string[] }> = [
    { canonical: "provider", legacy: ["provider"] },
    { canonical: "vehicle_status", legacy: ["vehicle_status", "status"] },
    { canonical: "payload_leo_kg", legacy: ["payload_leo_kg", "payloadLEO", "maxMass"] },
    { canonical: "published_launch_price", legacy: ["published_launch_price", "costPerLaunchM"] },
    { canonical: "rideshare_price_per_kg", legacy: ["rideshare_price_per_kg", "costPerKgLEO", "costPerKg"] },
    { canonical: "next_launch_date", legacy: ["next_launch_date", "nextAvailable"] },
  ];

  for (const record of canonical) {
    const pageRecord = legacyBySlug.get(slugFor(record));
    if (!pageRecord) {
      fail(
        failures,
        record,
        "record",
        "launcher must be present in every page dataset (missing from the comparison page dataset)",
      );
      continue;
    }

    for (const field of fields) {
      const pageValue = getFirstValue(pageRecord, field.legacy);
      if (pageValue === undefined || record[field.canonical] === pageValue) continue;
      fail(
        failures,
        record,
        field.canonical,
        `the ${field.canonical} value must match across launcher pages (comparison page value: ${String(pageValue)})`,
      );
    }
  }

  for (const record of legacy) {
    if (canonicalSlugs.has(slugFor(record))) continue;
    fail(
      failures,
      record,
      "record",
      "launcher must be present in every page dataset (missing from the canonical dataset)",
    );
  }
}

export async function loadCanonicalLaunchers(sourcePath: string): Promise<LauncherRecord[]> {
  const parsed: unknown = JSON.parse(await fs.readFile(sourcePath, "utf8"));
  if (!Array.isArray(parsed) || parsed.some((record) => !record || typeof record !== "object" || Array.isArray(record))) {
    throw new Error("Canonical launcher data must be an array of records");
  }
  return parsed as LauncherRecord[];
}

export async function runDataQA(options: RunDataQAOptions = {}): Promise<DataQAReport> {
  const sourcePath = options.sourcePath ?? process.env.DATA_QA_SOURCE_PATH ?? defaultSourcePath;
  const checkedAt = new Date().toISOString();
  const now = options.now ?? new Date();
  const failures: DataQAFailure[] = [];
  let records: LauncherRecord[] = [];

  try {
    records = await loadCanonicalLaunchers(sourcePath);
  } catch (error) {
    failures.push({
      launcherId: "(dataset)",
      field: "rockets.json",
      value: null,
      currentValue: null,
      rule: `canonical launcher data must be readable JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  const ids = new Set<string>();
  for (const record of records) {
    validateRecord(record, failures, now);
    const id = recordId(record);
    if (ids.has(id)) fail(failures, record, "id", "launcher ids must be unique");
    ids.add(id);
  }

  if (options.comparePages !== false && options.legacyRecords) {
    comparePageData(records, options.legacyRecords, failures);
  }

  const ruleSummary = failures.reduce<Record<string, number>>((summary, failure) => {
    summary[failure.rule] = (summary[failure.rule] ?? 0) + 1;
    return summary;
  }, {});

  return {
    ok: failures.length === 0,
    checkedAt,
    source: path.relative(process.cwd(), sourcePath),
    recordCount: records.length,
    failureCount: failures.length,
    failures,
    ruleSummary,
  };
}

async function main(): Promise<void> {
  const report = await runDataQA();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? "")) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}