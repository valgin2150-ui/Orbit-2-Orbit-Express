import { Box, FlaskRound, Bolt, Satellite, HelpCircle } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayloadTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function PayloadTypeSelector({
  selectedType,
  onSelectType,
}: PayloadTypeSelectorProps) {
  const payloadTypes = [
    {
      id: "cubesat",
      label: "CubeSat",
      icon: <Satellite className="text-primary text-xl mb-1" />,
      description: "Standard 10kg 1U-3U nanosatellite with approximately 0.01 m³ volume."
    },
    {
      id: "experiment",
      label: "Experiment",
      icon: <FlaskRound className="text-primary text-xl mb-1" />,
      description: "Scientific experiment package averaging 50kg with 0.1 m³ volume."
    },
    {
      id: "spareParts",
      label: "Spare Parts",
      icon: <Bolt className="text-primary text-xl mb-1" />,
      description: "Station components, tools, or replacement modules (100kg, 0.5 m³)."
    },
    {
      id: "custom",
      label: "Custom",
      icon: <Box className="text-primary text-xl mb-1" />,
      description: "Specify exact mass and volume for your unique payload requirements."
    },
  ];

  return (
    <>
      {/* Mobile: compact dropdown */}
      <div className="block sm:hidden">
        <Select value={selectedType} onValueChange={onSelectType}>
          <SelectTrigger className="w-full bg-white border-gray-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {payloadTypes.map((type) => (
              <SelectItem key={type.id} value={type.id} className="focus:bg-gray-50 focus:text-rail-red">
                <span className="font-medium">{type.label}</span>
                <span className="text-gray-400 ml-1 text-xs">— {type.description.split(".")[0]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop/tablet: tile grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3">
        {payloadTypes.map((type) => (
          <div key={type.id} className="relative">
            <input
              type="radio"
              id={type.id}
              name="payloadType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={() => onSelectType(type.id)}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
            <label
              htmlFor={type.id}
              className={`block p-3 bg-gray-50 border-2 ${
                selectedType === type.id
                  ? "border-rail-red"
                  : "border-gray-200 hover:border-rail-red"
              } cursor-pointer transition-all text-center`}
            >
              {type.icon}
              <div className="flex items-center justify-center">
                <span className="block">{type.label}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 inline-flex">
                        <HelpCircle className="h-3 w-3 text-[hsl(var(--space-gray))]" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{type.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
