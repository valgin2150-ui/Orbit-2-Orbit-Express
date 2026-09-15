import { Orbit, PayloadType, Region } from "./types";

export const payloadTypes: PayloadType[] = [
  { id: "cubesat", name: "CubeSat", mass: 10, volume: 0.01 },
  { id: "experiment", name: "Experiment", mass: 50, volume: 0.1 },
  { id: "spareParts", name: "Spare Parts", mass: 100, volume: 0.5 },
  { id: "custom", name: "Custom", mass: 0, volume: 0 },
];

export const orbitGroups = [
  {
    name: "Earth Orbits",
    orbits: [
      { id: "VLEO", name: "Very Low Earth Orbit", deltaV: 9.2 },
      { id: "LEO", name: "Low Earth Orbit", deltaV: 9.4 },
      { id: "MEO", name: "Medium Earth Orbit", deltaV: 10.2 },
      { id: "HEO", name: "High Earth Orbit", deltaV: 11.5 },
    ],
  },
  {
    name: "Special Earth Orbits",
    orbits: [
      { id: "GEO", name: "Geostationary Orbit", deltaV: 13.7 },
      { id: "GSO", name: "Geosynchronous Orbit", deltaV: 13.4 },
      { id: "SSO", name: "Sun-Synchronous Orbit", deltaV: 9.8 },
      { id: "PO", name: "Polar Orbit", deltaV: 9.7 },
      { id: "GTO", name: "Geostationary Transfer Orbit", deltaV: 12.3 },
      { id: "Molniya", name: "Molniya Orbit", deltaV: 11.3 },
      { id: "Tundra", name: "Tundra Orbit", deltaV: 11.8 },
    ],
  },
  {
    name: "Deep Space",
    orbits: [
      { id: "Moon", name: "Moon", deltaV: 14.1 },
      { id: "Mars", name: "Mars", deltaV: 18.4 },
      { id: "Ceres", name: "Ceres", deltaV: 19.7 },
      { id: "Titan", name: "Titan", deltaV: 22.5 },
      { id: "Europa", name: "Europa (Jupiter)", deltaV: 16.0 },
      { id: "Enceladus", name: "Enceladus (Saturn)", deltaV: 23.0 },
      { id: "L1L2", name: "Earth-Sun L1/L2", deltaV: 13.0 },
    ],
  },
];

export const orbits: Orbit[] = orbitGroups.flatMap((group) => group.orbits);

export const regions: Region[] = [
  { id: "any", name: "Any Region" },
  { id: "us", name: "United States" },
  { id: "india", name: "India" },
  { id: "china", name: "China" },
  { id: "europe", name: "Europe" },
  { id: "japan", name: "Japan" },
  { id: "nz", name: "New Zealand" },
];

export const insights: string[] = [
  "Rideshare opportunities can reduce launch costs while limiting orbit flexibility.",
  "LEO launches are generally more frequent and cost-effective than deeper-space missions.",
  "Small payloads benefit from rideshare opportunities when timing and orbit requirements allow.",
  "Sun-synchronous orbit is often selected for Earth-observation missions.",
  "Lunar missions require additional energy and specialized mission planning.",
  "Mars transfer windows occur approximately every 26 months.",
  "Large payloads may require a dedicated launch or a multi-launch deployment plan.",
  "GEO missions require significant additional delta-v and mission-specific pricing.",
];