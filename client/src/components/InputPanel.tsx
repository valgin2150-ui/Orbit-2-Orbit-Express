import { useState } from "react";
import { PayloadConfig, DestinationMode } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calculator, InfoIcon, Satellite, FlaskRound, Bolt, Box, Share2, Check } from "lucide-react";
import PayloadTypeSelector from "./PayloadTypeSelector";
import CustomPayloadForm from "./CustomPayloadForm";
import CustomPayloadInput from "./CustomPayloadInput";
import PayloadSelector from "./PayloadSelector";
import OrbitSelector from "./OrbitSelector";
import RegionSelector from "./RegionSelector";

const payloadVisuals: Record<string, { icon: typeof Satellite; label: string; specs: string; color: string }> = {
  cubesat: { icon: Satellite, label: "CubeSat (1U–3U)", specs: "~10 kg · 0.01 m³ · Nanosatellite class", color: "text-blue-600" },
  experiment: { icon: FlaskRound, label: "Science Experiment", specs: "~50 kg · 0.1 m³ · Pressurized module", color: "text-emerald-600" },
  spareParts: { icon: Bolt, label: "Spare Parts / Components", specs: "~100 kg · 0.5 m³ · Cargo manifest", color: "text-amber-600" },
  custom: { icon: Box, label: "Custom Payload", specs: "User-defined mass & volume", color: "text-purple-600" },
};

function ShareConfigButton({ payloadType, orbit, region }: { payloadType: string; orbit: string; region: string }) {
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    const params = new URLSearchParams({ type: payloadType, orbit, region });
    const url = `${window.location.origin}?config=${btoa(params.toString())}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleShare}
            className="flex-shrink-0 w-14 min-h-[56px] border-2 border-gray-300 hover:border-rail-red text-gray-500 hover:text-rail-red flex items-center justify-center transition-colors"
            aria-label="Share configuration"
          >
            {copied ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{copied ? "Link copied!" : "Copy shareable link"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface InputPanelProps {
  onCalculate: (payload: PayloadConfig) => void;
}

export default function InputPanel({ onCalculate }: InputPanelProps) {
  const [payloadType, setPayloadType] = useState<string>("cubesat");
  const [customMass, setCustomMass] = useState<number>(0);
  const [customVolume, setCustomVolume] = useState<number>(0);
  const [sparePartsMass, setSparePartsMass] = useState<number>(100);
  const [sparePartsVolume, setSparePartsVolume] = useState<number>(0.5);
  const [cubesatQuantity, setCubesatQuantity] = useState<number>(3);
  const [cubesatMass, setCubesatMass] = useState<number>(12);
  const [cubesatVolume, setCubesatVolume] = useState<number>(0.009);
  const [selectedOrbit, setSelectedOrbit] = useState<string>("LEO");
  const [selectedRegion, setSelectedRegion] = useState<string>("any");
  const [destinationMode, setDestinationMode] = useState<DestinationMode>("leo");

  const handleCalculate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const payloadConfig: PayloadConfig = {
      payloadType,
      mass: getMassForCurrentType(),
      volume: getVolumeForCurrentType(),
      orbit: selectedOrbit,
      region: selectedRegion,
      destinationMode,
    };
    
    onCalculate(payloadConfig);
  };

  const getMassForCurrentType = (): number => {
    switch (payloadType) {
      case "custom": return customMass;
      case "spareParts": return sparePartsMass;
      case "cubesat": return cubesatMass;
      default: return getDefaultMassForType(payloadType);
    }
  };
  
  const getVolumeForCurrentType = (): number => {
    switch (payloadType) {
      case "custom": return customVolume;
      case "spareParts": return sparePartsVolume;
      case "cubesat": return cubesatVolume;
      default: return getDefaultVolumeForType(payloadType);
    }
  };

  const getDefaultMassForType = (type: string): number => {
    switch (type) {
      case "cubesat": return 10;
      case "experiment": return 50;
      case "spareParts": return 100;
      default: return 0;
    }
  };

  const getDefaultVolumeForType = (type: string): number => {
    switch (type) {
      case "cubesat": return 0.01;
      case "experiment": return 0.1;
      case "spareParts": return 0.5;
      default: return 0;
    }
  };

  return (
    <div className="w-full space-y-6 bg-white p-4 sm:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-rail-red"></div>
        <h2 className="text-lg font-medium text-gray-900">
          Payload Configuration
        </h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <label className="block text-sm font-medium mb-1">
            Payload Type
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Choose your payload type or specify custom parameters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <PayloadTypeSelector
          selectedType={payloadType}
          onSelectType={setPayloadType}
        />

        {payloadVisuals[payloadType] && (() => {
          const vis = payloadVisuals[payloadType];
          const PayloadIcon = vis.icon;
          return (
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 mt-3 transition-all">
              <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center border-2 border-dashed border-gray-300 ${vis.color}`}>
                <PayloadIcon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{vis.label}</p>
                <p className="text-xs text-gray-500">{vis.specs}</p>
              </div>
            </div>
          );
        })()}
      </div>

      {payloadType === "custom" && (
        <CustomPayloadInput
          mass={customMass}
          volume={customVolume}
          onChangeMass={setCustomMass}
          onChangeVolume={setCustomVolume}
        />
      )}
      
      {payloadType === "spareParts" && (
        <CustomPayloadForm
          mass={sparePartsMass}
          volume={sparePartsVolume}
          onChangeMass={setSparePartsMass}
          onChangeVolume={setSparePartsVolume}
        />
      )}
      
      {(payloadType === "cubesat" || payloadType === "experiment") && (
        <PayloadSelector
          quantity={payloadType === "cubesat" ? cubesatQuantity : customMass > 0 ? Math.round(customMass / 25) : 2}
          onChangeQuantity={payloadType === "cubesat" ? setCubesatQuantity : (q) => {
            // For experiments, we'll calculate based on quantity and standard size
            const mass = q * 25;
            const volume = q * 0.05;
            setCustomMass(mass);
            setCustomVolume(volume);
          }}
          onChangeMass={payloadType === "cubesat" ? setCubesatMass : setCustomMass}
          onChangeVolume={payloadType === "cubesat" ? setCubesatVolume : setCustomVolume}
          payloadType={payloadType}
        />
      )}

      <div className="my-6 border-t border-gray-700"></div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center">
          Destination
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Choose Earth orbit or cislunar destinations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
        
        <OrbitSelector
          selectedOrbit={selectedOrbit}
          onSelectOrbit={setSelectedOrbit}
          destinationMode={destinationMode}
          onDestinationModeChange={setDestinationMode}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center">
          <label className="block text-sm font-medium mb-1">
            Preferred Launch Region
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Choose a preferred region for your launch provider</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <RegionSelector
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />
      </div>

      <div className="pt-2 flex gap-2">
        <button 
          onClick={handleCalculate}
          type="button"
          className="flex-1 py-6 min-h-[56px] border-2 border-rail-red bg-transparent hover:bg-rail-red text-rail-red hover:text-white font-medium flex items-center justify-center transition-colors"
        >
          <Calculator className="mr-2 h-5 w-5" />
          Calculate Launch Logistics
        </button>
        <ShareConfigButton
          payloadType={payloadType}
          orbit={selectedOrbit}
          region={selectedRegion}
        />
      </div>
    </div>
  );
}
