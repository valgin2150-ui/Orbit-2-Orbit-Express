import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PayloadSelectorProps {
  quantity: number;
  onChangeQuantity: (quantity: number) => void;
  onChangeMass: (mass: number) => void;
  onChangeVolume: (volume: number) => void;
  payloadType: string; // "cubesat" or "experiment"
}

// Specification for a payload size
interface PayloadSize {
  id: string;
  name: string;
  massPerUnit: number;
  volumePerUnit: number;
  type: string;
}

const PayloadSelector = ({ 
  quantity, 
  onChangeQuantity,
  onChangeMass,
  onChangeVolume,
  payloadType
}: PayloadSelectorProps) => {
  // All payload form factors and specs
  const payloadSizes: PayloadSize[] = [
    // CubeSat sizes
    { id: "1U", name: "1U CubeSat", massPerUnit: 1.33, volumePerUnit: 0.001, type: "cubesat" },
    { id: "2U", name: "2U CubeSat", massPerUnit: 2.66, volumePerUnit: 0.002, type: "cubesat" },
    { id: "3U", name: "3U CubeSat", massPerUnit: 4, volumePerUnit: 0.003, type: "cubesat" },
    { id: "6U", name: "6U CubeSat", massPerUnit: 12, volumePerUnit: 0.006, type: "cubesat" },
    
    // Experiment packages
    { id: "mini", name: "Mini Experiment", massPerUnit: 5, volumePerUnit: 0.01, type: "experiment" },
    { id: "standard", name: "Standard Experiment", massPerUnit: 25, volumePerUnit: 0.05, type: "experiment" },
    { id: "large", name: "Large Experiment", massPerUnit: 50, volumePerUnit: 0.1, type: "experiment" },
    { id: "suite", name: "Experiment Suite", massPerUnit: 75, volumePerUnit: 0.15, type: "experiment" }
  ];
  
  // Set default size based on payload type
  const [selectedSize, setSelectedSize] = useState(
    payloadType === "cubesat" ? "3U" : "standard"
  );
  
  // Get the filtered list of payload sizes based on type
  const getPayloadSizesForType = () => {
    return payloadSizes.filter(size => size.type === payloadType);
  };
  
  // Get the current payload specifications based on selected size
  const getCurrentPayloadSpecs = () => {
    return payloadSizes.find(size => size.id === selectedSize) || 
           (payloadType === "cubesat" ? payloadSizes[2] : payloadSizes[5]); // Default to 3U or Standard
  };
  
  // Update total mass and volume based on quantity and size
  const updateTotals = (newQuantity: number, sizeId: string = selectedSize) => {
    const specs = payloadSizes.find(size => size.id === sizeId) || 
                  (payloadType === "cubesat" ? payloadSizes[2] : payloadSizes[5]); // Default to 3U or Standard
                  
    const totalMass = Number((specs.massPerUnit * newQuantity).toFixed(2));
    const totalVolume = Number((specs.volumePerUnit * newQuantity).toFixed(3));
    
    onChangeMass(totalMass);
    onChangeVolume(totalVolume);
  };
  
  // Handle quantity change
  const handleQuantityChange = (values: number[]) => {
    const newQuantity = values[0];
    onChangeQuantity(newQuantity);
    updateTotals(newQuantity);
  };
  
  // Handle size change
  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    updateTotals(quantity, value);
  };
  
  const specs = getCurrentPayloadSpecs();

  // Initialize the component
  useEffect(() => {
    // Set initial values
    updateTotals(quantity, selectedSize);
  }, []);

  // Detect payload type changes and update the size
  useEffect(() => {
    // Reset size when payload type changes
    const defaultSize = payloadType === "cubesat" ? "3U" : "standard";
    setSelectedSize(defaultSize);
    updateTotals(quantity, defaultSize);
  }, [payloadType]);

  return (
    <div className="space-y-4 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          {payloadType === "cubesat" ? "CubeSat Configuration" : "Experiment Configuration"}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {payloadType === "cubesat" 
                    ? "Configure the size and quantity of CubeSats for your mission" 
                    : "Configure the size and quantity of experiment modules for your mission"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payload-size" className="text-xs text-[hsl(var(--space-gray))]">
            {payloadType === "cubesat" ? "CubeSat Size" : "Experiment Size"}
          </Label>
          <Select value={selectedSize} onValueChange={handleSizeChange}>
            <SelectTrigger id="payload-size" className="w-full mt-1">
              <SelectValue placeholder={`Select ${payloadType === "cubesat" ? "CubeSat" : "Experiment"} Size`} />
            </SelectTrigger>
            <SelectContent>
              {getPayloadSizesForType().map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name} ({size.massPerUnit}kg, {size.volumePerUnit}m³)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="payload-quantity" className="text-xs text-[hsl(var(--space-gray))]">
              Quantity: {quantity}
            </Label>
            <span className="text-xs font-mono">
              {(specs.massPerUnit * quantity).toFixed(2)}kg | {(specs.volumePerUnit * quantity).toFixed(3)}m³
            </span>
          </div>
          <Slider
            id="payload-quantity"
            min={1}
            max={payloadType === "cubesat" ? 12 : 6}
            step={1}
            value={[quantity]}
            onValueChange={handleQuantityChange}
            className="mt-2"
          />
        </div>
      </div>
      
      <div className="text-xs text-[hsl(var(--space-gray))] mt-2">
        Total launch configuration: {quantity} × {specs.name}
      </div>
    </div>
  );
};

export default PayloadSelector;