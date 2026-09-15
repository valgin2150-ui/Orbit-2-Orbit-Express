import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, ClipboardCheck, CalendarDays, ArrowRight } from "lucide-react";
import { DataLabel } from "./DataLabel";
import { Badge } from "@/components/ui/badge";
import { format, addMonths, addWeeks, differenceInWeeks } from "date-fns";

interface IntegrationTimelineProps {
  orbit: string;
  payloadType: string;
  mass: number;
  launchDate?: Date;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  date: Date;
  daysFromLaunch: number;
  status: 'pending' | 'in-progress' | 'complete' | 'critical';
  category: 'paperwork' | 'testing' | 'shipping' | 'integration' | 'regulatory' | 'launch';
}

export default function IntegrationTimeline({ orbit, payloadType, mass, launchDate }: IntegrationTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [targetLaunchDate, setTargetLaunchDate] = useState<Date>(launchDate || addMonths(new Date(), 12));
  
  // Generate integration timeline based on mission parameters
  useEffect(() => {
    const now = new Date();
    const end = launchDate || addMonths(now, 12); // Default to 12 months out if no launch date
    setTargetLaunchDate(end);
    
    // Calculate timeline durations based on mission complexity
    let timelineDuration = 12; // months
    
    // Adjust timeline based on orbit
    if (orbit.includes("LEO")) {
      timelineDuration = 9;
    } else if (orbit.includes("GEO") || orbit.includes("GTO")) {
      timelineDuration = 15;
    } else if (orbit.includes("Moon") || orbit.includes("Mars") || orbit.includes("Titan") || orbit.includes("Ceres")) {
      timelineDuration = 24;
    }
    
    // Adjust for payload type
    if (payloadType === "cubesat") {
      timelineDuration = Math.max(6, timelineDuration - 3);
    } else if (mass > 100) {
      timelineDuration += 3;
    }
    
    // Start date for the timeline
    const startDate = addMonths(end, -timelineDuration);
    
    // Generate milestones
    const timeline: Milestone[] = [
      {
        id: "concept",
        name: "Concept Development",
        description: "Finalize mission concept and requirements",
        date: startDate,
        daysFromLaunch: differenceInWeeks(end, startDate) * 7,
        status: "complete",
        category: "paperwork"
      },
      {
        id: "license-app",
        name: "License Applications",
        description: "Submit frequency allocation and launch licenses",
        date: addWeeks(startDate, 4),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 4)) * 7,
        status: "in-progress",
        category: "regulatory"
      },
      {
        id: "purchase",
        name: "Launch Procurement",
        description: "Secure launch vehicle and services contract",
        date: addWeeks(startDate, 6),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 6)) * 7,
        status: "in-progress",
        category: "paperwork"
      },
      {
        id: "design-review",
        name: "Preliminary Design Review",
        description: "Technical review of spacecraft design",
        date: addWeeks(startDate, 10),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 10)) * 7,
        status: "pending",
        category: "paperwork"
      },
      {
        id: "final-design",
        name: "Critical Design Review",
        description: "Final design approval before manufacturing",
        date: addWeeks(startDate, 16),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 16)) * 7,
        status: "pending",
        category: "paperwork"
      },
      {
        id: "hardware-fab",
        name: "Hardware Fabrication",
        description: "Manufacturing of spacecraft components",
        date: addWeeks(startDate, 20),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 20)) * 7,
        status: "pending",
        category: "integration"
      },
      {
        id: "software-dev",
        name: "Flight Software",
        description: "Development and testing of flight software",
        date: addWeeks(startDate, 22),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 22)) * 7,
        status: "pending",
        category: "testing"
      },
      {
        id: "vibration",
        name: "Vibration Testing",
        description: "Environmental testing for launch vibrations",
        date: addWeeks(startDate, 28),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 28)) * 7,
        status: "pending",
        category: "testing"
      },
      {
        id: "thermal-vac",
        name: "Thermal Vacuum Testing",
        description: "Space environmental simulation testing",
        date: addWeeks(startDate, 30),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 30)) * 7,
        status: "pending",
        category: "testing"
      },
      {
        id: "system-test",
        name: "System Integration Test",
        description: "Full spacecraft functional testing",
        date: addWeeks(startDate, 34),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 34)) * 7,
        status: "pending",
        category: "testing"
      },
      {
        id: "ship-launch",
        name: "Ship to Launch Site",
        description: "Transportation to launch facility",
        date: addWeeks(startDate, 38),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 38)) * 7,
        status: "pending",
        category: "shipping"
      },
      {
        id: "launch-integration",
        name: "Launch Vehicle Integration",
        description: "Mating spacecraft to launch vehicle",
        date: addWeeks(startDate, 40),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 40)) * 7,
        status: "pending",
        category: "integration"
      },
      {
        id: "final-checks",
        name: "Final Launch Readiness",
        description: "Final checks and verifications",
        date: addWeeks(startDate, 42),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 42)) * 7,
        status: "pending",
        category: "testing"
      },
      {
        id: "launch",
        name: "Launch Day",
        description: "Spacecraft launch and deployment",
        date: end,
        daysFromLaunch: 0,
        status: "pending",
        category: "launch"
      }
    ];
    
    // Add orbit-specific milestones
    if (orbit.includes("GEO") || orbit.includes("GTO")) {
      timeline.push({
        id: "geo-transfer",
        name: "GEO Transfer Planning",
        description: "Orbital transfer maneuver planning",
        date: addWeeks(startDate, 26),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 26)) * 7,
        status: "pending",
        category: "paperwork"
      });
    }
    
    if (orbit.includes("Moon") || orbit.includes("Mars") || orbit.includes("Titan") || orbit.includes("Ceres")) {
      timeline.push({
        id: "trajectory",
        name: "Trajectory Analysis",
        description: "Deep space trajectory planning and analysis",
        date: addWeeks(startDate, 12),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 12)) * 7,
        status: "pending",
        category: "paperwork"
      });
      
      timeline.push({
        id: "communication",
        name: "Deep Space Communications Test",
        description: "Testing of deep space communication systems",
        date: addWeeks(startDate, 32),
        daysFromLaunch: differenceInWeeks(end, addWeeks(startDate, 32)) * 7,
        status: "pending",
        category: "testing"
      });
    }
    
    // Sort by date
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    setMilestones(timeline);
  }, [orbit, payloadType, mass, launchDate]);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'paperwork': return "bg-gray-100 text-gray-600";
      case 'testing': return "bg-rail-red/10 text-rail-red";
      case 'shipping': return "bg-rail-red/10 text-rail-red";
      case 'integration': return "bg-green-50 text-green-700";
      case 'regulatory': return "bg-yellow-50 text-yellow-700";
      case 'launch': return "bg-red-50 text-red-700";
      default: return "bg-gray-100 text-gray-500";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return "bg-green-50 border-green-500 text-green-700";
      case 'in-progress': return "bg-rail-red/10 border-rail-red text-rail-red";
      case 'pending': return "bg-gray-100 border-gray-400 text-gray-500";
      case 'critical': return "bg-red-50 border-red-500 text-red-700";
      default: return "bg-gray-100 border-gray-400 text-gray-500";
    }
  };
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium text-gray-900">
          <CalendarDays className="w-4 h-4 mr-2 text-rail-red" />
          Integration Timeline
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Critical development and integration milestones for your mission</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="mt-2"><DataLabel kind="O2O model" /></div>
        <CardDescription>
          Targeting launch on {format(targetLaunchDate, 'MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-200">Paperwork</Badge>
              <Badge variant="outline" className="bg-rail-red/10 text-rail-red hover:bg-rail-red/20">Testing</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Integration</Badge>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Regulatory</Badge>
              <Badge variant="outline" className="bg-rail-red/10 text-rail-red hover:bg-rail-red/20">Shipping</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Launch</Badge>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-stretch">
                <div className="flex flex-col items-center mr-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(milestone.status)} z-10`}></div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 -mt-1"></div>
                  )}
                </div>
                
                <div className={`flex-1 p-3 border ${
                  milestone.status === 'critical' ? 'border-red-500' : 'border-gray-200'
                } ${milestone.status === 'complete' ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Badge variant="outline" className={`mr-2 ${getCategoryColor(milestone.category)}`}>
                          {milestone.category.charAt(0).toUpperCase() + milestone.category.slice(1)}
                        </Badge>
                        <h4 className="font-medium">{milestone.name}</h4>
                      </div>
                      <p className="text-sm text-[hsl(var(--space-gray))] mt-1">{milestone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[hsl(var(--space-gray))]">
                        {format(milestone.date, 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs mt-1 flex items-center justify-end">
                        {milestone.daysFromLaunch > 0 ? (
                          <>
                            <span className="text-[hsl(var(--space-gray))]">T-{milestone.daysFromLaunch} days</span>
                            <ArrowRight className="h-3 w-3 ml-1 text-[hsl(var(--space-gray))]" />
                          </>
                        ) : (
                          <span className="text-red-500">Launch day</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}