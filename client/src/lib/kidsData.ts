export type PayloadType = {
  id: string;
  emoji: string;
  name: string;
  description: string;
};

export type Destination = {
  id: string;
  name: string;
  description: string;
  travelTime: string;
  deltaV: number;
  baseMultiplier: number;
};

export type Rocket = {
  name: string;
  provider: string;
  costPerKg: number;
  maxPayload: number;
  capabilities: string[];
};

export const PAYLOAD_TYPES: PayloadType[] = [
  { id: "exes", emoji: "💔", name: "Exes & Toxic People", description: "ex-boyfriend, ex-girlfriend, that one friend" },
  { id: "pets", emoji: "🐕", name: "Pets (jk we love them)", description: "send them on vacation lol" },
  { id: "cars", emoji: "🚗", name: "Cars & Vehicles", description: "that car that keeps breaking down" },
  { id: "problems", emoji: "😤", name: "My Problems", description: "homework, responsibilities, adulting" },
  { id: "random", emoji: "🎲", name: "Random Stuff", description: "literally anything tbh" },
  { id: "other", emoji: "✨", name: "Something Else", description: "get creative bestie" },
];

export const DESTINATIONS: Destination[] = [
  { id: "leo", name: "LEO", description: "just above airplane height tbh", travelTime: "5-15 minutes", deltaV: 9.4, baseMultiplier: 1.0 },
  { id: "meo", name: "MEO", description: "where GPS lives", travelTime: "2-6 hours", deltaV: 11.0, baseMultiplier: 1.3 },
  { id: "geo", name: "GEO", description: "floating in one spot forever", travelTime: "6-12 hours", deltaV: 14.0, baseMultiplier: 1.8 },
  { id: "heo", name: "HEO", description: "the scenic route", travelTime: "3-8 hours", deltaV: 12.5, baseMultiplier: 1.5 },
  { id: "sso", name: "SSO", description: "perfect for spy satellites lol", travelTime: "10-20 minutes", deltaV: 9.8, baseMultiplier: 1.1 },
  { id: "polar", name: "Polar", description: "cold up there fr", travelTime: "8-18 minutes", deltaV: 9.6, baseMultiplier: 1.05 },
  { id: "moon", name: "Moon", description: "say hi to the moon 🌙", travelTime: "3-5 days", deltaV: 15.5, baseMultiplier: 2.5 },
  { id: "l1", name: "L1 Point", description: "between earth and sun vibes", travelTime: "60-120 days", deltaV: 13.5, baseMultiplier: 2.0 },
  { id: "l2", name: "L2 Point", description: "where james webb chillin", travelTime: "60-120 days", deltaV: 13.8, baseMultiplier: 2.1 },
  { id: "mars", name: "Mars", description: "far enough they can't text back", travelTime: "7.2 months", deltaV: 18.0, baseMultiplier: 4.0 },
  { id: "venus", name: "Venus", description: "hot girl summer destination", travelTime: "5.1 months", deltaV: 16.5, baseMultiplier: 3.5 },
  { id: "jupiter", name: "Jupiter", description: "big planet energy", travelTime: "2.7 years", deltaV: 24.0, baseMultiplier: 8.0 },
  { id: "saturn", name: "Saturn", description: "has the best rings ngl", travelTime: "6.8 years", deltaV: 28.0, baseMultiplier: 12.0 },
  { id: "ceres", name: "Ceres", description: "dwarf planet but still valid", travelTime: "2.1 years", deltaV: 20.0, baseMultiplier: 5.0 },
  { id: "europa", name: "Europa", description: "might have aliens who knows", travelTime: "3.2 years", deltaV: 25.0, baseMultiplier: 9.0 },
  { id: "titan", name: "Titan", description: "saturn's cool moon", travelTime: "7.4 years", deltaV: 29.0, baseMultiplier: 14.0 },
  { id: "asteroid", name: "Asteroid Belt", description: "floating rocks everywhere", travelTime: "2.8 years", deltaV: 22.0, baseMultiplier: 6.0 },
];

export const ROCKETS: Rocket[] = [
  { name: "Falcon 9", provider: "SpaceX", costPerKg: 2720, maxPayload: 22800, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo"] },
  { name: "Falcon Heavy", provider: "SpaceX", costPerKg: 1500, maxPayload: 63800, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo", "moon", "l1", "l2", "mars", "venus"] },
  { name: "Starship", provider: "SpaceX", costPerKg: 500, maxPayload: 150000, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo", "moon", "l1", "l2", "mars", "venus", "jupiter", "saturn", "ceres", "europa", "titan", "asteroid"] },
  { name: "Electron", provider: "Rocket Lab", costPerKg: 19231, maxPayload: 300, capabilities: ["leo", "sso", "polar"] },
  { name: "Vulcan Centaur", provider: "ULA", costPerKg: 8000, maxPayload: 27200, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo", "moon", "l1", "l2"] },
  { name: "New Glenn", provider: "Blue Origin", costPerKg: 3500, maxPayload: 45000, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo", "moon", "l1", "l2"] },
  { name: "Ariane 6", provider: "Arianespace", costPerKg: 10000, maxPayload: 21600, capabilities: ["leo", "meo", "geo", "sso", "polar", "heo"] },
  { name: "PSLV", provider: "ISRO", costPerKg: 15000, maxPayload: 1750, capabilities: ["leo", "sso", "polar"] },
];

export const ACTIVITY_FEED_NAMES = [
  "xX_SpaceLord_Xx", "MoonBoi2025", "YeetMaster3000", "AstroBabe", "RocketQueenOmg",
  "SaturnSimp", "OrbitObsessed", "SpaceCadet420", "CosmicVibes", "GalaxyBrain",
  "StardustSally", "NebulaNerd", "PlutoFan4Ever", "MarsOrBust", "JupiterJunkie",
  "VenusVibe", "TitanTeen", "CometCatcher", "AsteroidAndy", "MeteorMike",
];

export const ACTIVITY_ACTIONS = [
  "just yeeted", "sent", "launched", "blasted", "rocketed", "catapulted",
];

export const generateRandomActivity = () => {
  const name = ACTIVITY_FEED_NAMES[Math.floor(Math.random() * ACTIVITY_FEED_NAMES.length)];
  const action = ACTIVITY_ACTIONS[Math.floor(Math.random() * ACTIVITY_ACTIONS.length)];
  const payload = PAYLOAD_TYPES[Math.floor(Math.random() * PAYLOAD_TYPES.length)];
  const destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
  const timeAgo = Math.floor(Math.random() * 60) + 1;
  
  return {
    id: Math.random().toString(36).substring(7),
    name,
    action,
    payload: payload.name,
    payloadEmoji: payload.emoji,
    destination: destination.name,
    timeAgo: `${timeAgo}m ago`,
  };
};
