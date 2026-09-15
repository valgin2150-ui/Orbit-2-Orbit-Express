import { X, Scale, Trash2, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataLabel } from "./DataLabel";
import { useMissionCompare, SavedMission } from "@/contexts/MissionCompareContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ComparisonCard({ mission, onRemove }: { mission: SavedMission; onRemove: () => void }) {
  const { results } = mission;
  const bestRocket = results.compatibleRockets[0];
  
  return (
    <Card className="bg-white border-gray-200 shadow-sm relative">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
        aria-label="Remove mission"
        data-testid={`remove-mission-${mission.id}`}
      >
        <X className="w-4 h-4" />
      </button>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 pr-8">{mission.name}</CardTitle>
        <p className="text-xs text-gray-400">
          Saved {mission.savedAt.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Destination</span>
            <span className="text-rail-red font-medium">{results.summary.orbitName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payload</span>
            <span className="text-gray-900">{results.summary.mass.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Region</span>
            <span className="text-gray-900">{results.summary.regionName}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">Delta-V <DataLabel kind="O2O model" /></span>
            <span className="font-mono text-rail-red">{results.metrics.deltaV.toLocaleString()} m/s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-2">Est. Cost <DataLabel kind="O2O model" /></span>
            <span className="font-mono text-success font-semibold">${results.metrics.estimatedCost.toLocaleString()}</span>
          </div>
        </div>
        
        {bestRocket && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-400 mb-1">Best Option</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{bestRocket.name}</span>
              <Badge className="bg-gray-100 text-gray-700 text-xs">
                ${bestRocket.costPerKg.toLocaleString()}/kg
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">{bestRocket.provider}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-400 pt-2">
          {results.compatibleRockets.length} compatible rockets
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionCompareButton() {
  const { savedMissions, setIsCompareOpen } = useMissionCompare();
  
  if (savedMissions.length === 0) return null;
  
  return (
    <Button
      onClick={() => setIsCompareOpen(true)}
      variant="outline"
      className="fixed bottom-6 right-6 z-40 bg-white border-rail-red/50 text-rail-red hover:bg-rail-red hover:text-white shadow-lg min-h-[48px] px-4"
      data-testid="compare-missions-button"
    >
      <Scale className="w-5 h-5 mr-2" />
      Compare ({savedMissions.length})
    </Button>
  );
}

export function MissionCompareDialog() {
  const { savedMissions, removeMission, clearAllMissions, isCompareOpen, setIsCompareOpen } = useMissionCompare();
  
  if (savedMissions.length === 0) return null;
  
  return (
    <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Scale className="w-5 h-5 text-rail-red" />
            Mission Comparison
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Compare up to 5 saved mission configurations
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllMissions}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 min-h-[36px]"
            data-testid="clear-all-missions"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedMissions.map(mission => (
            <ComparisonCard 
              key={mission.id} 
              mission={mission} 
              onRemove={() => removeMission(mission.id)}
            />
          ))}
          
          {savedMissions.length < 5 && (
            <Card className="bg-gray-50 border-dashed border-gray-300 flex items-center justify-center min-h-[300px]">
              <div className="text-center text-gray-400 p-4">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run another calculation and save it to compare</p>
              </div>
            </Card>
          )}
        </div>
        
        {savedMissions.length >= 2 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-rail-red" />
              Quick Comparison
            </h4>
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500">Lowest Cost</span>
                <span className="text-success font-medium">
                  {savedMissions.reduce((a, b) => 
                    a.results.metrics.estimatedCost < b.results.metrics.estimatedCost ? a : b
                  ).name} (${Math.min(...savedMissions.map(m => m.results.metrics.estimatedCost)).toLocaleString()})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-gray-200 pb-2">
                <span className="text-gray-500">Most Rocket Options</span>
                <span className="text-rail-red font-medium">
                  {savedMissions.reduce((a, b) => 
                    a.results.compatibleRockets.length > b.results.compatibleRockets.length ? a : b
                  ).name} ({Math.max(...savedMissions.map(m => m.results.compatibleRockets.length))} rockets)
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Lowest Delta-V</span>
                <span className="text-gray-900 font-medium">
                  {savedMissions.reduce((a, b) => 
                    a.results.metrics.deltaV < b.results.metrics.deltaV ? a : b
                  ).name} ({Math.min(...savedMissions.map(m => m.results.metrics.deltaV)).toLocaleString()} m/s)
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
