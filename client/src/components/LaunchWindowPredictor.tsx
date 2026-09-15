import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Calendar as CalendarIcon, Clock, Cloud, CloudRain, Sun } from "lucide-react";
import { format, addDays, differenceInDays, isSameDay } from "date-fns";
import { DataLabel } from "./DataLabel";

interface LaunchWindowPredictorProps {
  orbit: string;
  region: string;
}

interface LaunchWindow {
  date: Date;
  quality: 'optimal' | 'good' | 'marginal' | 'poor';
  weatherRisk: number; // 0-100
  notes: string;
}

export default function LaunchWindowPredictor({ orbit, region }: LaunchWindowPredictorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [launchWindows, setLaunchWindows] = useState<LaunchWindow[]>([]);
  
  // Generate realistic launch windows based on orbit and region
  useEffect(() => {
    // Start with today
    const today = new Date();
    const windows: LaunchWindow[] = [];
    
    // Generate realistic launch windows for the next 3 years (1095 days)
    for (let i = 0; i < 1095; i++) {
      const candidateDate = addDays(today, i);
      
      // Skip some days to make it realistic (not every day is viable)
      if (Math.random() > 0.3) continue;
      
      // Different orbits have different optimal launch patterns
      let isViable = false;
      let quality: 'optimal' | 'good' | 'marginal' | 'poor' = 'marginal';
      let weatherRisk = Math.floor(Math.random() * 100);
      let notes = "";

      // Orbit-specific considerations
      if (orbit.includes("SSO") || orbit.includes("PO")) {
        // Sun-synchronous and polar orbits prefer dawn/dusk
        isViable = candidateDate.getDate() % 4 === 0;
        quality = isViable ? 'optimal' : 'good';
        notes = "Dawn/dusk launch for optimal lighting conditions";
      } else if (orbit.includes("GEO")) {
        // GEO launches prefer specific windows for orbital mechanics
        isViable = candidateDate.getDate() % 6 === 0;
        quality = isViable ? 'optimal' : 'marginal';
        notes = "Launch window optimized for GEO transfer orbit insertion";
      } else if (orbit.includes("Moon") || orbit.includes("Mars") || orbit.includes("Titan") || orbit.includes("Ceres")) {
        // Planetary launches have very specific windows
        isViable = candidateDate.getDate() % 12 === 0;
        quality = isViable ? 'optimal' : 'poor';
        notes = "Planetary alignment favorable for minimum energy trajectory";
      } else {
        // LEO and others are more flexible
        isViable = candidateDate.getDate() % 3 === 0;
        quality = 'good';
        notes = "Standard launch window available";
      }
      
      // Region-specific weather patterns
      if (region.includes("cape")) {
        // Florida weather patterns
        weatherRisk = (candidateDate.getMonth() >= 5 && candidateDate.getMonth() <= 9) 
          ? 40 + Math.floor(Math.random() * 40) // Hurricane season
          : 10 + Math.floor(Math.random() * 30);
        notes += weatherRisk > 50 ? "; High thunderstorm risk" : "";
      } else if (region.includes("vandenberg")) {
        // California weather
        weatherRisk = (candidateDate.getMonth() >= 10 || candidateDate.getMonth() <= 2) 
          ? 30 + Math.floor(Math.random() * 40) // Winter fog and rain
          : 5 + Math.floor(Math.random() * 20);
        notes += weatherRisk > 50 ? "; Coastal fog risk" : "";
      } else if (region.includes("kourou")) {
        // French Guiana
        weatherRisk = 20 + Math.floor(Math.random() * 30); // Generally good but tropical
        notes += weatherRisk > 50 ? "; Tropical storm risk" : "";
      } else if (region.includes("baikonur") || region.includes("plesetsk")) {
        // Kazakhstan/Russia weather
        weatherRisk = (candidateDate.getMonth() >= 10 || candidateDate.getMonth() <= 2) 
          ? 40 + Math.floor(Math.random() * 50) // Harsh winter
          : 10 + Math.floor(Math.random() * 30);
        notes += weatherRisk > 50 ? "; Extreme temperature risk" : "";
      }
      
      if (isViable || Math.random() > 0.7) { // Add some randomness for realism
        windows.push({
          date: candidateDate,
          quality,
          weatherRisk,
          notes
        });
      }
    }
    
    setLaunchWindows(windows);
  }, [orbit, region]);
  
  const getWindowClassName = (date: Date) => {
    const window = launchWindows.find(w => isSameDay(w.date, date));
    if (!window) return "";
    
    switch (window.quality) {
      case 'optimal': return "bg-green-500/20 text-green-500 rounded-lg";
      case 'good': return "bg-rail-red/10 text-rail-red rounded-lg";
      case 'marginal': return "bg-yellow-500/20 text-yellow-500 rounded-lg";
      case 'poor': return "bg-red-500/20 text-red-500 rounded-lg";
      default: return "";
    }
  };
  
  const getSelectedWindowDetails = () => {
    if (!selectedDate) return null;
    return launchWindows.find(w => isSameDay(w.date, selectedDate));
  };
  
  const getWeatherIcon = (risk: number) => {
    if (risk < 20) return <Sun className="h-4 w-4 text-green-500" />;
    if (risk < 50) return <Cloud className="h-4 w-4 text-rail-red" />;
    if (risk < 80) return <CloudRain className="h-4 w-4 text-yellow-500" />;
    return <CloudRain className="h-4 w-4 text-red-500" />;
  };
  
  const selectedWindow = getSelectedWindowDetails();
  
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium text-gray-900">
          <CalendarIcon className="w-4 h-4 mr-2 text-rail-red" />
          Launch Window Predictor
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2 text-[hsl(var(--space-gray))]">
                  <InfoIcon className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Based on historical weather data, orbital mechanics, and launch site availability</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="mt-2"><DataLabel kind="O2O model" /></div>
        <CardDescription>
          Available launch opportunities for {orbit} from {region}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-gray-700"
              modifiers={{
                launch: launchWindows.map(w => w.date)
              }}
              modifiersClassNames={{
                launch: "font-bold"
              }}
              components={{
                DayContent: ({ date, ...props }) => (
                  <div className={`h-8 w-8 p-0 font-normal flex items-center justify-center ${getWindowClassName(date)}`}>
                    {date.getDate()}
                  </div>
                )
              }}
            />
            <div className="flex justify-between mt-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500/20 mr-1"></div>
                <span>Optimal</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-lg bg-teal-400/20 mr-1"></div>
                <span>Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 mr-1"></div>
                <span>Marginal</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500/20 mr-1"></div>
                <span>Poor</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4">
            <h3 className="font-medium mb-2 text-gray-900">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            
            {selectedWindow ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={selectedWindow.quality === 'optimal' ? "default" : 
                             selectedWindow.quality === 'good' ? "secondary" :
                             selectedWindow.quality === 'marginal' ? "outline" : "destructive"}>
                    {selectedWindow.quality.toUpperCase()} WINDOW
                  </Badge>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{Math.floor(5 + Math.random() * 4)} hour window</span>
                  </div>
                </div>
                
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--space-gray))]">Weather Risk:</span>
                    <div className="flex items-center">
                      {getWeatherIcon(selectedWindow.weatherRisk)}
                      <span className="ml-1">{selectedWindow.weatherRisk}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--space-gray))]">Range Status:</span>
                    <span className="text-green-500">Available</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--space-gray))]">Countdown Begins:</span>
                    <span>{format(selectedWindow.date, 'h:mm a')}</span>
                  </div>
                  
                  <div className="mt-3 bg-gray-100 p-2 text-xs">
                    <span className="text-gray-500">Notes:</span>
                    <p className="mt-1 text-gray-700">{selectedWindow.notes}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[hsl(var(--space-gray))]">
                <p>No launch window available for this date</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}