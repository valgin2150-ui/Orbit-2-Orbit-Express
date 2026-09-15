import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Rocket, Calendar, ArrowRight, Mail, ExternalLink } from "lucide-react";
import { CalculatedResults, Rocket as RocketType, PayloadConfig } from "@/lib/types";
import { format, addDays, addWeeks } from "date-fns";
import { DataLabel } from "./DataLabel";

interface OptimizedSolutionsProps {
  results: CalculatedResults;
  payload: PayloadConfig;
}

interface OptimizedSolution {
  rocket: RocketType;
  launchSite: string;
  estimatedDate: Date;
  cost: number;
  timeToLaunch: number; // days
  availability: 'immediate' | 'soon' | 'scheduled' | 'delayed';
  notes: string;
}

export default function OptimizedSolutions({ results, payload }: OptimizedSolutionsProps) {
  const [selectedTab, setSelectedTab] = useState("expeditious");
  const usesCislunarModel = payload.destinationMode === "cislunar" || ["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus"].includes(payload.orbit);
  
  // Generate optimized solutions based on the available rockets
  const generateOptimizedSolutions = () => {
    const expeditious: OptimizedSolution[] = [];
    const costEffective: OptimizedSolution[] = [];
    
    if (!results.compatibleRockets || results.compatibleRockets.length === 0) {
      return { expeditious, costEffective };
    }
    
    // Get all rockets
    const allRockets = [...results.compatibleRockets];
    
    // For expeditious solutions, sort by availability date
    const expeditiousRockets = [...allRockets].sort((a, b) => {
      // Safely create dates or use defaults if invalid
      let dateA, dateB;
      try {
        dateA = a.nextAvailable ? new Date(a.nextAvailable) : new Date();
      } catch (e) {
        dateA = new Date(); // Default to current date if invalid
      }
      try {
        dateB = b.nextAvailable ? new Date(b.nextAvailable) : new Date();
      } catch (e) {
        dateB = new Date(); // Default to current date if invalid
      }
      return dateA.getTime() - dateB.getTime();
    });
    
    // For cost-effective, sort by cost per kg
    const costEffectiveRockets = [...allRockets].sort((a, b) => {
      return a.costPerKg - b.costPerKg;
    });
    
    // Generate launch site map based on regions
    const getLaunchSite = (rocket: RocketType) => {
      // Get the first region from the rocket's regions array
      const region = rocket.regions && rocket.regions.length > 0 ? rocket.regions[0] : "any";
      
      // Map region to specific launch sites
      switch (region) {
        case "us":
          return "Kennedy Space Center, Florida";
        case "cape_canaveral":
          return "Cape Canaveral, Florida";
        case "vandenberg":
          return "Vandenberg SFB, California";
        case "kourou":
          return "Kourou, French Guiana (ESA)";
        case "baikonur":
          return "Baikonur Cosmodrome, Kazakhstan";
        case "sriharikota":
          return "Satish Dhawan Space Centre, India";
        case "jiuquan":
        case "china":
          return "Jiuquan Satellite Launch Center, China";
        default:
          // If the region is "any" or not recognized, try to match with payload region
          if (payload.region && payload.region !== "any") {
            return mapRegionToLaunchSite(payload.region);
          }
          return "Launch site to be determined";
      }
    };
    
    // Map region code to human-readable launch site
    const mapRegionToLaunchSite = (region: string) => {
      switch (region) {
        case "cape_canaveral":
          return "Cape Canaveral, Florida";
        case "kennedy":
          return "Kennedy Space Center, Florida";
        case "vandenberg":
          return "Vandenberg SFB, California";
        case "wallops":
          return "Wallops Flight Facility, Virginia";
        case "kourou":
          return "Kourou, French Guiana (ESA)";
        case "baikonur":
          return "Baikonur Cosmodrome, Kazakhstan";
        case "plesetsk":
          return "Plesetsk Cosmodrome, Russia";
        case "sriharikota":
          return "Satish Dhawan Space Centre, India";
        case "jiuquan":
          return "Jiuquan Satellite Launch Center, China";
        case "xichang":
          return "Xichang Satellite Launch Center, China";
        case "tanegashima":
          return "Tanegashima Space Center, Japan";
        default:
          return "Launch site to be determined";
      }
    };
    
    // Generate expeditious solutions
    for (let i = 0; i < Math.min(3, expeditiousRockets.length); i++) {
      const rocket = expeditiousRockets[i];
      
      // Safely create launch date with minimum 4-month requirement
      let launchDate;
      try {
        const providedDate = rocket.nextAvailable ? new Date(rocket.nextAvailable) : addDays(new Date(), 120);
        const minimumDate = addDays(new Date(), 120); // 4 months minimum
        
        // Use the later of the provider's date or our 4-month minimum
        launchDate = providedDate > minimumDate ? providedDate : minimumDate;
        
        // Validate the date
        if (isNaN(launchDate.getTime())) {
          launchDate = minimumDate;
        }
      } catch (e) {
        launchDate = addDays(new Date(), 120); // Default to 4 months from now if error
      }
      
      // Calculate days until launch
      const now = new Date();
      const daysToLaunch = Math.max(0, Math.round((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Determine availability
      let availability: 'immediate' | 'soon' | 'scheduled' | 'delayed' = 'scheduled';
      if (daysToLaunch < 30) {
        availability = 'immediate';
      } else if (daysToLaunch < 90) {
        availability = 'soon';
      } else if (daysToLaunch > 180) {
        availability = 'delayed';
      }
      
      expeditious.push({
        rocket,
        launchSite: getLaunchSite(rocket),
        estimatedDate: launchDate,
        cost: Math.round(rocket.costPerKg * payload.mass),
        timeToLaunch: daysToLaunch,
        availability,
        notes: getExpeditiousNotes(rocket, daysToLaunch)
      });
    }
    
    // Generate cost-effective solutions
    for (let i = 0; i < Math.min(3, costEffectiveRockets.length); i++) {
      const rocket = costEffectiveRockets[i];
      
      // Safely create launch date with minimum 4-month requirement
      let launchDate;
      try {
        const providedDate = rocket.nextAvailable ? new Date(rocket.nextAvailable) : addDays(new Date(), 120);
        const minimumDate = addDays(new Date(), 120); // 4 months minimum
        
        // Use the later of the provider's date or our 4-month minimum
        launchDate = providedDate > minimumDate ? providedDate : minimumDate;
        
        // Validate the date
        if (isNaN(launchDate.getTime())) {
          launchDate = minimumDate;
        }
      } catch (e) {
        launchDate = addDays(new Date(), 120); // Default to 4 months from now if error
      }
      
      // Calculate days until launch
      const now = new Date();
      const daysToLaunch = Math.max(0, Math.round((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Determine availability
      let availability: 'immediate' | 'soon' | 'scheduled' | 'delayed' = 'scheduled';
      if (daysToLaunch < 30) {
        availability = 'immediate';
      } else if (daysToLaunch < 90) {
        availability = 'soon';
      } else if (daysToLaunch > 180) {
        availability = 'delayed';
      }
      
      costEffective.push({
        rocket,
        launchSite: getLaunchSite(rocket),
        estimatedDate: launchDate,
        cost: Math.round(rocket.costPerKg * payload.mass),
        timeToLaunch: daysToLaunch,
        availability,
        notes: getCostEffectiveNotes(rocket)
      });
    }
    
    return { expeditious, costEffective };
  };
  
  const getExpeditiousNotes = (rocket: RocketType, daysToLaunch: number) => {
    if (daysToLaunch < 30) {
      return `Rapid integration required with ${rocket.name}. Expedited regulatory approvals available.`;
    } else if (daysToLaunch < 90) {
      return `Standard integration timeline for ${rocket.name}. Pre-launch testing schedule optimized.`;
    } else {
      return `Launch manifest for ${rocket.name} allows for complete mission preparation and testing.`;
    }
  };
  
  const getCostEffectiveNotes = (rocket: RocketType) => {
    const costSaving = Math.round((1 - (rocket.costPerKg / 25000)) * 100);
    if (costSaving > 40) {
      return `Exceptional value with ${rocket.costPerKg.toLocaleString()} per kg. Up to ${costSaving}% below industry average.`;
    } else if (costSaving > 20) {
      return `Good cost efficiency at ${rocket.costPerKg.toLocaleString()} per kg. ${costSaving}% below industry average.`;
    } else {
      return `Standard pricing of ${rocket.costPerKg.toLocaleString()} per kg with proven reliability.`;
    }
  };
  
  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'immediate':
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-100">Immediate</Badge>;
      case 'soon':
        return <Badge className="bg-rail-red/10 text-rail-red hover:bg-rail-red/20">Near-term</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Scheduled</Badge>;
      case 'delayed':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">Future</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
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
  
  const { expeditious, costEffective } = generateOptimizedSolutions();
  
  // Check if user needs faster than 4 months
  const needsFasterLaunch = expeditious.some(solution => solution.timeToLaunch < 120) || 
                           costEffective.some(solution => solution.timeToLaunch < 120);
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-medium text-gray-900">
          <Rocket className="w-5 h-5 mr-2 text-rail-red" />
          Optimized Launch Solutions
        </CardTitle>
        <CardDescription className="text-gray-500">
          Recommended options based on your mission requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Notice for faster launch requirements */}
        <div className="mb-6 bg-rail-red/5 border border-rail-red/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-rail-red mt-0.5" />
            </div>
            <div>
              <h4 className="font-medium text-rail-red mb-2">Launch Timeline Notice</h4>
              <p className="text-sm text-gray-600 mb-3">
                All launch solutions shown are scheduled for 4+ months from today to ensure proper mission planning, regulatory approvals, and payload integration.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Need a launch in less than 4 months?</strong> We may have expedited options available through our priority launch management services.
              </p>
              <a 
                href="mailto:vlad@orbit2orbitexpress.com?subject=Expedited Launch Request - Less Than 4 Months"
                className="inline-flex items-center gap-2 text-rail-red hover:text-rail-redDark text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                Contact us for expedited options
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        <Tabs defaultValue="expeditious" onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="expeditious" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Fastest Launch</span>
            </TabsTrigger>
            <TabsTrigger value="cost-effective" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Most Economical</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expeditious" className="mt-0 space-y-4">
            <div className="text-sm text-gray-500">
              Options optimized for earliest possible launch date
            </div>
            
            {expeditious.length > 0 ? (
              expeditious.map((solution, index) => (
                <div key={`exp-${index}`} className="bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg text-gray-900">{solution.rocket.name}</div>
                    {getAvailabilityBadge(solution.availability)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div className="text-xs text-gray-500">Provider</div>
                      <div className="text-gray-900">{solution.rocket.provider}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Launch Site</div>
                      <div className="text-gray-900">{solution.launchSite}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Estimated Launch</div>
                      <div className="mt-1"><DataLabel kind="O2O model" /></div>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="h-3 w-3 mr-1 text-rail-red" />
                        {format(solution.estimatedDate, 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Timeframe</div>
                      <div className="mt-1"><DataLabel kind="O2O model" /></div>
                      <div className="flex items-center text-gray-900">
                        <Clock className="h-3 w-3 mr-1 text-rail-red" />
                        T-{solution.timeToLaunch} days
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-2 border border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Estimated Cost</div>
                      <div className="mt-1"><DataLabel kind="O2O model" /></div>
                      <div className="font-mono font-bold text-gray-900">{formatCurrency(solution.cost)}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <a 
                        href={`mailto:vlad@orbit2orbitexpress.com?subject=Launch Management - ${solution.rocket.provider} ${solution.rocket.name} Expeditious Launch`}
                        className="text-rail-red hover:text-rail-redDark text-sm flex items-center"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Orbit2OrbitExpress - Contact Us
                      </a>
                      <a 
                        href={solution.rocket.contactUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
                      >
                        Direct to Provider
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {solution.notes}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-4 text-center text-gray-500">
                No expeditious solutions available for the given parameters.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cost-effective" className="mt-0 space-y-4">
            <div className="text-sm text-gray-500">
              Options optimized for lowest overall mission cost
            </div>
            
            {costEffective.length > 0 ? (
              costEffective.map((solution, index) => (
                <div key={`cost-${index}`} className="bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg text-gray-900">{solution.rocket.name}</div>
                    {getAvailabilityBadge(solution.availability)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <div className="text-xs text-gray-500">Provider</div>
                      <div className="text-gray-900">{solution.rocket.provider}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Launch Site</div>
                      <div className="text-gray-900">{solution.launchSite}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rideshare $/kg</div>
                      <div className="mt-1"><DataLabel kind={usesCislunarModel ? "O2O model" : "Published figure"} /></div>
                      <div className="font-mono text-gray-900">${solution.rocket.costPerKg.toLocaleString()}/kg</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Estimated Launch</div>
                      <div className="mt-1"><DataLabel kind="O2O model" /></div>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="h-3 w-3 mr-1 text-rail-red" />
                        {format(solution.estimatedDate, 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-2 border border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Total Cost Estimate</div>
                      <div className="mt-1"><DataLabel kind="O2O model" /></div>
                      <div className="font-mono font-bold text-gray-900">{formatCurrency(solution.cost)}</div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <a 
                        href={`mailto:vlad@orbit2orbitexpress.com?subject=Launch Management - ${solution.rocket.provider} ${solution.rocket.name} Cost-Effective Launch`}
                        className="text-rail-red hover:text-rail-redDark text-sm flex items-center"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Orbit2OrbitExpress - Contact Us
                      </a>
                      <a 
                        href={solution.rocket.contactUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
                      >
                        Direct to Provider
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {solution.notes}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-4 text-center text-gray-500">
                No cost-effective solutions available for the given parameters.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}