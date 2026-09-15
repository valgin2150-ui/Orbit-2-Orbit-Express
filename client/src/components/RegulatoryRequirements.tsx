import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, FileText, AlertTriangle, Check, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DataLabel } from "./DataLabel";

interface RegulatoryRequirementsProps {
  orbit: string;
  region: string;
  payloadType: string;
  mass: number;
}

interface RegulatoryRequirement {
  id: string;
  name: string;
  agency: string;
  description: string;
  leadTimeMonths: number;
  complexity: 'low' | 'medium' | 'high';
  requiredFor: string[];
  exemptFor?: string[];
  massThreshold?: number;
  url: string;
}

export default function RegulatoryRequirements({ 
  orbit, 
  region, 
  payloadType,
  mass 
}: RegulatoryRequirementsProps) {
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [complianceScore, setComplianceScore] = useState(0);
  
  // Generate regulatory requirements based on orbit, region, payload type
  useEffect(() => {
    // Base set of regulatory requirements
    const baseRequirements: RegulatoryRequirement[] = [
      {
        id: "freq-allocation",
        name: "Radio Frequency License",
        agency: "ITU / National Authority",
        description: "International Telecommunication Union filing and national frequency allocation approval for all space-based transmitters.",
        leadTimeMonths: 12,
        complexity: 'high',
        requiredFor: ["all"],
        url: "https://www.itu.int/en/ITU-R/space/Pages/supportRegSys.aspx"
      },
      {
        id: "launch-license",
        name: "Launch License",
        agency: "National Authority",
        description: "Permission to launch from the respective national space authority.",
        leadTimeMonths: 8,
        complexity: 'medium',
        requiredFor: ["all"],
        url: "https://www.faa.gov/space/licenses_permits_registrations"
      },
      {
        id: "export-control",
        name: "Export Control Compliance",
        agency: "ITAR/EAR",
        description: "Export authorization for spacecraft components and technology transfer across national borders.",
        leadTimeMonths: 6,
        complexity: 'high',
        requiredFor: ["all"],
        url: "https://www.pmddtc.state.gov/ddtc_public"
      },
      {
        id: "remote-sensing",
        name: "Remote Sensing License",
        agency: "National Authority",
        description: "License for Earth observation and remote sensing capabilities.",
        leadTimeMonths: 9,
        complexity: 'medium',
        requiredFor: ["Earth observation", "imaging", "remote sensing"],
        exemptFor: ["cubesat"],
        massThreshold: 25,
        url: "https://www.nesdis.noaa.gov/commercial-space/licensing"
      },
      {
        id: "debris-guidelines",
        name: "Orbital Debris Mitigation Plan",
        agency: "National Authority",
        description: "Plan for spacecraft end-of-life disposal or deorbit to minimize space debris.",
        leadTimeMonths: 4,
        complexity: 'medium',
        requiredFor: ["LEO", "MEO", "GEO", "HEO", "GTO"],
        url: "https://orbitaldebris.jsc.nasa.gov/mitigation/"
      },
      {
        id: "planetary-protection",
        name: "Planetary Protection Compliance",
        agency: "COSPAR / NASA",
        description: "Measures to prevent biological contamination of celestial bodies.",
        leadTimeMonths: 14,
        complexity: 'high',
        requiredFor: ["Moon", "Mars", "Titan", "Ceres"],
        url: "https://sma.nasa.gov/sma-disciplines/planetary-protection"
      },
      {
        id: "insurance",
        name: "Liability Insurance",
        agency: "Commercial Provider",
        description: "Third-party liability insurance for launch and on-orbit operations.",
        leadTimeMonths: 3,
        complexity: 'low',
        requiredFor: ["all"],
        exemptFor: ["government"],
        url: "https://www.faa.gov/space/regulations"
      },
      {
        id: "registration",
        name: "UN Registration",
        agency: "United Nations",
        description: "Registration of the spacecraft with the United Nations Registry of Objects Launched into Outer Space.",
        leadTimeMonths: 2,
        complexity: 'low',
        requiredFor: ["all"],
        url: "https://www.unoosa.org/oosa/en/spaceobjectregister/index.html"
      }
    ];
    
    // Filter based on current selections
    let filteredRequirements = baseRequirements.filter(req => {
      // Check if required for all or for specific orbits
      const isRequiredForAll = req.requiredFor.includes("all");
      const isRequiredForOrbit = req.requiredFor.some(o => orbit.includes(o));
      
      // Check exemptions
      const isExempt = req.exemptFor && req.exemptFor.some(e => payloadType.includes(e));
      
      // Check mass threshold
      const isBelowMassThreshold = req.massThreshold ? mass < req.massThreshold : false;
      
      return (isRequiredForAll || isRequiredForOrbit) && !(isExempt && isBelowMassThreshold);
    });
    
    // Add region-specific requirements
    if (region.includes("cape") || region.includes("vandenberg")) {
      // US specific
      filteredRequirements.push({
        id: "fcc-license",
        name: "FCC License",
        agency: "Federal Communications Commission",
        description: "US radio frequency and communication license for space systems.",
        leadTimeMonths: 10,
        complexity: 'high',
        requiredFor: ["all"],
        url: "https://www.fcc.gov/licensing"
      });
    } else if (region.includes("kourou")) {
      // EU specific
      filteredRequirements.push({
        id: "esa-compliance",
        name: "ESA Safety Compliance",
        agency: "European Space Agency",
        description: "European safety and regulatory compliance for spacecraft launched from ESA facilities.",
        leadTimeMonths: 8,
        complexity: 'medium',
        requiredFor: ["all"],
        url: "https://www.esa.int/Safety_Security"
      });
    } else if (region.includes("baikonur") || region.includes("plesetsk")) {
      // Russia specific
      filteredRequirements.push({
        id: "roscosmos-approval",
        name: "Roscosmos Approval",
        agency: "Roscosmos",
        description: "Russian Federal Space Agency approval for spacecraft launched from Russian facilities.",
        leadTimeMonths: 9,
        complexity: 'high',
        requiredFor: ["all"],
        url: "http://en.roscosmos.ru/"
      });
    } else if (region.includes("india")) {
      // India specific
      filteredRequirements.push({
        id: "isro-clearance",
        name: "ISRO Security Clearance",
        agency: "Indian Space Research Organisation",
        description: "Indian security clearance for spacecraft launched from ISRO facilities.",
        leadTimeMonths: 7,
        complexity: 'medium',
        requiredFor: ["all"],
        url: "https://www.isro.gov.in/"
      });
    } else if (region.includes("china") || region.includes("jiuquan") || region.includes("xichang")) {
      // China specific
      filteredRequirements.push({
        id: "cnsa-authorization",
        name: "CNSA Authorization",
        agency: "China National Space Administration",
        description: "Chinese authorization for spacecraft launched from CNSA facilities.",
        leadTimeMonths: 11,
        complexity: 'high',
        requiredFor: ["all"],
        url: "http://www.cnsa.gov.cn/"
      });
    }
    
    // Calculate estimated compliance score based on complexity
    const maxScore = filteredRequirements.length * 100;
    const currentScore = filteredRequirements.reduce((acc, req) => {
      const basePoints = req.complexity === 'low' ? 70 : req.complexity === 'medium' ? 50 : 30;
      return acc + basePoints;
    }, 0);
    
    setComplianceScore(Math.round((currentScore / maxScore) * 100));
    setRequirements(filteredRequirements);
  }, [orbit, region, payloadType, mass]);
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return "text-green-500";
      case 'medium': return "text-yellow-500";
      case 'high': return "text-red-500";
      default: return "";
    }
  };
  
  const getEstimatedTimelineMonths = () => {
    if (requirements.length === 0) return 0;
    return Math.max(...requirements.map(r => r.leadTimeMonths));
  };
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium text-gray-900">
          <FileText className="w-4 h-4 mr-2 text-rail-red" />
          Regulatory Requirements
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Based on international regulations, national licensing requirements, and industry best practices</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="mt-2"><DataLabel kind="O2O model" /></div>
        <CardDescription>
          Planning checklist for a {orbit} mission; not legal advice or a licensing determination
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 bg-gray-50 p-3 flex flex-col justify-between">
            <div className="text-sm text-gray-500">Compliance Readiness</div>
            <div className="mt-1"><DataLabel kind="O2O model" /></div>
            <div className="flex items-center justify-between mt-2">
              <Progress value={complianceScore} className="w-2/3" />
              <span className="font-mono font-bold">{complianceScore}%</span>
            </div>
            <div className="flex mt-2 justify-between text-xs">
              <div className="flex items-center">
                {complianceScore < 50 ? (
                  <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                ) : complianceScore < 75 ? (
                  <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                ) : (
                  <Check className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span>{complianceScore < 50 ? "High Complexity" : complianceScore < 75 ? "Moderate" : "Streamlined"}</span>
              </div>
              <span className="text-[hsl(var(--space-gray))]">{requirements.length} requirements</span>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-3 flex flex-col justify-between">
            <div className="text-sm text-gray-500">Estimated Timeline</div>
            <div className="mt-1"><DataLabel kind="Estimate" /></div>
            <div className="text-2xl font-mono font-bold mt-1 text-gray-900">
              {getEstimatedTimelineMonths()} <span className="text-sm font-normal">months</span>
            </div>
            <div className="text-xs mt-2 text-gray-500">
              Pre-launch regulatory process timeline
            </div>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {requirements.map((req) => (
            <AccordionItem key={req.id} value={req.id} className="border-b border-gray-700">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center">
                    <Badge variant={req.complexity === 'low' ? "outline" : 
                                    req.complexity === 'medium' ? "secondary" : "destructive"} 
                          className="mr-2">
                      {req.complexity === 'low' ? "Basic" : 
                       req.complexity === 'medium' ? "Intermediate" : "Complex"}
                    </Badge>
                    <span>{req.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{req.leadTimeMonths} months</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-2 pl-4">
                <div>
                  <span className="text-[hsl(var(--space-gray))]">Agency:</span> {req.agency}
                </div>
                <p>{req.description}</p>
                <div className="pt-1">
                  <a href={req.url} target="_blank" rel="noopener noreferrer" 
                    className="text-rail-red hover:underline text-xs">
                    View detailed requirements →
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}