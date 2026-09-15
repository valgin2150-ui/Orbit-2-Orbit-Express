import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, Shield, DollarSign, Briefcase, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataLabel } from "./DataLabel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface InsuranceCostEstimatorProps {
  orbit: string;
  payloadType: string;
  mass: number;
  launchProvider?: string;
  missionValue?: number;
}

interface InsuranceQuote {
  type: string;
  premium: number;
  coverage: number;
  deductible: number;
  riskFactor: number;
  provider: string;
}

export default function InsuranceCostEstimator({ 
  orbit, 
  payloadType, 
  mass, 
  launchProvider = "Any Provider",
  missionValue = 0
}: InsuranceCostEstimatorProps) {
  const [launchInsurance, setLaunchInsurance] = useState<InsuranceQuote[]>([]);
  const [onOrbitInsurance, setOnOrbitInsurance] = useState<InsuranceQuote[]>([]);
  const [thirdPartyLiability, setThirdPartyLiability] = useState<InsuranceQuote[]>([]);
  const [estimatedMissionValue, setEstimatedMissionValue] = useState(0);
  
  // Calculate mission value if not provided
  useEffect(() => {
    if (missionValue > 0) {
      setEstimatedMissionValue(missionValue);
    } else {
      // Estimate based on mass and orbit
      let baseCost = mass * 10000; // $10K per kg as starting point
      
      // Adjust for payload type
      if (payloadType === "cubesat") {
        baseCost = Math.min(baseCost, 200000); // CubeSats have lower ceiling
      } else if (payloadType === "experiment") {
        baseCost *= 1.5; // Experiments typically more valuable due to R&D costs
      }
      
      // Adjust for orbit
      if (orbit.includes("GEO") || orbit.includes("GSO")) {
        baseCost *= 2.5; // GEO satellites are significantly more valuable
      } else if (orbit.includes("Moon") || orbit.includes("Mars") || orbit.includes("Titan") || orbit.includes("Ceres")) {
        baseCost *= 4; // Planetary missions have very high costs
      }
      
      setEstimatedMissionValue(Math.round(baseCost));
    }
  }, [missionValue, mass, orbit, payloadType]);
  
  // Generate insurance quotes
  useEffect(() => {
    if (estimatedMissionValue <= 0) return;
    
    // Calculate risk factors based on orbit and other parameters
    let baseLaunchRisk = 0.15; // 15% base risk for launches
    let baseOnOrbitRisk = 0.1; // 10% base risk for on-orbit operations
    let baseThirdPartyRisk = 0.05; // 5% base risk for third-party liability
    
    // Adjust for orbit
    if (orbit.includes("LEO")) {
      baseLaunchRisk *= 0.9; // Lower risk for LEO
      baseOnOrbitRisk *= 1.2; // Higher risk due to debris
    } else if (orbit.includes("GEO") || orbit.includes("GSO")) {
      baseLaunchRisk *= 1.2; // Higher risk for GEO launch
      baseOnOrbitRisk *= 0.9; // Lower risk in GEO
    } else if (orbit.includes("Moon") || orbit.includes("Mars") || orbit.includes("Titan") || orbit.includes("Ceres")) {
      baseLaunchRisk *= 1.5; // Much higher risk for planetary missions
      baseOnOrbitRisk *= 1.3;
      baseThirdPartyRisk *= 1.2;
    }
    
    // Adjust for mass (larger satellites have historically higher risk)
    if (mass > 200) {
      baseLaunchRisk *= 1.1;
      baseOnOrbitRisk *= 1.05;
    } else if (mass < 50) {
      baseLaunchRisk *= 0.95;
      baseOnOrbitRisk *= 0.9;
    }
    
    // Launch provider reputation adjustment
    let providerMultiplier = 1.0;
    if (launchProvider.includes("SpaceX")) {
      providerMultiplier = 0.85; // Better history
    } else if (launchProvider.includes("New")) {
      providerMultiplier = 1.3; // New providers have higher risk
    }
    
    baseLaunchRisk *= providerMultiplier;
    
    // Generate launch insurance quotes
    const launchQuotes: InsuranceQuote[] = [
      {
        type: "Standard",
        premium: Math.round(estimatedMissionValue * baseLaunchRisk),
        coverage: estimatedMissionValue,
        deductible: Math.round(estimatedMissionValue * 0.05),
        riskFactor: baseLaunchRisk,
        provider: "SpaceGuard Insurance"
      },
      {
        type: "Premium",
        premium: Math.round(estimatedMissionValue * baseLaunchRisk * 1.2),
        coverage: estimatedMissionValue * 1.1,
        deductible: Math.round(estimatedMissionValue * 0.03),
        riskFactor: baseLaunchRisk,
        provider: "Orbital Assurance Ltd."
      },
      {
        type: "Basic",
        premium: Math.round(estimatedMissionValue * baseLaunchRisk * 0.8),
        coverage: estimatedMissionValue * 0.9,
        deductible: Math.round(estimatedMissionValue * 0.1),
        riskFactor: baseLaunchRisk,
        provider: "CosmoSure Risk Management"
      }
    ];
    
    // Generate on-orbit insurance quotes
    const onOrbitQuotes: InsuranceQuote[] = [
      {
        type: "1-Year",
        premium: Math.round(estimatedMissionValue * baseOnOrbitRisk),
        coverage: estimatedMissionValue * 0.9,
        deductible: Math.round(estimatedMissionValue * 0.08),
        riskFactor: baseOnOrbitRisk,
        provider: "SpaceGuard Insurance"
      },
      {
        type: "3-Year",
        premium: Math.round(estimatedMissionValue * baseOnOrbitRisk * 2.5),
        coverage: estimatedMissionValue * 0.85,
        deductible: Math.round(estimatedMissionValue * 0.07),
        riskFactor: baseOnOrbitRisk,
        provider: "Orbital Assurance Ltd."
      },
      {
        type: "Mission Life",
        premium: Math.round(estimatedMissionValue * baseOnOrbitRisk * 4),
        coverage: estimatedMissionValue * 0.8,
        deductible: Math.round(estimatedMissionValue * 0.05),
        riskFactor: baseOnOrbitRisk,
        provider: "CosmoSure Risk Management"
      }
    ];
    
    // Generate third-party liability insurance quotes
    const liabilityLimit = Math.max(100000000, estimatedMissionValue * 2); // At least $100M or 2x mission value
    const thirdPartyQuotes: InsuranceQuote[] = [
      {
        type: "Standard Liability",
        premium: Math.round(liabilityLimit * baseThirdPartyRisk * 0.05),
        coverage: liabilityLimit,
        deductible: Math.round(liabilityLimit * 0.01),
        riskFactor: baseThirdPartyRisk,
        provider: "SpaceGuard Insurance"
      },
      {
        type: "Enhanced Liability",
        premium: Math.round(liabilityLimit * baseThirdPartyRisk * 0.08),
        coverage: liabilityLimit * 1.5,
        deductible: Math.round(liabilityLimit * 0.005),
        riskFactor: baseThirdPartyRisk,
        provider: "Global Space Liability Fund"
      }
    ];
    
    setLaunchInsurance(launchQuotes);
    setOnOrbitInsurance(onOrbitQuotes);
    setThirdPartyLiability(thirdPartyQuotes);
  }, [estimatedMissionValue, orbit, mass, payloadType, launchProvider]);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };
  
  const getTotalRecommendedCost = () => {
    if (launchInsurance.length === 0 || onOrbitInsurance.length === 0 || thirdPartyLiability.length === 0) {
      return 0;
    }
    
    // Get middle tier options as recommended
    return launchInsurance[0].premium + onOrbitInsurance[0].premium + thirdPartyLiability[0].premium;
  };
  
  const getInsurancePercentage = () => {
    if (estimatedMissionValue <= 0) return 0;
    return Math.round((getTotalRecommendedCost() / estimatedMissionValue) * 100);
  };
  
  const getRiskLevel = () => {
    const riskPercentage = getInsurancePercentage();
    if (riskPercentage < 10) return "Low Risk";
    if (riskPercentage < 20) return "Moderate Risk";
    if (riskPercentage < 30) return "High Risk";
    return "Extreme Risk";
  };
  
  const getRiskColor = () => {
    const riskPercentage = getInsurancePercentage();
    if (riskPercentage < 10) return "text-green-500";
    if (riskPercentage < 20) return "text-yellow-500";
    if (riskPercentage < 30) return "text-neutral-400";
    return "text-red-500";
  };
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium text-gray-900">
          <Shield className="w-4 h-4 mr-2 text-rail-red" />
          Insurance &amp; Risk Assessment
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Estimated insurance costs based on industry standards and mission parameters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="mt-2"><DataLabel kind="Estimate" /></div>
        <CardDescription>
          Modelled insurance options for {orbit} mission; not binding insurance quotations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3">
              <div className="text-sm text-gray-500">Estimated Mission Value</div>
              <div className="text-2xl font-mono font-bold mt-1 text-gray-900">
                {formatCurrency(estimatedMissionValue)}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                Based on {mass}kg payload to {orbit}
              </div>
            </div>
            
            <div className="bg-gray-50 p-3">
              <div className="text-sm text-gray-500">Recommended Insurance</div>
              <div className="text-2xl font-mono font-bold mt-1">
                {formatCurrency(getTotalRecommendedCost())}
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-[hsl(var(--space-gray))]">
                  {getInsurancePercentage()}% of mission value
                </div>
                <div className={`text-xs font-medium flex items-center ${getRiskColor()}`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {getRiskLevel()}
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="launch">
            <TabsList className="w-full">
              <TabsTrigger value="launch" className="flex-1">Launch</TabsTrigger>
              <TabsTrigger value="on-orbit" className="flex-1">On-Orbit</TabsTrigger>
              <TabsTrigger value="liability" className="flex-1">Liability</TabsTrigger>
            </TabsList>
            
            <TabsContent value="launch" className="mt-4">
              <div className="space-y-3">
                <div className="text-sm flex items-center text-gray-700">
                  <Briefcase className="h-4 w-4 mr-2 text-rail-red" />
                  Launch Failure Insurance Options
                </div>
                
                {launchInsurance.map((quote, index) => (
                  <div key={`launch-${index}`} className="bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{quote.type}</div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">{quote.provider}</div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Premium</div>
                        <div className="font-mono font-bold">{formatCurrency(quote.premium)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Coverage</div>
                        <div className="font-mono">{formatCurrency(quote.coverage)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Deductible</div>
                        <div className="font-mono">{formatCurrency(quote.deductible)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-[hsl(var(--space-gray))] flex justify-between items-center">
                        <span>Risk Assessment</span>
                        <span>{Math.round(quote.riskFactor * 100)}%</span>
                      </div>
                      <Progress value={quote.riskFactor * 100} className="h-1 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="on-orbit" className="mt-4">
              <div className="space-y-3">
                <div className="text-sm flex items-center text-gray-700">
                  <DollarSign className="h-4 w-4 mr-2 text-rail-red" />
                  On-Orbit Operation Insurance Options
                </div>
                
                {onOrbitInsurance.map((quote, index) => (
                  <div key={`orbit-${index}`} className="bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{quote.type}</div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">{quote.provider}</div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Premium</div>
                        <div className="font-mono font-bold">{formatCurrency(quote.premium)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Coverage</div>
                        <div className="font-mono">{formatCurrency(quote.coverage)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Deductible</div>
                        <div className="font-mono">{formatCurrency(quote.deductible)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-[hsl(var(--space-gray))] flex justify-between items-center">
                        <span>Risk Assessment</span>
                        <span>{Math.round(quote.riskFactor * 100)}%</span>
                      </div>
                      <Progress value={quote.riskFactor * 100} className="h-1 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="liability" className="mt-4">
              <div className="space-y-3">
                <div className="text-sm flex items-center text-gray-700">
                  <Shield className="h-4 w-4 mr-2 text-rail-red" />
                  Third-Party Liability Coverage
                </div>
                
                {thirdPartyLiability.map((quote, index) => (
                  <div key={`liability-${index}`} className="bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{quote.type}</div>
                      <div className="text-xs text-[hsl(var(--space-gray))]">{quote.provider}</div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Premium</div>
                        <div className="font-mono font-bold">{formatCurrency(quote.premium)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Coverage</div>
                        <div className="font-mono">{formatCurrency(quote.coverage)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[hsl(var(--space-gray))]">Deductible</div>
                        <div className="font-mono">{formatCurrency(quote.deductible)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-[hsl(var(--space-gray))] flex justify-between items-center">
                        <span>Required by most jurisdictions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}