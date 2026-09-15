import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Orbit, DestinationMode } from "@/lib/types";
import { orbitGroups as fallbackOrbitGroups } from "@/lib/data";
import { JsonOrbitDTO } from "@/lib/calculateLogistics";
import { Globe, Moon, Info } from "lucide-react";

const ABBR_TO_ID: Record<string, string> = {
  TLI: "Moon",
  MTO: "Mars",
  "L1/L2": "L1L2",
};

function buildOrbitGroupsFromJson(data: JsonOrbitDTO[]) {
  const groupMap: Record<string, Orbit[]> = {};
  for (const orbit of data) {
    const id = ABBR_TO_ID[orbit.abbreviation] ?? orbit.abbreviation;
    const group: string = orbit.category;
    if (!groupMap[group]) groupMap[group] = [];
    groupMap[group].push({ id, name: orbit.name, deltaV: orbit.deltaVKms });
  }
  const order = ["Earth Orbits", "Special Earth Orbits", "Deep Space"];
  return order.filter((g) => groupMap[g]).map((g) => ({ name: g, orbits: groupMap[g] }));
}

const orbitTooltips: Record<string, { short: string; detail: string }> = {
  VLEO: {
    short: "Very Low Earth Orbit (200–400 km)",
    detail: "Used for high-resolution imaging and short-term missions. Requires frequent reboosting due to atmospheric drag. Popular for Earth-observation constellations.",
  },
  LEO: {
    short: "Low Earth Orbit (400–2,000 km)",
    detail: "Home to the ISS and Starlink. Most accessible and cost-effective orbit for satellites. Over 80% of all active satellites operate in LEO.",
  },
  MEO: {
    short: "Medium Earth Orbit (2,000–35,786 km)",
    detail: "Used by GPS, Galileo, and navigation satellite constellations. Offers a balance between coverage area and signal latency.",
  },
  HEO: {
    short: "High Earth Orbit",
    detail: "Highly elliptical orbits used for communications coverage over high-latitude regions. Molniya orbits are a common HEO type.",
  },
  GEO: {
    short: "Geostationary Orbit (35,786 km)",
    detail: "Satellite stays fixed over one point on Earth. Used for TV broadcast, weather monitoring, and telecommunications. One of the most commercially valuable orbits.",
  },
  GSO: {
    short: "Geosynchronous Orbit",
    detail: "Similar to GEO but can be inclined relative to the equator. Completes one orbit in exactly 24 hours, matching Earth's rotation period.",
  },
  SSO: {
    short: "Sun-Synchronous Orbit",
    detail: "Passes over the same point at the same local solar time each day. Ideal for Earth observation, mapping, and environmental monitoring satellites.",
  },
  PO: {
    short: "Polar Orbit",
    detail: "Passes over both poles, covering the entire Earth surface over time. Used for weather forecasting, reconnaissance, and global monitoring missions.",
  },
  GTO: {
    short: "Geostationary Transfer Orbit",
    detail: "An elliptical orbit used as a stepping stone to reach GEO. Launchers place satellites into GTO, which then use onboard propulsion for final GEO insertion.",
  },
  Moon: {
    short: "Lunar Missions (~14 km/s delta-v)",
    detail: "Includes orbital insertion or surface landing via specialized landers. Transit time is about 3 days. Artemis program is driving renewed lunar interest.",
  },
  Mars: {
    short: "Mars Transfer (~18 km/s delta-v)",
    detail: "Transit takes about 7 months via Hohmann transfer orbit. Launch windows open roughly every 26 months when Earth and Mars align.",
  },
  Ceres: {
    short: "Ceres (~20 km/s delta-v)",
    detail: "The largest object in the asteroid belt. Potential resource mining target. Missions require multi-year transit through the main asteroid belt.",
  },
  Europa: {
    short: "Europa (~16 km/s delta-v)",
    detail: "Jupiter's moon Europa may harbor a subsurface ocean beneath its icy crust. One of the most promising places to search for extraterrestrial life.",
  },
  Titan: {
    short: "Titan (~22 km/s delta-v)",
    detail: "Saturn's largest moon with a thick nitrogen atmosphere and methane lakes. Requires 7+ years of transit. NASA's Dragonfly mission targets Titan.",
  },
  Enceladus: {
    short: "Enceladus (~20 km/s delta-v)",
    detail: "Saturn's icy moon with active geysers shooting water vapor into space. Strong candidate for harboring microbial life in its subsurface ocean.",
  },
};

interface OrbitSelectorProps {
  selectedOrbit: string;
  onSelectOrbit: (orbit: string) => void;
  destinationMode?: DestinationMode;
  onDestinationModeChange?: (mode: DestinationMode) => void;
}

const leoOrbits = ["VLEO", "LEO", "MEO", "HEO", "GEO", "GSO", "SSO", "PO", "GTO", "Molniya", "Tundra"];
const cislunarOrbits = ["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus", "L1L2"];

