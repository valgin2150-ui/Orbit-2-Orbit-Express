import { PayloadConfig, CalculatedResults, Rocket, Orbit } from "./types";
import { payloadTypes, orbits as fallbackOrbits, regions, insights } from "./data";
import { launcherToCalculatorRocket, type LauncherRecord } from "./launcherData";

const cislunarOrbits = ["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus", "L1L2"];

const VALID_SIZE_CLASSES = ["micro", "small", "medium", "heavy", "super-heavy"] as const;
type RocketSizeClass = (typeof VALID_SIZE_CLASSES)[number];

const ORBIT_ABBR_TO_ID: Record<string, string> = {
  TLI: "Moon",
  MTO: "Mars",
  "L1/L2": "L1L2",
};

export type JsonRocketDTO = LauncherRecord;

export interface JsonOrbitDTO {
  name: string;
  slug: string;
  abbreviation: string;
  deltaVKms: number;
  category: string;
}

export function jsonRocketToRocket(jr: JsonRocketDTO): Rocket {
  const rawSize = jr.size_class;
  const sizeClass: RocketSizeClass = VALID_SIZE_CLASSES.includes(rawSize as RocketSizeClass)
    ? (rawSize as RocketSizeClass)
    : "medium";
  return {
    ...launcherToCalculatorRocket(jr),
    name: jr.vehicle_name,
    provider: jr.provider,
    sizeClass,
  };
}

export function jsonOrbitToOrbit(jo: JsonOrbitDTO): Orbit {
  const id = ORBIT_ABBR_TO_ID[jo.abbreviation] ?? jo.abbreviation;
  return { id, name: jo.name, deltaV: jo.deltaVKms };
}

export function calculateLogistics(
  payload: PayloadConfig,
  overrideOrbits?: Orbit[],
  overrideRockets?: Rocket[]
): CalculatedResults {
  const orbitData = overrideOrbits && overrideOrbits.length > 0 ? overrideOrbits : fallbackOrbits;
  const rocketData = overrideRockets && overrideRockets.length > 0
    ? overrideRockets.filter((rocket) => rocket.costPerKg > 0)
    : [];

  const orbit = orbitData.find((o) => o.id === payload.orbit) || {
    id: payload.orbit,
    name: payload.orbit,
    deltaV: 10000,
  };

  let payloadTypeName = payload.payloadType;
  const payloadTypeObj = payloadTypes.find((p) => p.id === payload.payloadType);
  if (payloadTypeObj) {
    payloadTypeName = payloadTypeObj.name;
  }

  const region = regions.find((r) => r.id === payload.region) || { id: "any", name: "Any Region" };

  const isCislunar = payload.destinationMode === "cislunar" || cislunarOrbits.includes(payload.orbit);

  let compatibleRockets = rocketData.filter((rocket) => {
    const isCompatibleMass = payload.mass <= rocket.maxMass;
    const isCompatibleVolume = payload.volume <= rocket.maxVolume;
    const isCompatibleRegion =
      rocket.regions.includes("any") || rocket.regions.includes(payload.region);

    if (isCislunar) {
      return isCompatibleMass && isCompatibleVolume && isCompatibleRegion && rocket.lunarCapable;
    }

    return isCompatibleMass && isCompatibleVolume && isCompatibleRegion;
  });

  if (isCislunar) {
    compatibleRockets = compatibleRockets.map((rocket) => ({
      ...rocket,
      costPerKg: rocket.lunarCostPerKg ?? rocket.costPerKg * 8,
    }));
  }

  let estimatedCost = 0;
  if (compatibleRockets.length > 0) {
    const pricedRockets = compatibleRockets.filter((r) => r.costPerKg > 0);
    const rankingSet = pricedRockets;
    if (rankingSet.length === 0) {
      return {
        summary: { payloadTypeName, orbitName: orbit.name, regionName: region.name, mass: payload.mass, volume: payload.volume },
        metrics: { deltaV: orbit.deltaV, estimatedCost: 0 },
        compatibleRockets,
        insights: ["Pricing not publicly available for compatible launchers. Contact the provider for a mission-specific quote."],
      };
    }
    const sortedRockets = [...rankingSet].sort((a, b) => a.costPerKg - b.costPerKg);
    const baseCost = Math.round(sortedRockets[0].costPerKg * payload.mass);

    estimatedCost = Math.round(baseCost * 1.2);

    if (isCislunar && estimatedCost < 5000000) {
      estimatedCost = 5000000;
    } else if (!isCislunar && estimatedCost < 60000) {
      estimatedCost = 60000;
    }
  } else {
    estimatedCost = isCislunar ? 50000000 : 1200000;
  }

  const relevantInsights = selectRelevantInsights(payload, compatibleRockets);

  return {
    summary: {
      payloadTypeName,
      orbitName: orbit.name,
      regionName: region.name,
      mass: payload.mass,
      volume: payload.volume,
    },
    metrics: {
      deltaV: orbit.deltaV,
      estimatedCost,
    },
    compatibleRockets,
    insights: relevantInsights,
  };
}

function selectRelevantInsights(payload: PayloadConfig, compatibleRockets: Rocket[]): string[] {
  const selectedInsights: string[] = [];

  if (payload.mass < 50) {
    selectedInsights.push(insights[2]);
  }

  if (payload.orbit === "LEO") {
    selectedInsights.push(insights[1]);
  }

  if (payload.orbit === "SSO") {
    selectedInsights.push(insights[3]);
  }

  if (payload.orbit === "Moon") {
    selectedInsights.push(insights[4]);
  }

  if (payload.orbit === "Mars") {
    selectedInsights.push(insights[5]);
  }

  if (payload.mass > 1000) {
    selectedInsights.push(insights[6]);
  }

  if (payload.orbit === "GEO") {
    selectedInsights.push(insights[7]);
  }

  if (compatibleRockets.length <= 2) {
    selectedInsights.push(insights[0]);
  }

  while (selectedInsights.length < 3) {
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    if (!selectedInsights.includes(randomInsight)) {
      selectedInsights.push(randomInsight);
    }
  }

  return selectedInsights.slice(0, 4);
}
