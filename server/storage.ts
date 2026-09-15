import fs from "node:fs/promises";
import path from "node:path";
import { 
  Mission, 
  InsertMission, 
  Rocket, 
  Orbit,
  CompanySuggestion,
  InsertCompanySuggestion,
  Yeet,
  InsertYeet,
  MissionIntake,
  InsertMissionIntake
} from "@shared/schema";

// Payload configuration from client
interface PayloadConfig {
  payloadType: string;
  mass: number;
  volume: number;
  orbit: string;
  region: string;
}

// Mission calculation result
interface CalculatedResults {
  summary: {
    payloadTypeName: string;
    orbitName: string;
    regionName: string;
    mass: number;
    volume: number;
  };
  metrics: {
    deltaV: number;
    estimatedCost: number;
  };
  compatibleRockets: Rocket[];
  insights: string[];
}

export interface IStorage {
  calculateLogistics(payload: PayloadConfig): Promise<CalculatedResults>;
  getAllRockets(): Promise<Rocket[]>;
  getAllOrbits(): Promise<Orbit[]>;
  saveMission(mission: InsertMission): Promise<Mission>;
  getMission(id: number): Promise<Mission | undefined>;
  saveCompanySuggestion(suggestion: InsertCompanySuggestion): Promise<CompanySuggestion>;
  getAllCompanySuggestions(): Promise<CompanySuggestion[]>;
  saveYeet(yeet: InsertYeet): Promise<Yeet>;
  getRecentYeets(limit?: number): Promise<Yeet[]>;
  getTopYeetsToday(limit?: number): Promise<Yeet[]>;
  saveMissionIntake(intake: InsertMissionIntake): Promise<MissionIntake>;
}

export class MemStorage implements IStorage {
  private missions: Map<number, Mission>;
  private companySuggestions: Map<number, CompanySuggestion>;
  private yeets: Map<number, Yeet>;
  private missionIntakes: Map<number, MissionIntake>;
  private rockets: Rocket[];
  private canonicalRockets?: Promise<Rocket[]>;
  private orbits: Orbit[];
  private payloadTypes: Map<string, { name: string; mass: number; volume: number }>;
  private regions: Map<string, string>;
  private insights: string[];
  private currentId: number;
  private suggestionId: number;
  private yeetId: number;
  private intakeId: number;

  constructor() {
    this.missions = new Map();
    this.companySuggestions = new Map();
    this.yeets = new Map();
    this.missionIntakes = new Map();
    this.currentId = 1;
    this.suggestionId = 1;
    this.yeetId = 1;
    this.intakeId = 1;
    
    // Initialize payload types
    this.payloadTypes = new Map([
      ["cubesat", { name: "CubeSat", mass: 10, volume: 0.01 }],
      ["experiment", { name: "Experiment", mass: 50, volume: 0.1 }],
      ["spareParts", { name: "Spare Parts", mass: 100, volume: 0.5 }],
      ["custom", { name: "Custom", mass: 0, volume: 0 }]
    ]);
    
    // Initialize regions
    this.regions = new Map([
      ["any", "Any Region"],
      ["us", "United States"],
      ["india", "India"],
      ["china", "China"],
      ["europe", "Europe"]
    ]);
    
    // Initialize orbits with expanded options
    this.orbits = [
      // Earth orbits
      { id: 1, code: "LEO", name: "Low Earth Orbit", deltaV: 9.4 },
      { id: 2, code: "MEO", name: "Medium Earth Orbit", deltaV: 10.2 },
      { id: 3, code: "HEO", name: "High Earth Orbit", deltaV: 11.5 },
      
      // Special Earth orbits
      { id: 4, code: "SSO", name: "Sun-Synchronous Orbit", deltaV: 9.7 },
      { id: 5, code: "PO", name: "Polar Orbit", deltaV: 9.8 },
      { id: 6, code: "GEO", name: "Geostationary Orbit", deltaV: 12.1 },
      { id: 7, code: "GSO", name: "Geosynchronous Orbit", deltaV: 11.8 },
      { id: 8, code: "GTO", name: "Geostationary Transfer Orbit", deltaV: 12.5 },
      { id: 9, code: "HEO2", name: "Highly Elliptical Orbit", deltaV: 12.7 },
      
      // Lagrange & Halo
      { id: 10, code: "L1", name: "Lagrange Point (L1)", deltaV: 13.6 },
      { id: 11, code: "NRH", name: "Near-Rectilinear Halo Orbit", deltaV: 14.2 },
      { id: 12, code: "MO", name: "Molniya Orbit", deltaV: 12.8 },
      
      // Beyond Earth
      { id: 13, code: "Moon", name: "Lunar Orbit", deltaV: 15.0 },
      { id: 14, code: "Mars", name: "Mars Orbit", deltaV: 18.2 },
      { id: 15, code: "Ceres", name: "Ceres Orbit", deltaV: 19.8 },
      { id: 16, code: "Titan", name: "Titan Orbit (Saturn)", deltaV: 25.4 },
      { id: 17, code: "GYO", name: "Graveyard Orbit", deltaV: 12.3 }
    ];
    
    // Function to generate future dates
    this.rockets = [];
    
    // Initialize insights
    this.insights = [
      "Consider splitting your payload into smaller units for more launch options.",
      "LEO launches are more frequent and cost-effective than deeper space missions.",
      "Rideshare opportunities can reduce costs by up to 60% for small payloads.",
      "Sun-synchronous orbits are ideal for Earth observation satellites.",
      "Lunar missions require multiple stages and significantly more delta-v.",
      "Mars missions typically launch during optimal transfer windows every 26 months.",
      "For custom payloads over 1000kg, dedicated launches are more economical.",
      "Geostationary satellites require sophisticated propulsion for station-keeping."
    ];
  }

