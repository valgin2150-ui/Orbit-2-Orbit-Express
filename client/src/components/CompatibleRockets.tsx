import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, Package, Rocket as RocketIcon, Globe, Mail, CheckCircle2, AlertCircle, Clock, Moon } from "lucide-react";
import { Rocket } from "@/lib/types";
import { DataLabel } from "./DataLabel";

interface CompatibleRocketsProps {
  rockets: Rocket[];
  isCislunar?: boolean;
}

const upcomingLunarWindows = [
  { mission: "Blue Ghost 2", provider: "Firefly Aerospace", window: "Q2 2026", destination: "Lunar Far Side", capacity: "150 kg", status: "Confirmed" },
  { mission: "IM-3 (Lunar Vertex)", provider: "Intuitive Machines", window: "Q2 2026", destination: "Reiner Gamma", capacity: "130 kg", status: "Confirmed" },
  { mission: "Griffin Mission One", provider: "Astrobotic", window: "Q3 2026", destination: "South Pole", capacity: "475 kg", status: "Confirmed" },
  { mission: "Blue Moon MK1", provider: "Blue Origin", window: "Early 2026", destination: "South Pole", capacity: "3,000 kg", status: "Confirmed" },
  { mission: "Artemis III (Starship HLS)", provider: "SpaceX/NASA", window: "2027", destination: "South Pole", capacity: "100,000+ kg", status: "Development" },
];

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "operational":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Operational</Badge>;
    case "retiring":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" />Retiring</Badge>;
    case "development":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Clock className="h-3 w-3 mr-1" />Development</Badge>;
    case "limited":
      return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200"><AlertCircle className="h-3 w-3 mr-1" />Limited</Badge>;
    default:
      return null;
  }
};

const getSizeClassBadge = (sizeClass?: string) => {
  switch (sizeClass) {
    case "micro":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Micro</Badge>;
    case "small":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Small-Lift</Badge>;
    case "medium":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Medium-Lift</Badge>;
    case "heavy":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Heavy-Lift</Badge>;
    case "super-heavy":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Super-Heavy</Badge>;
    default:
      return null;
  }
};

export default function CompatibleRockets({ rockets, isCislunar = false }: CompatibleRocketsProps) {
  const sortedRockets = [...rockets].sort((a, b) => a.costPerKg - b.costPerKg);
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium flex items-center text-gray-900">
            <RocketIcon className="w-4 h-4 mr-2 text-rail-red" />
            Compatible Cargo Transport Options
          </h3>
          <span className="text-xs text-gray-500">Sorted by cost</span>
        </div>
        
        {sortedRockets.length > 0 ? (
          sortedRockets.map((rocket, index) => (
            <div key={index} className="border border-gray-200 mb-3 overflow-hidden hover:border-gray-300 transition-colors">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{rocket.name}</h4>
                      {getStatusBadge(rocket.status)}
                      {getSizeClassBadge(rocket.sizeClass)}
                    </div>
                    <p className="text-sm text-gray-500">{rocket.provider}</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-1"><DataLabel kind={isCislunar ? "O2O model" : "Published figure"} /></div>
                    <div className="text-lg font-bold text-rail-red">
                      ${rocket.costPerKg.toLocaleString()}<span className="text-sm font-normal text-gray-500">/kg</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Max published payload: {rocket.maxMass.toLocaleString()} kg
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 space-y-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div className="text-sm flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <span>Next available: <span className="font-medium">{rocket.nextAvailable}</span></span>
                  </div>
                  <div className="text-sm flex items-center text-gray-700">
                    <Globe className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <span>Regions: <span className="font-medium">{rocket.regions.join(", ")}</span></span>
                  </div>
                  <div className="text-sm flex items-center text-gray-700">
                    <Package className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <span>Volume: <span className="font-medium">{rocket.maxVolume} m³</span></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-gray-200">
                  <a 
                    href={`mailto:vlad@orbit2orbitexpress.com?subject=Launch Management Services - ${rocket.provider} ${rocket.name}`}
                    className="text-rail-red hover:text-rail-redDark text-sm flex items-center min-h-[36px]"
                  >
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    Contact Orbit2OrbitExpress
                  </a>
                  <a 
                    href={rocket.contactUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 text-sm flex items-center min-h-[36px]"
                  >
                    Direct to Provider
                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : isCislunar ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gray-50 border border-gray-200">
              <Moon className="w-8 h-8 mx-auto mb-2 text-rail-red" />
              <p className="text-gray-700 font-medium mb-1">No immediate lunar transport available</p>
              <p className="text-sm text-gray-500">
                Your payload specifications exceed current lunar lander capacities or timing.
                Here are the upcoming lunar windows to prepare for:
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rail-red" />
                Upcoming Lunar Launch Windows
              </h4>
              {upcomingLunarWindows.map((window, idx) => (
                <div key={idx} className="border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{window.mission}</div>
                      <div className="text-sm text-gray-500">{window.provider}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={window.status === "Confirmed" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}>
                        {window.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
                    <span><strong>Window:</strong> {window.window}</span>
                    <span><strong>Destination:</strong> {window.destination}</span>
                    <span><strong>Capacity:</strong> {window.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-rail-red/5 border border-rail-red/20 p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-rail-red">Start preparing now:</strong> Lunar missions require 12-18 months of payload integration. 
                Contact us to reserve capacity on an upcoming mission.
              </p>
              <a 
                href="mailto:vlad@orbit2orbitexpress.com?subject=Lunar Mission Capacity Inquiry"
                className="inline-flex items-center mt-2 text-sm text-rail-red hover:text-rail-redDark font-medium"
              >
                <Mail className="w-4 h-4 mr-1" />
                Reserve Lunar Capacity
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500">
            No compatible transport options found for your cargo specifications.
            Try adjusting the cargo mass or volume.
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          Transport providers and availability data updated regularly. 
          Export this list using the sharing options below.
        </div>
      </CardContent>
    </Card>
  );
}
