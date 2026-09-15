import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Bookmark, Check, FileDown } from "lucide-react";
import { CalculatedResults, PayloadConfig } from "@/lib/types";
import MissionSummary from "./MissionSummary";
import MissionMetrics from "./MissionMetrics";
import CompatibleRockets from "./CompatibleRockets";
import InsightsCard from "./InsightsCard";
import MissionPlanningTabs from "./MissionPlanningTabs";
import OptimizedSolutions from "./OptimizedSolutions";
import ShareOptions from "./ShareOptions";
import { MissionIntakeModal } from "./MissionIntakeModal";
import { useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useMissionCompare } from "@/contexts/MissionCompareContext";
import { MethodologyNotice } from "./DataLabel";

interface ResultsPanelProps {
  results: CalculatedResults;
  onBack: () => void;
  payload?: PayloadConfig;
}

export default function ResultsPanel({ results, onBack, payload }: ResultsPanelProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showAdvancedPlanning, setShowAdvancedPlanning] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const { saveMission, savedMissions } = useMissionCompare();
  
  const missionPayload = payload || {
    payloadType: results.summary && results.summary.payloadTypeName ? 
                (results.summary.payloadTypeName.toLowerCase().includes('cubesat') ? 'cubesat' : 
                 results.summary.payloadTypeName.toLowerCase().includes('experiment') ? 'experiment' : 'custom') : 'custom',
    mass: results.summary ? results.summary.mass : 0,
    volume: results.summary ? results.summary.volume : 0,
    orbit: results.summary ? results.summary.orbitName : '',
    region: results.summary ? results.summary.regionName : ''
  };
  
  const cislunarDestinations = ["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus"];
  const isCislunar = payload?.destinationMode === "cislunar" || cislunarDestinations.includes(results.summary?.orbitName || "");
  
  return (
    <div className="lg:w-2/3 space-y-6 bg-white p-6 border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900">
        <span className="text-rail-red mr-2">
          <Rocket className="w-6 h-6" />
        </span>
        Cargo Mission Analysis
      </h2>
      <MethodologyNotice />

      <div ref={resultsRef} className="space-y-6">
        <MissionSummary summary={results.summary} />
        <MissionMetrics metrics={results.metrics} />
        <OptimizedSolutions results={results} payload={missionPayload} />
        <CompatibleRockets rockets={results.compatibleRockets} isCislunar={isCislunar} />
        <InsightsCard insights={results.insights} />
      </div>

      {/* Mission help CTA — shown after results at peak intent */}
      <div className="border-2 border-[#e3000f] p-5 bg-[#e3000f]/5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e3000f] mb-1">
          O2O Express Logistics
        </p>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Want us to handle this mission for you?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We manage the full logistics chain — launch provider selection, manifest filing, ITAR guidance, and integration scheduling. Submit a brief and we'll respond within 24 hours.
        </p>
        <button
          onClick={() => setShowIntake(true)}
          className="inline-block bg-[#e3000f] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#c0000d] transition-colors"
        >
          Submit Mission Brief →
        </button>
      </div>

      <Separator className="my-4" />
      
      <div className="space-y-6">
        <div className="flex items-center">
          <h3 className="text-xl font-semibold">Comprehensive Mission Planning</h3>
          <div className="flex-1"></div>
          <Button 
            variant="outline"
            onClick={() => setShowAdvancedPlanning(!showAdvancedPlanning)}
            className="ml-2 text-sm"
          >
            {showAdvancedPlanning ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        
        {showAdvancedPlanning && (
          <MissionPlanningTabs results={results} payload={missionPayload} />
        )}
      </div>

      <div className="pt-4 space-y-3">
        <Button
          onClick={async () => {
            if (!resultsRef.current) return;
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
              import("html2canvas"),
              import("jspdf"),
            ]);
            const canvas = await html2canvas(resultsRef.current, {
              scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Mission_Summary_${results.summary.orbitName.replace(/\s+/g, '_')}_${results.summary.mass}kg.pdf`);
          }}
          className="w-full py-6 min-h-[48px] border-2 border-rail-red bg-transparent hover:bg-rail-red text-rail-red hover:text-white font-medium transition-colors"
          variant="outline"
        >
          <FileDown className="mr-2 h-5 w-5" />
          Export Mission Summary (PDF)
        </Button>

        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <Button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 py-6 min-h-[48px]"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Modify Parameters
          </Button>
          
          <Button
            onClick={() => {
              const missionName = `${results.summary.orbitName} - ${results.summary.mass}kg`;
              saveMission(missionName, missionPayload, results);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2000);
            }}
            disabled={isSaved || savedMissions.length >= 5}
            variant="outline"
            className={`min-h-[48px] ${isSaved ? 'border-success text-success' : 'border-rail-red/50 text-rail-red hover:bg-rail-red hover:text-white'}`}
            data-testid="save-mission-button"
          >
            {isSaved ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Saved!
              </>
            ) : (
              <>
                <Bookmark className="mr-2 h-5 w-5" />
                Save to Compare
              </>
            )}
          </Button>
          
          <ShareOptions results={results} resultRef={resultsRef} />
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-medium">Share this mission:</span> "I just mapped a {results.summary.mass}kg cargo mission to {results.summary.orbitName} at ~${results.metrics.estimatedCost.toLocaleString()} on Orbit 2 Orbit Express!" — Use the Share button above to post on LinkedIn or X.
        </p>
      </div>

      <div className="text-xs text-gray-500 pt-2 text-center">
        This cargo logistics calculator works on all devices - desktop, tablet, and mobile.
        Calculate, share, and export your space cargo mission details anywhere.
      </div>

      <MissionIntakeModal isOpen={showIntake} onClose={() => setShowIntake(false)} />
    </div>
  );
}
