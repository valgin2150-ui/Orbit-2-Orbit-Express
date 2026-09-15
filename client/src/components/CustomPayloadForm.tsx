import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoIcon } from "lucide-react";

interface CustomPayloadFormProps {
  mass: number;
  volume: number;
  onChangeMass: (mass: number) => void;
  onChangeVolume: (volume: number) => void;
  payloadType?: string; // Add this prop to distinguish between custom and spareParts
}

type SparePartCategory = {
  id: string;
  name: string;
  items: SparePartItem[];
};

type SparePartItem = {
  id: string;
  name: string;
  mass: number;
  volume: number;
};

export default function CustomPayloadForm({
  mass,
  volume,
  onChangeMass,
  onChangeVolume,
  payloadType = "custom" // Default to custom if not specified
}: CustomPayloadFormProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [partsList, setPartsList] = useState<{id: string, name: string, mass: number, volume: number, quantity: number}[]>([]);
  const [customDescription, setCustomDescription] = useState<string>("");
  
  // Spare part categories based on NASA ISS documentation
  const sparePartCategories: SparePartCategory[] = [
    {
      id: "structural",
      name: "Structural ORUs",
      items: [
        { id: "truss", name: "Truss Segment (ITS)", mass: 1800, volume: 14.0 },
        { id: "radiator", name: "Radiator Panel", mass: 340, volume: 2.4 },
        { id: "pmad", name: "Power Distribution Unit", mass: 98, volume: 0.64 },
        { id: "mmod", name: "MMOD Shield Panel", mass: 25, volume: 0.22 },
        { id: "dock", name: "Docking Adapter", mass: 526, volume: 3.8 },
        { id: "berthing", name: "Berthing Mechanism", mass: 312, volume: 1.6 }
      ]
    },
    {
      id: "eclss",
      name: "Environmental Control & Life Support",
      items: [
        { id: "oga", name: "Oxygen Generation Assembly", mass: 295, volume: 1.24 },
        { id: "cdra", name: "Carbon Dioxide Removal Assembly", mass: 220, volume: 0.95 },
        { id: "wrs", name: "Water Recovery System", mass: 485, volume: 2.08 },
        { id: "acm", name: "Atmosphere Control Module", mass: 156, volume: 0.42 },
        { id: "tccs", name: "Trace Contaminant Control", mass: 86, volume: 0.32 },
        { id: "urine", name: "Urine Processing Assembly", mass: 174, volume: 0.65 }
      ]
    },
    {
      id: "electronics",
      name: "Avionics & Communication",
      items: [
        { id: "mdu", name: "Multiplexer/Demultiplexer", mass: 35, volume: 0.12 },
        { id: "sband", name: "S-Band Communications", mass: 48, volume: 0.15 },
        { id: "rpcm", name: "Remote Power Controller", mass: 62, volume: 0.18 },
        { id: "iru", name: "Inertial Reference Unit", mass: 42, volume: 0.14 },
        { id: "uhf", name: "UHF Communications", mass: 29, volume: 0.11 },
        { id: "command", name: "Command & Control Computer", mass: 54, volume: 0.22 }
      ]
    },
    {
      id: "thermal",
      name: "Thermal Control System",
      items: [
        { id: "pump", name: "Pump Flow Control Assembly", mass: 112, volume: 0.36 },
        { id: "ifhx", name: "Interface Heat Exchanger", mass: 82, volume: 0.24 },
        { id: "ammonia", name: "Ammonia Tank Assembly", mass: 526, volume: 1.25 },
        { id: "fqdc", name: "Flow Quality Detection Controller", mass: 32, volume: 0.12 },
        { id: "temp", name: "Temperature Control Valve", mass: 38, volume: 0.14 },
        { id: "coldplate", name: "Cold Plate Assembly", mass: 42, volume: 0.18 }
      ]
    },
    {
      id: "mobilitysystems",
      name: "Mobility & Robotics",
      items: [
        { id: "msu", name: "Mobile Servicing Unit", mass: 1800, volume: 12.0 },
        { id: "cart", name: "Crew & Equipment Translation Aid", mass: 285, volume: 1.5 },
        { id: "leu", name: "Latching End Effector", mass: 205, volume: 0.85 },
        { id: "sfa", name: "Solar Array Rotary Joint", mass: 1100, volume: 6.28 },
        { id: "spdm", name: "Special Purpose Dexterous Manipulator", mass: 775, volume: 3.84 },
        { id: "eva", name: "EVA Mobility Unit (Spacesuit)", mass: 124, volume: 0.68 }
      ]
    },
    {
      id: "science",
      name: "Scientific Equipment",
      items: [
        { id: "freezer", name: "Science Freezer (MELFI)", mass: 295, volume: 1.05 },
        { id: "glovebox", name: "Microgravity Science Glovebox", mass: 312, volume: 1.25 },
        { id: "furnace", name: "Materials Science Research Rack", mass: 384, volume: 1.86 },
        { id: "fir", name: "Fluids Integrated Rack", mass: 356, volume: 1.74 },
        { id: "expr", name: "EXPRESS Rack Insert", mass: 94, volume: 0.42 },
        { id: "biolab", name: "Biological Experiment Laboratory", mass: 265, volume: 1.12 }
      ]
    }
  ];
  
  // Calculate total mass and volume when parts list changes
  useEffect(() => {
    if (activeTab === "parts") {
      const totalMass = partsList.reduce((sum, part) => sum + part.mass * part.quantity, 0);
      const totalVolume = partsList.reduce((sum, part) => sum + part.volume * part.quantity, 0);
      
      onChangeMass(totalMass);
      onChangeVolume(totalVolume);
    }
  }, [partsList, activeTab, onChangeMass, onChangeVolume]);
  
  // Reset to basic inputs when switching to basic tab
  useEffect(() => {
    if (activeTab === "basic" && partsList.length > 0) {
      // Just leave the current mass/volume values
    }
  }, [activeTab, partsList]);
  
  // Find the selected item details
  const getSelectedItem = () => {
    const category = sparePartCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;
    
    return category.items.find(item => item.id === selectedItem);
  };
  
  // Add item to the parts list
  const addItemToList = () => {
    const item = getSelectedItem();
    if (!item) return;
    
    // Check if item already exists in the list
    const existingItemIndex = partsList.findIndex(part => part.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedList = [...partsList];
      updatedList[existingItemIndex].quantity += quantity;
      setPartsList(updatedList);
    } else {
      // Add new item
      setPartsList([...partsList, { ...item, quantity }]);
    }
    
    // Reset selection
    setQuantity(1);
  };
  
  // Remove item from the list
  const removeItem = (itemId: string) => {
    setPartsList(partsList.filter(item => item.id !== itemId));
  };
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic">Basic Input</TabsTrigger>
          <TabsTrigger value="parts">Spare Parts Builder</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="space-y-4">
            <div>
              <label htmlFor="customDescription" className="block text-sm font-medium mb-1">
                Payload Description
              </label>
              <Input
                id="customDescription"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Enter payload description"
                className="w-full bg-white border-gray-200"
              />
            </div>
            
            <div className="bg-gray-50 p-4">
              <h3 className="text-sm font-medium mb-3 text-gray-900">Payload Specifications</h3>
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
            
            {customDescription && (
              <div className="bg-gray-50 p-4">
                <h3 className="text-sm font-medium mb-2 text-gray-900">Summary</h3>
                <div className="bg-gray-100 p-3">
                  <div className="text-xs mb-2">
                    <span className="text-[hsl(var(--space-gray))]">Description: </span>
                    <span className="font-medium">{customDescription}</span>
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
        </TabsContent>
        
        <TabsContent value="parts">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center text-gray-900">
                <InfoIcon className="w-4 h-4 mr-1 text-rail-red" />
                Spare Parts Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1 text-gray-500">
                    Category
                  </label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {sparePartCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1 text-[hsl(var(--space-gray))]">
                    Component
                  </label>
                  <Select 
                    value={selectedItem} 
                    onValueChange={setSelectedItem}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory && 
                        sparePartCategories
                          .find(cat => cat.id === selectedCategory)
                          ?.items.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedItem && getSelectedItem() && (
                <div className="mb-4 bg-gray-100 p-3">
                  <div className="text-xs font-medium mb-2 text-primary">
                    {getSelectedItem()!.name} Specifications
                  </div>
                  <div className="grid grid-cols-2 text-xs mb-3 gap-y-1">
                    <div className="text-[hsl(var(--space-gray))]">Unit Mass:</div>
                    <div className="font-medium">{getSelectedItem()!.mass} kg</div>
                    <div className="text-[hsl(var(--space-gray))]">Unit Volume:</div>
                    <div className="font-medium">{getSelectedItem()!.volume} m³</div>
                    <div className="text-[hsl(var(--space-gray))]">Total Mass:</div>
                    <div className="font-medium">{getSelectedItem()!.mass * quantity} kg</div>
                    <div className="text-[hsl(var(--space-gray))]">Total Volume:</div>
                    <div className="font-medium">{(getSelectedItem()!.volume * quantity).toFixed(2)} m³</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="block text-xs text-[hsl(var(--space-gray))]">
                        Quantity:
                      </label>
                      <span className="text-xs font-medium">{quantity}</span>
                    </div>
                    <Slider
                      value={[quantity]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(values) => setQuantity(values[0])}
                    />
                  </div>
                </div>
              )}
              
              <button
                className="w-full py-1 px-2 bg-primary text-white rounded-md text-sm disabled:opacity-50"
                disabled={!selectedItem}
                onClick={addItemToList}
              >
                Add to List
              </button>
            </div>
            
            <div className="bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">Mission Manifest</h3>
                {partsList.length > 0 && (
                  <span className="text-xs text-rail-red font-medium">
                    {partsList.length} {partsList.length === 1 ? 'component' : 'components'}
                  </span>
                )}
              </div>
              
              {partsList.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4 bg-gray-100">
                  No spare parts added to mission manifest
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {/* Group parts by category */}
                  {Array.from(new Set(partsList.map(part => {
                    const category = sparePartCategories.find(cat => 
                      cat.items.some(item => item.id === part.id)
                    );
                    return category?.id || 'other';
                  }))).map(categoryId => {
                    const category = sparePartCategories.find(cat => cat.id === categoryId);
                    const categoryParts = partsList.filter(part => {
                      const partCategory = sparePartCategories.find(cat => 
                        cat.items.some(item => item.id === part.id)
                      );
                      return partCategory?.id === categoryId;
                    });
                    
                    return (
                      <div key={categoryId} className="bg-gray-100 overflow-hidden">
                        {category && (
                          <div className="bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                            {category.name}
                          </div>
                        )}
                        <div className="p-2 space-y-1.5">
                          {categoryParts.map((part, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-2 text-sm border border-gray-200">
                              <div>
                                <span className="font-medium">{part.name}</span>
                                <span className="text-xs text-[hsl(var(--space-gray))] ml-2">
                                  x{part.quantity}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs">
                                  {part.mass * part.quantity} kg / {(part.volume * part.quantity).toFixed(2)} m³
                                </span>
                                <button
                                  className="text-red-400 hover:text-red-300 text-xs"
                                  onClick={() => removeItem(part.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="pt-3 border-t border-gray-200 mt-3 bg-gray-100 p-3">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
