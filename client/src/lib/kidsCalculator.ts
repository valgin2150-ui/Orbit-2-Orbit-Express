import { ROCKETS, DESTINATIONS, type Rocket, type Destination } from "./kidsData";

export interface YeetQuote {
  totalCost: number;
  baseCost: number;
  logisticsFee: number;
  launchProvider: string;
  rocketName: string;
  transitTime: string;
  launchPrep: string;
  destination: Destination;
  massKg: number;
  volumeM3: number;
}

export function calculateYeetCost(
  destinationId: string,
  massKg: number,
  volumeM3: number
): YeetQuote | null {
  const destination = DESTINATIONS.find(d => d.id === destinationId);
  if (!destination) return null;

  const capableRockets = ROCKETS.filter(r => 
    r.capabilities.includes(destinationId) && r.maxPayload >= massKg
  );

  if (capableRockets.length === 0) {
    const bestRocket = ROCKETS.reduce((best, r) => 
      r.maxPayload > best.maxPayload ? r : best
    );
    return createQuote(bestRocket, destination, massKg, volumeM3, true);
  }

  const cheapestRocket = capableRockets.reduce((cheapest, r) => 
    r.costPerKg < cheapest.costPerKg ? r : cheapest
  );

  return createQuote(cheapestRocket, destination, massKg, volumeM3, false);
}

function createQuote(
  rocket: Rocket,
  destination: Destination,
  massKg: number,
  volumeM3: number,
  oversized: boolean
): YeetQuote {
  const baseCost = Math.round(rocket.costPerKg * massKg * destination.baseMultiplier);
  
  const volumeMultiplier = Math.max(1, volumeM3 / 10);
  const logisticsFee = Math.round(baseCost * 0.15 * volumeMultiplier);
  
  const oversizePenalty = oversized ? 2.5 : 1;
  const totalCost = Math.round((baseCost + logisticsFee) * oversizePenalty);

  const launchPrepWeeks = Math.floor(Math.random() * 12) + 4;

  return {
    totalCost,
    baseCost,
    logisticsFee,
    launchProvider: rocket.provider,
    rocketName: rocket.name,
    transitTime: destination.travelTime,
    launchPrep: `${launchPrepWeeks} weeks`,
    destination,
    massKg,
    volumeM3,
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount}`;
}