  private async getCanonicalRockets(): Promise<Rocket[]> {
    if (!this.canonicalRockets) {
      this.canonicalRockets = fs.readFile(path.resolve(process.cwd(), "client/public/data/rockets.json"), "utf8")
        .then((raw) => JSON.parse(raw) as Array<Record<string, unknown>>)
        .then((records) => records
          .filter((record) => typeof record.rideshare_price_per_kg === "number" && record.rideshare_price_per_kg > 0)
          .map((record, index) => ({
            id: index + 1,
            name: String(record.vehicle_name),
            provider: String(record.provider),
            costPerKg: Number(record.rideshare_price_per_kg),
            maxMass: typeof record.payload_leo_kg === "number" ? record.payload_leo_kg : 0,
            maxVolume: typeof record.max_volume_m3 === "number" ? record.max_volume_m3 : 1,
            nextAvailable: String(record.availability_status || "Contact provider"),
            contactUrl: Array.isArray(record.source_url) ? String(record.source_url[0] || "#") : "#",
            regions: ["any"],
          })));
    }
    return this.canonicalRockets;
  }

  async calculateLogistics(payload: PayloadConfig): Promise<CalculatedResults> {
    const rockets = await this.getCanonicalRockets();
    // Get the orbit details
    const orbit = this.orbits.find(o => o.code === payload.orbit)!;
    
    // Get the payload type name
    let payloadTypeName = payload.payloadType;
    const payloadTypeObj = this.payloadTypes.get(payload.payloadType);
    if (payloadTypeObj) {
      payloadTypeName = payloadTypeObj.name;
    }
    
    // Get the region name
    const regionName = this.regions.get(payload.region) || payload.region;
    
    // Filter compatible rockets based on payload mass, volume, and region
    const compatibleRockets = rockets.filter(rocket => {
      const isCompatibleMass = payload.mass <= rocket.maxMass;
      const isCompatibleVolume = payload.volume <= rocket.maxVolume;
      const isCompatibleRegion = rocket.regions.includes(payload.region);
      
      return isCompatibleMass && isCompatibleVolume && isCompatibleRegion;
    });
    
    // Calculate estimated cost based on the cheapest compatible rocket
    let estimatedCost = 0;
    if (compatibleRockets.length > 0) {
      // Sort by cost per kg
      const sortedRockets = [...compatibleRockets].sort((a, b) => a.costPerKg - b.costPerKg);
      estimatedCost = Math.round(sortedRockets[0].costPerKg * payload.mass);
      
      // Add minimum launch cost for small payloads
      if (estimatedCost < 50000) {
        estimatedCost = 50000;
      }
    } else {
      // If no compatible rockets, use a high cost estimate
      estimatedCost = 1000000;
    }
    
    // Select relevant insights based on payload configuration
    const relevantInsights = this.selectRelevantInsights(payload, compatibleRockets);
    
    return {
      summary: {
        payloadTypeName,
        orbitName: orbit.name,
        regionName,
        mass: payload.mass,
        volume: payload.volume
      },
      metrics: {
        deltaV: orbit.deltaV,
        estimatedCost
      },
      compatibleRockets,
      insights: relevantInsights
    };
  }

  private selectRelevantInsights(payload: PayloadConfig, compatibleRockets: Rocket[]): string[] {
    const selectedInsights: string[] = [];
    
    // Select 3-4 relevant insights based on the payload configuration
    if (payload.mass < 50) {
      selectedInsights.push(this.insights[2]); // Rideshare for small payloads
    }
    
    if (payload.orbit === "LEO") {
      selectedInsights.push(this.insights[1]); // LEO is cost-effective
    }
    
    if (payload.orbit === "SSO") {
      selectedInsights.push(this.insights[3]); // SSO ideal for Earth observation
    }
    
    if (payload.orbit === "Moon") {
      selectedInsights.push(this.insights[4]); // Lunar missions need more delta-v
    }
    
    if (payload.orbit === "Mars") {
      selectedInsights.push(this.insights[5]); // Mars transfer windows
    }
    
    if (payload.mass > 1000) {
      selectedInsights.push(this.insights[6]); // Large payloads need dedicated launches
    }
    
    if (payload.orbit === "GEO") {
      selectedInsights.push(this.insights[7]); // GEO satellites need station-keeping
    }
    
    if (compatibleRockets.length <= 2) {
      selectedInsights.push(this.insights[0]); // Consider splitting payload
    }
    
    // If we don't have at least 3 insights yet, add some generic ones
    while (selectedInsights.length < 3) {
      const randomInsight = this.insights[Math.floor(Math.random() * this.insights.length)];
      if (!selectedInsights.includes(randomInsight)) {
        selectedInsights.push(randomInsight);
      }
    }
    
    // Return maximum 4 insights
    return selectedInsights.slice(0, 4);
  }

