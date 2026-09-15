import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InfoIcon, BarChart2, DollarSign, HelpCircle } from "lucide-react";
import { MissionMetrics as MissionMetricsType } from "@/lib/types";
import { DataLabel } from "./DataLabel";

interface MissionMetricsProps {
  metrics: MissionMetricsType;
}

export default function MissionMetrics({ metrics }: MissionMetricsProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
          <BarChart2 className="w-4 h-4 mr-2 text-rail-red" />
          Cargo Transport Metrics
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="text-sm text-gray-500 mb-1 print-label">Delta-V Required</div>
            <DataLabel kind="O2O model" />
            <div className="text-2xl font-mono font-bold text-rail-red print-value">
              {metrics.deltaV.toLocaleString()} m/s
            </div>
            <div className="mt-2 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-gray-400">
                      <InfoIcon className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delta-V is the change in velocity needed for your cargo to reach the target orbit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="text-sm text-gray-500 mb-1 print-label">Transport Cost Estimate</div>
            <DataLabel kind="O2O model" />
            <div className="text-2xl font-mono font-bold text-rail-red flex items-center print-value">
              <DollarSign className="h-6 w-6 mr-1" />
              {metrics.estimatedCost.toLocaleString()}
            </div>
            <div className="mt-2 text-xs flex items-center justify-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-gray-400">
                      <InfoIcon className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated cargo transport cost based on compatible launch providers and current market rates</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-rail-red hover:text-rail-redDark text-xs underline flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    How do we calculate the fees?
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl text-gray-900">Orbit to Orbit Express Pricing Structure</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Understanding our transparent launch management fee calculation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div className="bg-gray-50 p-4">
                      <h4 className="font-semibold text-rail-red mb-2">Base Launch Provider Cost</h4>
                      <p className="text-gray-600">
                        We start with a published rideshare cost per kilogram when one is available. This is a planning input, not a provider quote for your specific payload or launch window.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4">
                      <h4 className="font-semibold text-rail-red mb-2">Orbit to Orbit Express Service Margin (20%)</h4>
                      <p className="text-gray-600 mb-2">
                        Our 20% service fee includes comprehensive launch management services:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
                        <li>Regulatory compliance and documentation</li>
                        <li>Mission planning and timeline coordination</li>
                        <li>Provider negotiations and contract management</li>
                        <li>Technical integration support</li>
                        <li>Insurance coordination and risk assessment</li>
                        <li>Launch window optimization</li>
                        <li>24/7 mission support and monitoring</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4">
                      <h4 className="font-semibold text-success mb-2">Minimum Service Fee</h4>
                      <p className="text-gray-600">
                        A minimum fee of $60,000 ensures comprehensive support for smaller payloads, covering fixed costs for regulatory approvals, documentation, and dedicated project management.
                      </p>
                    </div>
                    
                    <div className="bg-rail-red/5 border border-rail-red/20 p-4">
                      <h4 className="font-semibold text-rail-red mb-2">Final Calculation</h4>
                      <p className="text-gray-700 font-mono text-sm">
                        Total Cost = (Provider Cost per kg × Payload Mass × 1.20) or $60,000 minimum
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                      These are O2O planning estimates. Contact the launch or mission provider for a detailed proposal and mission-specific confirmation.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          These metrics can be exported, printed, or shared on social media using the share button below
        </div>
      </CardContent>
    </Card>
  );
}