export default function OrbitSelector({
  selectedOrbit,
  onSelectOrbit,
  destinationMode = "leo",
  onDestinationModeChange,
}: OrbitSelectorProps) {
  const [visuallySelectedOrbit, setVisuallySelectedOrbit] = useState<string>(selectedOrbit);
  const [orbitGroups, setOrbitGroups] = useState(fallbackOrbitGroups);

  useEffect(() => {
    fetch("/data/orbits.json")
      .then((r) => r.json() as Promise<JsonOrbitDTO[]>)
      .then((data) => {
        const groups = buildOrbitGroupsFromJson(data);
        if (groups.length > 0) setOrbitGroups(groups);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setVisuallySelectedOrbit(selectedOrbit);
  }, [selectedOrbit]);

  const findOrbitById = (id: string): Orbit | undefined => {
    for (const group of orbitGroups) {
      const found = group.orbits.find(orbit => orbit.id === id);
      if (found) return found;
    }
    return undefined;
  };
  
  const selectedOrbitData = findOrbitById(selectedOrbit);

  const handleDestinationModeChange = (mode: DestinationMode) => {
    onDestinationModeChange?.(mode);
    if (mode === "leo" && cislunarOrbits.includes(selectedOrbit)) {
      onSelectOrbit("LEO");
    } else if (mode === "cislunar" && leoOrbits.includes(selectedOrbit)) {
      onSelectOrbit("Moon");
    }
  };

  const filteredOrbitGroups = destinationMode === "leo" 
    ? orbitGroups.filter(g => g.name !== "Deep Space")
    : orbitGroups.filter(g => g.name === "Deep Space");

  const quickSelectOrbits = destinationMode === "leo" 
    ? ["VLEO", "LEO", "MEO", "GEO", "SSO", "GTO", "PO", "HEO"]
    : ["Moon", "Mars", "Ceres", "Europa", "Titan", "Enceladus"];

  const selectedTip = orbitTooltips[selectedOrbit];

  return (
    <div className="space-y-4">
      {onDestinationModeChange && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleDestinationModeChange("leo")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 transition-all ${
              destinationMode === "leo"
                ? "border-rail-red text-rail-red"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
            data-testid="destination-mode-leo"
          >
            <Globe className="w-4 h-4" />
            <span className="font-normal text-sm">Earth Orbits</span>
          </button>
          <button
            onClick={() => handleDestinationModeChange("cislunar")}
            className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 transition-all ${
              destinationMode === "cislunar"
                ? "border-rail-red text-rail-red"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
            data-testid="destination-mode-cislunar"
          >
            <Moon className="w-4 h-4" />
            <span className="font-normal text-sm">Cislunar & Beyond</span>
          </button>
        </div>
      )}

      {destinationMode === "cislunar" && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <strong>Cislunar Pricing:</strong> Lunar surface delivery costs $800K–$1.2M/kg. Only lunar-capable providers shown.
        </div>
      )}

      <Select value={selectedOrbit} onValueChange={onSelectOrbit}>
        <SelectTrigger className="w-full bg-white border-gray-200">
          <SelectValue placeholder="Select a destination" />
        </SelectTrigger>
        <SelectContent>
          {filteredOrbitGroups.map((group, groupIndex) => (
            <SelectGroup key={groupIndex}>
              <SelectLabel>{group.name}</SelectLabel>
              {group.orbits.map((orbit) => (
                <SelectItem key={orbit.id} value={orbit.id}>
                  {orbit.name} ({orbit.deltaV} km/s)
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      
      <TooltipProvider delayDuration={200}>
        <div className="hidden sm:grid grid-cols-3 sm:grid-cols-4 gap-2">
          {quickSelectOrbits.map((orbitId) => {
            const orbitData = findOrbitById(orbitId);
            if (!orbitData) return null;
            const tip = orbitTooltips[orbitId];
            
            return (
              <Tooltip key={orbitId}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectOrbit(orbitId)}
                    className={`relative p-2 min-h-[44px] text-center border transition-all group ${
                      selectedOrbit === orbitId 
                        ? "border-[#e3000f] bg-[#e3000f]/10 text-[#e3000f]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                    data-testid={`orbit-button-${orbitId}`}
                  >
                    <div className="text-xs font-medium">{orbitData.id}</div>
                    {tip && (
                      <Info className="absolute top-0.5 right-0.5 w-3 h-3 text-gray-400 group-hover:text-[#e3000f] transition-colors" />
                    )}
                  </button>
                </TooltipTrigger>
                {tip && (
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-semibold text-xs mb-1">{tip.short}</p>
                    <p className="text-xs text-muted-foreground">{tip.detail}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      
      {selectedTip && (
        <div className="p-3 bg-gray-50 border border-gray-200 text-sm text-gray-700">
          <p className="font-medium text-gray-900 mb-0.5">{selectedTip.short}</p>
          <p className="text-xs text-gray-600">{selectedTip.detail}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        {destinationMode === "leo" 
          ? "Select destination orbit for your payload"
          : "Cislunar missions require specialized lunar landers"}
      </p>
      
      {selectedOrbitData && (
        <div className="flex items-center p-3 bg-gray-50 border border-gray-200">
          <div className="flex-1">
            <h3 className="text-md font-medium text-gray-900">
              {selectedOrbitData.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Delta-V:</span>
            <span className="font-mono font-bold text-[#e3000f]">{selectedOrbitData.deltaV} km/s</span>
          </div>
        </div>
      )}
    </div>
  );
}