  async getAllRockets(): Promise<Rocket[]> {
    return this.getCanonicalRockets();
  }

  async getAllOrbits(): Promise<Orbit[]> {
    return this.orbits;
  }

  async saveMission(mission: InsertMission): Promise<Mission> {
    const id = this.currentId++;
    const timestamp = new Date().toISOString();
    const newMission: Mission = {
      id,
      payloadType: mission.payloadType,
      payloadMass: mission.payloadMass,
      payloadVolume: mission.payloadVolume,
      targetOrbit: mission.targetOrbit,
      launchRegion: mission.launchRegion,
      calculatedDeltaV: mission.calculatedDeltaV,
      estimatedCost: mission.estimatedCost,
      compatibleRockets: mission.compatibleRockets,
      createdAt: mission.createdAt || timestamp
    };
    this.missions.set(id, newMission);
    return newMission;
  }

  async getMission(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async saveCompanySuggestion(suggestion: InsertCompanySuggestion): Promise<CompanySuggestion> {
    const id = this.suggestionId++;
    const newSuggestion: CompanySuggestion = {
      id,
      name: suggestion.name,
      country: suggestion.country,
      headquartersCity: suggestion.headquartersCity,
      foundedYear: suggestion.foundedYear,
      segments: suggestion.segments,
      companyType: suggestion.companyType,
      website: suggestion.website,
      linkedin: suggestion.linkedin,
      description: suggestion.description,
      activeProducts: suggestion.activeProducts,
      submitterEmail: suggestion.submitterEmail,
      submitterName: suggestion.submitterName,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    this.companySuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async getAllCompanySuggestions(): Promise<CompanySuggestion[]> {
    return Array.from(this.companySuggestions.values());
  }

  async saveYeet(yeet: InsertYeet): Promise<Yeet> {
    const id = this.yeetId++;
    const newYeet: Yeet = {
      id,
      nickname: yeet.nickname || "Someone",
      payload: yeet.payload,
      payloadEmoji: yeet.payloadEmoji,
      destination: yeet.destination,
      estimatedCost: yeet.estimatedCost,
      rocketName: yeet.rocketName,
      createdAt: new Date().toISOString()
    };
    this.yeets.set(id, newYeet);
    return newYeet;
  }

  async getRecentYeets(limit: number = 20): Promise<Yeet[]> {
    const allYeets = Array.from(this.yeets.values());
    return allYeets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getTopYeetsToday(limit: number = 5): Promise<Yeet[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allYeets = Array.from(this.yeets.values());
    const todaysYeets = allYeets.filter(yeet => {
      const yeetDate = new Date(yeet.createdAt);
      return yeetDate >= today;
    });
    
    return todaysYeets
      .sort((a, b) => b.estimatedCost - a.estimatedCost)
      .slice(0, limit);
  }

  async saveMissionIntake(intake: InsertMissionIntake): Promise<MissionIntake> {
    const id = this.intakeId++;
    const newIntake: MissionIntake = {
      id,
      name: intake.name,
      email: intake.email,
      phone: intake.phone,
      organization: intake.organization,
      website: intake.website,
      missionObjective: intake.missionObjective,
      missionSuccess: intake.missionSuccess,
      payloadType: intake.payloadType,
      payloadMass: intake.payloadMass,
      payloadDimensions: intake.payloadDimensions,
      formFactor: intake.formFactor,
      destination: intake.destination,
      desiredAltitude: intake.desiredAltitude,
      desiredInclination: intake.desiredInclination,
      timeline: intake.timeline,
      earliestFlightDate: intake.earliestFlightDate,
      latestFlightDate: intake.latestFlightDate,
      timingFlexible: intake.timingFlexible,
      missionMaturity: intake.missionMaturity,
      spacecraftStatus: intake.spacecraftStatus,
      technicalRequirements: intake.technicalRequirements,
      specialHandling: intake.specialHandling,
      regulatoryStatus: intake.regulatoryStatus,
      budgetRange: intake.budgetRange,
      challenges: intake.challenges,
      biggestQuestion: intake.biggestQuestion,
      additionalContext: intake.additionalContext,
      createdAt: new Date().toISOString(),
    };
    this.missionIntakes.set(id, newIntake);
    return newIntake;
  }
}

export const storage = new MemStorage();
