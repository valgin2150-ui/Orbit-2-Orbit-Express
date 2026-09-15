import { useEffect, useState } from "react";
import type { Rocket } from "./types";

export const VEHICLE_STATUSES = [
  "Operational",
  "Limited–government only",
  "In flight test",
  "In development",
  "Retired",
  "Planned",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface LauncherRecord {
  id: string;
  slug: string;
  provider: string;
  vehicle_name: string;
  vehicle_status: VehicleStatus;
  payload_leo_kg: number | null;
  payload_sso_kg: number | null;
  payload_gto_kg: number | null;
  published_launch_price: number | null;
  price_currency: string;
  rideshare_price_per_kg: number | null;
  launch_sites: string[];
  reachable_inclination_notes: string;
  next_launch_date: string | null;
  availability_status: string;
  source_url: string[];
  source_name: string;
  source_date: string[];
  last_verified: string;
  confidence_level: "high" | "medium" | "low";
  notes: string;
  country: string;
  size_class: "micro" | "small" | "medium" | "heavy" | "super-heavy";
  lunar_capable: boolean;
  max_volume_m3: number;
  description: string;
}

let launcherRequest: Promise<LauncherRecord[]> | null = null;

export function loadLaunchers(): Promise<LauncherRecord[]> {
  if (!launcherRequest) {
    launcherRequest = fetch("/data/rockets.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load launcher data");
        return response.json() as Promise<LauncherRecord[]>;
      })
      .then((records) => records.filter((record) => VEHICLE_STATUSES.includes(record.vehicle_status)));
  }
  return launcherRequest;
}

export function useLaunchers() {
  const [launchers, setLaunchers] = useState<LauncherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLaunchers()
      .then(setLaunchers)
      .catch((reason) => {
        console.error("Launcher data load error:", reason);
        setError("Could not load launch market data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return { launchers, loading, error };
}

export function formatLauncherPrice(launcher: LauncherRecord): string {
  const price = launcher.rideshare_price_per_kg;
  return typeof price === "number" && price > 0
    ? `${launcher.price_currency === "USD" ? "$" : `${launcher.price_currency} `}${price.toLocaleString()}/kg`
    : "Pricing not publicly available";
}

export function formatAdvertisedMissionPrice(launcher: LauncherRecord): string {
  const price = launcher.published_launch_price;
  if (typeof price !== "number" || price <= 0) return "Mission-specific / not publicly available";
  const currency = launcher.price_currency === "USD" ? "$" : `${launcher.price_currency} `;
  return `${currency}${price.toLocaleString()}`;
}

export function theoreticalFullCapacityPricePerKg(launcher: LauncherRecord): number | null {
  if (
    typeof launcher.published_launch_price !== "number" ||
    launcher.published_launch_price <= 0 ||
    typeof launcher.payload_leo_kg !== "number" ||
    launcher.payload_leo_kg <= 0
  ) {
    return null;
  }
  return Math.round(launcher.published_launch_price / launcher.payload_leo_kg);
}

export function formatVerifiedDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function hasPublishedPerKgPrice(launcher: LauncherRecord): boolean {
  return typeof launcher.rideshare_price_per_kg === "number" && launcher.rideshare_price_per_kg > 0;
}

export function formatLauncherAvailability(launcher: LauncherRecord): string {
  if (!launcher.next_launch_date) return launcher.availability_status || "Availability not publicly confirmed";
  const date = new Date(`${launcher.next_launch_date}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
    return launcher.availability_status || "Availability not publicly confirmed";
  }
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function formatLastReviewed(launchers: LauncherRecord[]): string {
  const newest = launchers
    .map((launcher) => launcher.last_verified)
    .filter(Boolean)
    .sort()
    .at(-1);
  if (!newest) return "Not available";
  return new Date(`${newest}T00:00:00Z`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function launcherToCalculatorRocket(launcher: LauncherRecord): Rocket {
  return {
    name: launcher.vehicle_name,
    provider: launcher.provider,
    costPerKg: hasPublishedPerKgPrice(launcher) ? launcher.rideshare_price_per_kg! : 0,
    maxMass: launcher.payload_leo_kg ?? 0,
    maxVolume: launcher.max_volume_m3,
    nextAvailable: formatLauncherAvailability(launcher),
    contactUrl: launcher.source_url[0] ?? "#",
    regions: ["any"],
    status: launcher.vehicle_status,
    sizeClass: launcher.size_class,
    lunarCapable: launcher.lunar_capable,
    statusNote: launcher.notes,
  };
}