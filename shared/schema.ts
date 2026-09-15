import { z } from "zod";

// Mission types
export type Mission = {
  id: number;
  payloadType: string;
  payloadMass: number;
  payloadVolume: number;
  targetOrbit: string;
  launchRegion: string;
  calculatedDeltaV: number;
  estimatedCost: number;
  compatibleRockets: unknown;
  createdAt: string;
};

export const insertMissionSchema = z.object({
  payloadType: z.string(),
  payloadMass: z.number(),
  payloadVolume: z.number(),
  targetOrbit: z.string(),
  launchRegion: z.string(),
  calculatedDeltaV: z.number(),
  estimatedCost: z.number(),
  compatibleRockets: z.any(),
  createdAt: z.string().optional()
});

export type InsertMission = z.infer<typeof insertMissionSchema>;

// Rocket types
export type Rocket = {
  id: number;
  name: string;
  provider: string;
  costPerKg: number;
  maxMass: number;
  maxVolume: number;
  nextAvailable: string;
  contactUrl: string;
  regions: string[];
};

export const insertRocketSchema = z.object({
  name: z.string(),
  provider: z.string(),
  costPerKg: z.number(),
  maxMass: z.number(),
  maxVolume: z.number(),
  nextAvailable: z.string(),
  contactUrl: z.string(),
  regions: z.array(z.string())
});

export type InsertRocket = z.infer<typeof insertRocketSchema>;

// Orbit types
export type Orbit = {
  id: number;
  code: string;
  name: string;
  deltaV: number;
};

export const insertOrbitSchema = z.object({
  code: z.string(),
  name: z.string(),
  deltaV: z.number()
});

export type InsertOrbit = z.infer<typeof insertOrbitSchema>;

// Company Directory types
export const SEGMENT_TYPES = [
  "launch_provider",
  "suborbital",
  "lander",
  "satellite_manufacturer",
  "satellite_operator",
  "in_space_services",
  "propulsion_systems",
  "ground_systems",
  "space_stations",
  "manufacturing_materials",
  "data_analytics",
  "transportation_logistics",
  "government_agency",
  "national_space_org"
] as const;

export type SegmentType = typeof SEGMENT_TYPES[number];

export const SEGMENT_LABELS: Record<SegmentType, string> = {
  launch_provider: "Launch Provider",
  suborbital: "Suborbital",
  lander: "Lander",
  satellite_manufacturer: "Satellite Manufacturer",
  satellite_operator: "Satellite Operator",
  in_space_services: "In-Space Services",
  propulsion_systems: "Propulsion Systems",
  ground_systems: "Ground Systems",
  space_stations: "Space Stations",
  manufacturing_materials: "Manufacturing & Materials",
  data_analytics: "Data & Analytics",
  transportation_logistics: "Transportation & Logistics",
  government_agency: "Government Agency",
  national_space_org: "National Space Organization"
};

export const SEGMENT_COLORS: Record<SegmentType, string> = {
  launch_provider: "bg-blue-600",
  suborbital: "bg-sky-500",
  lander: "bg-orange-500",
  satellite_manufacturer: "bg-green-600",
  satellite_operator: "bg-emerald-500",
  in_space_services: "bg-teal-500",
  propulsion_systems: "bg-red-500",
  ground_systems: "bg-amber-600",
  space_stations: "bg-purple-600",
  manufacturing_materials: "bg-pink-500",
  data_analytics: "bg-lime-600",
  transportation_logistics: "bg-indigo-500",
  government_agency: "bg-violet-600",
  national_space_org: "bg-fuchsia-500"
};

export const COMPANY_TYPES = [
  "commercial_private",
  "publicly_traded",
  "government_agency",
  "national_space_org",
  "state_owned",
  "joint_venture",
  "nonprofit_research"
] as const;

export type CompanyType = typeof COMPANY_TYPES[number];

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  commercial_private: "Commercial Private",
  publicly_traded: "Publicly Traded",
  government_agency: "Government Agency",
  national_space_org: "National Space Organization",
  state_owned: "State-Owned Enterprise",
  joint_venture: "Joint Venture",
  nonprofit_research: "Non-Profit/Research"
};

export type SpaceCompany = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  headquartersCity: string;
  foundedYear: number | null;
  segments: SegmentType[];
  companyType: CompanyType;
  website: string;
  linkedin?: string;
  description: string;
  notableAchievements?: string[];
  activeProducts?: string[];
  fundingStage?: string;
  employeeRange?: string;
};

