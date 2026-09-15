export interface PayloadConfig {
  payloadType: string;
  mass: number;
  volume: number;
  orbit: string;
  region: string;
  destinationMode?: DestinationMode;
}

export interface MissionSummary {
  payloadTypeName: string;
  orbitName: string;
  regionName: string;
  mass: number;
  volume: number;
}

export interface MissionMetrics {
  deltaV: number;
  estimatedCost: number;
}

export interface Rocket {
  name: string;
  provider: string;
  costPerKg: number;
  lunarCostPerKg?: number;
  maxMass: number;
  maxVolume: number;
  nextAvailable: string;
  contactUrl: string;
  regions: string[];
  status?: "Operational" | "Limited–government only" | "In flight test" | "In development" | "Retired" | "Planned";
  sizeClass?: "micro" | "small" | "medium" | "heavy" | "super-heavy";
  lunarCapable?: boolean;
  statusNote?: string;
}

export type DestinationMode = "leo" | "cislunar";

export interface CalculatedResults {
  summary: MissionSummary;
  metrics: MissionMetrics;
  compatibleRockets: Rocket[];
  insights: string[];
}

export interface Orbit {
  id: string;
  name: string;
  deltaV: number;
}

export interface PayloadType {
  id: string;
  name: string;
  mass: number;
  volume: number;
}

export interface Region {
  id: string;
  name: string;
}
