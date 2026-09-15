import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface InsightsCardProps {
  insights: string[];
}

export default function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
          <Lightbulb className="w-4 h-4 mr-2 text-rail-red" />
          Cargo Logistics Insights
        </h3>
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start bg-gray-50 p-3">
              <Lightbulb className="h-5 w-5 text-rail-red mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          These logistics insights are shareable and exportable as part of your mission report.
        </div>
      </CardContent>
    </Card>
  );
}
