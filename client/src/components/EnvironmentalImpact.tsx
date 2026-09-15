import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Leaf, Droplets, BarChart, Wind, CloudRain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DataLabel } from "./DataLabel";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface EnvironmentalImpactProps {
  orbit: string;
  mass: number;
  region: string;
  payloadType: string;
}

interface SustainabilityMetric {
  name: string;
  value: number; // 0-100 scale
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface RocketImpact {
  provider: string;
  fuelType: string;
  carbonFootprint: number; // kg CO2 equivalent
  sustainability: number; // 0-100 scale
  deorbitPlan: boolean;
  reuseRating: number; // 0-100 scale
}

export default function EnvironmentalImpact({ 
  orbit, 
  mass, 
  region,
  payloadType
}: EnvironmentalImpactProps) {
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>([]);
  const [rocketOptions, setRocketOptions] = useState<RocketImpact[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  
  // Generate environmental impact data
  useEffect(() => {
    // Calculate carbon footprint
    let baseCarbonFootprint = mass * 50; // Base: 50kg CO2 per kg to orbit
    
    // Adjust for orbit
    if (orbit.includes("LEO")) {
      baseCarbonFootprint *= 1.0;
    } else if (orbit.includes("MEO")) {
      baseCarbonFootprint *= 1.3;
    } else if (orbit.includes("GEO") || orbit.includes("GSO")) {
      baseCarbonFootprint *= 1.8;
    } else if (orbit.includes("Moon")) {
      baseCarbonFootprint *= 2.5;
    } else if (orbit.includes("Mars") || orbit.includes("Ceres") || orbit.includes("Titan")) {
      baseCarbonFootprint *= 4.0;
    }
    
    setCarbonFootprint(Math.round(baseCarbonFootprint));
    
    // Create sustainability metrics
    const newMetrics: SustainabilityMetric[] = [
      {
        name: "Carbon Impact",
        value: calculateCarbonScore(baseCarbonFootprint),
        description: `${Math.round(baseCarbonFootprint / 1000)} tonnes CO2 equivalent for launch and operations`,
        icon: <Droplets className="h-4 w-4" />,
        color: "#38bec9"
      },
      {
        name: "Space Debris",
        value: calculateDebrisScore(),
        description: getDebrisDescription(),
        icon: <Wind className="h-4 w-4" />,
        color: "#22c55e"
      },
      {
        name: "Resource Usage",
        value: calculateResourceScore(),
        description: "Materials and resources required for spacecraft manufacturing",
        icon: <BarChart className="h-4 w-4" />,
        color: "#94a3b8"
      },
      {
        name: "End-of-Life",
        value: calculateEolScore(),
        description: getEolDescription(),
        icon: <Leaf className="h-4 w-4" />,
        color: "#64748b"
      },
      {
        name: "Launch Site",
        value: calculateLaunchSiteScore(),
        description: `Environmental impact of launch operations at ${region}`,
        icon: <CloudRain className="h-4 w-4" />,
        color: "#475569"
      }
    ];
    
    setMetrics(newMetrics);
    
    // Calculate overall sustainability score (weighted average)
    const totalScore = newMetrics.reduce((acc, metric) => acc + metric.value, 0);
    setSustainabilityScore(Math.round(totalScore / newMetrics.length));
    
    // Generate rocket options with environmental data
    setRocketOptions([
      {
        provider: "SpaceX Falcon 9",
        fuelType: "RP-1/LOX",
        carbonFootprint: Math.round(baseCarbonFootprint * 0.8),
        sustainability: 78,
        deorbitPlan: true,
        reuseRating: 85
      },
      {
        provider: "ULA Atlas V",
        fuelType: "RP-1/LOX",
        carbonFootprint: Math.round(baseCarbonFootprint * 1.2),
        sustainability: 45,
        deorbitPlan: true,
        reuseRating: 0
      },
      {
        provider: "Rocket Lab Electron",
        fuelType: "RP-1/LOX",
        carbonFootprint: Math.round(baseCarbonFootprint * 0.6),
        sustainability: 68,
        deorbitPlan: true,
        reuseRating: 40
      },
      {
        provider: "Blue Origin New Glenn",
        fuelType: "LNG/LOX",
        carbonFootprint: Math.round(baseCarbonFootprint * 0.85),
        sustainability: 75,
        deorbitPlan: true,
        reuseRating: 80
      },
      {
        provider: "Arianespace Ariane 6",
        fuelType: "Solid/LH2",
        carbonFootprint: Math.round(baseCarbonFootprint * 1.1),
        sustainability: 55,
        deorbitPlan: true,
        reuseRating: 0
      }
    ]);
  }, [orbit, mass, region, payloadType]);
  
  // Calculate scores for each category
  const calculateCarbonScore = (carbonValue: number) => {
    // Lower carbon is better
    const maxAcceptable = 100000; // 100 tonnes
    return Math.max(0, Math.min(100, 100 - ((carbonValue / maxAcceptable) * 100)));
  };
  
  const calculateDebrisScore = () => {
    // Factors affecting debris score:
    // 1. Orbit type (LEO is worse due to congestion)
    // 2. Size/mass (larger objects more problematic)
    // 3. Whether CubeSat standard is used (better standards)
    
    let score = 50; // Base score
    
    if (orbit.includes("LEO")) {
      score -= 20; // Worst for space debris
    } else if (orbit.includes("GEO")) {
      score -= 10; // Still problematic
    } else if (orbit.includes("Moon") || orbit.includes("Mars")) {
      score += 20; // Less concern for debris
    }
    
    // Adjust for size
    if (mass < 10) {
      score += 15; // Small sats less problematic
    } else if (mass > 100) {
      score -= 15; // Larger sats more problematic
    }
    
    // Adjust for standardization
    if (payloadType === "cubesat") {
      score += 20; // CubeSats typically have better end-of-life plans
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const getDebrisDescription = () => {
    if (orbit.includes("LEO")) {
      return "Contributes to LEO congestion; deorbit plan required";
    } else if (orbit.includes("GEO")) {
      return "Requires graveyard orbit plan at end-of-life";
    } else if (orbit.includes("Moon") || orbit.includes("Mars")) {
      return "Limited debris concerns beyond Earth orbit";
    }
    return "Space debris mitigation strategies needed";
  };
  
  const calculateResourceScore = () => {
    // Resource usage based on mass and payload type
    let score = 50;
    
    // Smaller is better for resources
    if (mass < 10) {
      score += 20;
    } else if (mass < 50) {
      score += 10;
    } else if (mass > 200) {
      score -= 20;
    } else if (mass > 100) {
      score -= 10;
    }
    
    // CubeSats typically use standardized components
    if (payloadType === "cubesat") {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const calculateEolScore = () => {
    // End of life sustainability
    let score = 50;
    
    // Adjustments for orbit (some orbits have natural decay)
    if (orbit.includes("LEO")) {
      score += 20; // Will naturally deorbit eventually
    } else if (orbit.includes("GEO")) {
      score -= 10; // Requires active disposal
    } else if (orbit.includes("Moon") || orbit.includes("Mars")) {
      score += 10; // Less concern for debris
    }
    
    // CubeSats typically burn up completely
    if (payloadType === "cubesat" && mass < 10) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  };
  
  const getEolDescription = () => {
    if (orbit.includes("LEO") && payloadType === "cubesat") {
      return "Natural atmospheric reentry within 25 years";
    } else if (orbit.includes("LEO")) {
      return "Active deorbit required at end-of-mission";
    } else if (orbit.includes("GEO")) {
      return "Graveyard orbit 300km above GEO required";
    } else if (orbit.includes("Moon") || orbit.includes("Mars")) {
      return "Planetary protection protocols apply";
    }
    return "End-of-life disposal plan needed";
  };
  
  const calculateLaunchSiteScore = () => {
    // Impact of launch site
    if (region.includes("baikonur") || region.includes("cape")) {
      return 45; // Older sites with more environmental impact
    } else if (region.includes("kourou")) {
      return 60; // Remote location, less population impact
    } else if (region.includes("vandenberg")) {
      return 55; // Coastal location with significant facilities
    } else if (region.includes("india")) {
      return 50; // Varied environmental management
    } else if (region.includes("china")) {
      return 40; // Some sites with less environmental regulation
    }
    return 50; // Average
  };
  
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-lime-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-neutral-400";
    return "text-red-500";
  };
  
  const getSustainabilityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Below Average";
    return "Poor";
  };
  
  const formatCarbonQuantity = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} tonnes`;
    }
    return `${value} kg`;
  };
  
  const chartData = metrics.map(metric => ({
    subject: metric.name,
    A: metric.value,
    fullMark: 100,
    color: metric.color
  }));
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium text-gray-900">
          <Leaf className="w-4 h-4 mr-2 text-rail-red" />
          Environmental Impact Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Environmental sustainability metrics for mission planning</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="mt-2"><DataLabel kind="O2O model" /></div>
        <CardDescription>
          Modelled sustainability assessment for {mass}kg payload to {orbit}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3">
              <div className="text-sm text-gray-500">Overall Sustainability</div>
              <div className="flex items-center mt-1">
                <div className={`text-2xl font-bold ${getSustainabilityColor(sustainabilityScore)}`}>
                  {sustainabilityScore}/100
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${getSustainabilityColor(sustainabilityScore)}`}
                >
                  {getSustainabilityLabel(sustainabilityScore)}
                </Badge>
              </div>
              <Progress value={sustainabilityScore} className="mt-2" />
              <div className="flex justify-between mt-1 text-xs text-[hsl(var(--space-gray))]">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3">
              <div className="text-sm text-gray-500">Carbon Footprint</div>
              <div className="text-2xl font-bold mt-1 text-gray-900">
                {formatCarbonQuantity(carbonFootprint)} CO₂e
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Equivalent to {Math.round(carbonFootprint / 4000)} cars driven for one year
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 bg-gray-50 p-3 space-y-3">
              <div className="text-sm font-medium">Impact Metrics</div>
              {metrics.map((metric) => (
                <div key={metric.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-2" style={{ color: metric.color }}>{metric.icon}</span>
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${getSustainabilityColor(metric.value)}`}>
                      {metric.value}/100
                    </span>
                  </div>
                  <Progress value={metric.value} className="h-1" />
                  <p className="text-xs text-[hsl(var(--space-gray))]">{metric.description}</p>
                </div>
              ))}
            </div>
            
            <div className="col-span-2 bg-gray-50 p-3">
              <div className="text-sm font-medium mb-3 text-gray-900">Sustainability Radar</div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Radar
                      name="Sustainability"
                      dataKey="A"
                      stroke="#38bec9"
                      fill="#38bec9"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Launch Vehicle Environmental Comparison</div>
            <div className="space-y-2">
              {rocketOptions.map((rocket, index) => (
                <div key={index} className="bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{rocket.provider}</div>
                    <Badge 
                      variant="outline" 
                      className={getSustainabilityColor(rocket.sustainability)}
                    >
                      {getSustainabilityLabel(rocket.sustainability)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    <div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">Fuel Type</div>
                      <div className="text-sm">{rocket.fuelType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">Carbon Footprint</div>
                      <div className="text-sm">{formatCarbonQuantity(rocket.carbonFootprint)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">Reusability</div>
                      <div className="text-sm">{rocket.reuseRating > 0 ? `${rocket.reuseRating}%` : "Expendable"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">Deorbit Plan</div>
                      <div className="text-sm">{rocket.deorbitPlan ? "Yes" : "No"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}