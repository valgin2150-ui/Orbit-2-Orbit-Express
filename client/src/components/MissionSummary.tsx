import { Card, CardContent } from "@/components/ui/card";
import { MissionSummary as MissionSummaryType } from "@/lib/types";
import { Package } from "lucide-react";

interface MissionSummaryProps {
  summary: MissionSummaryType;
}

export default function MissionSummary({ summary }: MissionSummaryProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
          <Package className="w-4 h-4 mr-2 text-rail-red" />
          Cargo Mission Details
        </h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="text-gray-500">Cargo Type:</div>
          <div className="font-medium text-gray-900">{summary.payloadTypeName}</div>
          
          <div className="text-gray-500">Destination Orbit:</div>
          <div className="font-medium text-gray-900">{summary.orbitName}</div>
          
          <div className="text-gray-500">Launch Region:</div>
          <div className="font-medium text-gray-900">{summary.regionName}</div>
          
          <div className="text-gray-500">Cargo Mass:</div>
          <div className="font-medium text-gray-900">{summary.mass} kg</div>
          
          <div className="text-gray-500">Cargo Volume:</div>
          <div className="font-medium text-gray-900">{summary.volume} m³</div>
          
          <div className="text-gray-500">Preparation Date:</div>
          <div className="font-medium text-gray-900">{new Date().toLocaleDateString()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