export const spaceCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  countryCode: z.string(),
  headquartersCity: z.string(),
  foundedYear: z.number().nullable(),
  segments: z.array(z.enum(SEGMENT_TYPES)),
  companyType: z.enum(COMPANY_TYPES),
  website: z.string(),
  linkedin: z.string().optional(),
  description: z.string(),
  notableAchievements: z.array(z.string()).optional(),
  activeProducts: z.array(z.string()).optional(),
  fundingStage: z.string().optional(),
  employeeRange: z.string().optional()
});

// Company Suggestion types
export type CompanySuggestion = {
  id: number;
  name: string;
  country: string;
  headquartersCity: string;
  foundedYear: number | null;
  segments: SegmentType[];
  companyType: CompanyType;
  website: string;
  linkedin?: string;
  description: string;
  activeProducts?: string;
  submitterEmail: string;
  submitterName?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

export const insertCompanySuggestionSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  country: z.string().min(2, "Country is required"),
  headquartersCity: z.string().min(2, "Headquarters city is required"),
  foundedYear: z.number().nullable(),
  segments: z.array(z.enum(SEGMENT_TYPES)).min(1, "Select at least one segment"),
  companyType: z.enum(COMPANY_TYPES),
  website: z.string().url("Please enter a valid website URL"),
  linkedin: z.string().optional(),
  description: z.string().min(20, "Please provide a brief description (20+ characters)"),
  activeProducts: z.string().optional(),
  submitterEmail: z.string().email("Please enter a valid email"),
  submitterName: z.string().optional()
});

export type InsertCompanySuggestion = z.infer<typeof insertCompanySuggestionSchema>;

// Yeet types for kids experience activity feed
export type Yeet = {
  id: number;
  nickname: string;
  payload: string;
  payloadEmoji: string;
  destination: string;
  estimatedCost: number;
  rocketName: string;
  createdAt: string;
};

export const insertYeetSchema = z.object({
  nickname: z.string().max(30).optional(),
  payload: z.string().min(1).max(100),
  payloadEmoji: z.string().min(1).max(10),
  destination: z.string().min(1).max(50),
  estimatedCost: z.number().positive(),
  rocketName: z.string().min(1).max(50)
});

export type InsertYeet = z.infer<typeof insertYeetSchema>;

// Mission Intake types
export type MissionIntake = {
  id: number;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  website?: string;
  missionObjective?: string;
  missionSuccess?: string;
  payloadType: string;
  payloadMass?: string;
  payloadDimensions?: string;
  formFactor?: string;
  destination: string;
  desiredAltitude?: string;
  desiredInclination?: string;
  timeline: string;
  earliestFlightDate?: string;
  latestFlightDate?: string;
  timingFlexible?: string;
  missionMaturity?: string;
  spacecraftStatus?: string;
  technicalRequirements: string[];
  specialHandling: string[];
  regulatoryStatus: string[];
  budgetRange?: string;
  challenges: string[];
  biggestQuestion?: string;
  additionalContext?: string;
  createdAt: string;
};

export const insertMissionIntakeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(254),
  phone: z.string().trim()
    .min(7, "Valid phone number required")
    .max(30, "Phone number is too long")
    .regex(/^\+?[0-9().\-\s]+$/, "Valid phone number required"),
  organization: z.string().trim().max(150).optional(),
  website: z.string().trim().url("Valid website required").max(500).optional(),
  missionObjective: z.string().trim().max(5000).optional(),
  missionSuccess: z.string().trim().max(5000).optional(),
  payloadType: z.string().min(1, "Payload type is required"),
  payloadMass: z.string().trim().max(30).optional(),
  payloadDimensions: z.string().trim().max(200).optional(),
  formFactor: z.string().trim().max(200).optional(),
  destination: z.string().min(1, "Destination is required"),
  desiredAltitude: z.string().trim().max(100).optional(),
  desiredInclination: z.string().trim().max(100).optional(),
  timeline: z.string().min(1, "Timeline is required"),
  earliestFlightDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  latestFlightDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timingFlexible: z.string().max(100).optional(),
  missionMaturity: z.string().max(100).optional(),
  spacecraftStatus: z.string().max(150).optional(),
  technicalRequirements: z.array(z.string().max(150)).max(20).default([]),
  specialHandling: z.array(z.string().max(150)).max(20).default([]),
  regulatoryStatus: z.array(z.string().max(150)).max(20).default([]),
  budgetRange: z.string().max(150).optional(),
  challenges: z.array(z.string().max(100)).max(20),
  biggestQuestion: z.string().trim().max(5000).optional(),
  additionalContext: z.string().trim().max(5000).optional(),
});

export type InsertMissionIntake = z.infer<typeof insertMissionIntakeSchema>;
