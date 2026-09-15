import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayloadConfig, CalculatedResults } from "@/lib/types";
import LaunchWindowPredictor from "./LaunchWindowPredictor";
import RegulatoryRequirements from "./RegulatoryRequirements";
import IntegrationTimeline from "./IntegrationTimeline";
import InsuranceCostEstimator from "./InsuranceCostEstimator";
import EnvironmentalImpact from "./EnvironmentalImpact";
import { Calendar, FileText, Clock, Shield, Leaf } from "lucide-react";

interface MissionPlanningTabsProps {
  results: CalculatedResults;
  payload: PayloadConfig;
}

export default function MissionPlanningTabs({ results, payload }: MissionPlanningTabsProps) {
  const [selectedTab, setSelectedTab] = useState("windows");
  
  // Safety check to ensure payload values are available
  const safePayload = {
    orbit: payload.orbit || "LEO",
    region: payload.region || "Cape Canaveral",
    payloadType: payload.payloadType || "custom",
    mass: payload.mass || 10,
    volume: payload.volume || 5
  };
  
  return (
    <Tabs defaultValue="windows" onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="windows" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Launch Windows</span>
        </TabsTrigger>
        <TabsTrigger value="regulatory" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Regulatory</span>
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Timeline</span>
        </TabsTrigger>
        <TabsTrigger value="insurance" className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Insurance</span>
        </TabsTrigger>
        <TabsTrigger value="environmental" className="flex items-center gap-1">
          <Leaf className="h-4 w-4" />
          <span className="hidden sm:inline">Environmental</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="windows" className="mt-0">
        <LaunchWindowPredictor 
          orbit={safePayload.orbit}
          region={safePayload.region}
        />
      </TabsContent>
      
      <TabsContent value="regulatory" className="mt-0">
        <RegulatoryRequirements 
          orbit={safePayload.orbit}
          region={safePayload.region}
          payloadType={safePayload.payloadType}
          mass={safePayload.mass}
        />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-0">
        <IntegrationTimeline
          orbit={safePayload.orbit}
          payloadType={safePayload.payloadType}
          mass={safePayload.mass}
        />
      </TabsContent>
      
      <TabsContent value="insurance" className="mt-0">
        <InsuranceCostEstimator
          orbit={safePayload.orbit}
          payloadType={safePayload.payloadType}
          mass={safePayload.mass}
          launchProvider={results && results.compatibleRockets && results.compatibleRockets.length > 0 
            ? results.compatibleRockets[0].provider 
            : undefined}
        />
      </TabsContent>
      
      <TabsContent value="environmental" className="mt-0">
        <EnvironmentalImpact
          orbit={safePayload.orbit}
          payloadType={safePayload.payloadType}
          mass={safePayload.mass}
          region={safePayload.region}
        />
      </TabsContent>
    </Tabs>
  );
}