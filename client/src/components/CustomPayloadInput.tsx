import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomPayloadInputProps {
  mass: number;
  volume: number;
  onChangeMass: (mass: number) => void;
  onChangeVolume: (volume: number) => void;
}

export default function CustomPayloadInput({
  mass,
  volume,
  onChangeMass,
  onChangeVolume,
}: CustomPayloadInputProps) {
  const [description, setDescription] = useState<string>("");

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="customDescription" className="block text-sm font-medium mb-1">
          Payload Description
        </label>
        <Input
          id="customDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter payload description"
          className="w-full bg-white border-gray-200"
        />
      </div>
      
      <div className="bg-gray-50 p-4">
        <h3 className="text-sm font-medium mb-3 text-gray-900">Custom Payload Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mass" className="block text-sm font-medium mb-1 text-gray-700">
              Mass (kg)
            </label>
            <div className="relative">
              <Input
                id="mass"
                type="number"
                value={mass}
                onChange={(e) => onChangeMass(Number(e.target.value))}
                placeholder="Enter mass"
                className="w-full bg-white border-gray-200 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                kg
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="volume" className="block text-sm font-medium mb-1 text-gray-700">
              Volume (m³)
            </label>
            <div className="relative">
              <Input
                id="volume"
                type="number"
                value={volume}
                onChange={(e) => onChangeVolume(Number(e.target.value))}
                placeholder="Enter volume"
                className="w-full bg-white border-gray-200 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                m³
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {description && (
        <div className="bg-gray-50 p-4">
          <h3 className="text-sm font-medium mb-2 text-gray-900">Summary</h3>
          <div className="bg-gray-100 p-3">
            <div className="text-xs mb-2">
              <span className="text-[hsl(var(--space-gray))]">Description: </span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[hsl(var(--space-gray))]">Total Mass</div>
                <div className="text-lg font-medium">{mass} <span className="text-xs">kg</span></div>
              </div>
              <div>
                <div className="text-xs text-[hsl(var(--space-gray))]">Total Volume</div>
                <div className="text-lg font-medium">{volume.toFixed(2)} <span className="text-xs">m³</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}