import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Rocket, Calendar, MapPin, ExternalLink, ArrowLeft, 
  Filter, RefreshCw, Video, ChevronLeft, ChevronRight,
  List, Grid, Lock, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { LaunchResponse, SpaceLaunch, getStatusColor, getProviderColor, formatLaunchDate } from "@/lib/launchTypes";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Navigation } from "@/components/Navigation";
import { useSEO } from "@/hooks/useSEO";

function generateCalendarDays(startDate: Date, numDays: number = 30): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < numDays; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

function LaunchDetailModal({ launch, open, onClose }: { 
  launch: SpaceLaunch | null; 
  open: boolean; 
  onClose: () => void;
}) {
  if (!launch) return null;
  
  const { date, time, countdown } = formatLaunchDate(launch.dateTime);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getStatusColor(launch.status)} text-white`}>
              {launch.status}
            </Badge>
            <span className={`font-bold ${countdown === 'Imminent' ? 'text-danger' : 'text-rail-red'}`}>
              {countdown}
            </span>
          </div>
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {launch.missionName}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {launch.provider} • {launch.vehicle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Launch Date</div>
              <div className="text-gray-900 font-medium">{date}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Launch Time</div>
              <div className="text-gray-900 font-medium">{time}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
            <div>
              <div className="text-gray-900">{launch.launchSite}</div>
              {launch.padName && (
                <div className="text-sm text-gray-400">{launch.padName}</div>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Mission Type</div>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {launch.missionType}
            </Badge>
          </div>
          
          {launch.probability !== null && launch.probability >= 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Weather Probability</div>
              <Badge variant="outline" className={`
                ${launch.probability >= 70 ? 'border-green-500 text-green-600' : 
                  launch.probability >= 40 ? 'border-yellow-500 text-yellow-600' : 
                  'border-red-500 text-red-600'}
              `}>
                {launch.probability}%
              </Badge>
            </div>
          )}
          
          {launch.missionDescription && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Mission Description</div>
              <p className="text-gray-700 leading-relaxed">{launch.missionDescription}</p>
            </div>
          )}
          
          {launch.webcastUrl && (
            <a 
              href={launch.webcastUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-rail-red hover:text-rail-redDark transition-colors"
              data-testid={`webcast-link-${launch.id}`}
            >
              <Video className="w-4 h-4" />
              Watch Live Stream
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalendarDayCell({ 
  day, 
  launches, 
  isToday,
  onLaunchClick 
}: { 
  day: Date; 
  launches: SpaceLaunch[];
  isToday: boolean;
  onLaunchClick: (launch: SpaceLaunch) => void;
}) {
  const dayOfMonth = day.getDate();
  const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = day.toLocaleDateString('en-US', { month: 'short' });
  
  return (
    <div 
      className={`min-h-[120px] p-2 border ${
        isToday ? 'bg-rail-red/5 border-rail-red/50' : 'bg-white border-gray-200'
      } ${launches.length > 0 ? 'ring-1 ring-rail-red/20' : ''}`}
      data-testid={`calendar-day-${day.toISOString().split('T')[0]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-medium ${isToday ? 'text-rail-red' : 'text-gray-400'}`}>
          {dayName}
        </div>
        <div className={`text-lg font-bold ${isToday ? 'text-rail-red' : 'text-gray-900'}`}>
          {dayOfMonth === 1 ? `${monthName} ${dayOfMonth}` : dayOfMonth}
        </div>
      </div>
      
      <div className="space-y-1">
        {launches.slice(0, 3).map((launch) => (
          <button
            key={launch.id}
            onClick={() => onLaunchClick(launch)}
            className="w-full text-left p-1.5 text-xs border-l-2 border-rail-red/50 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            data-testid={`launch-${launch.id}`}
          >
            <div className="font-medium text-gray-900 truncate">{launch.missionName}</div>
            <div className="text-gray-500 truncate">{launch.providerAbbrev} • {launch.vehicle}</div>
          </button>
        ))}
        {launches.length > 3 && (
          <div className="text-xs text-rail-red font-medium text-center py-1">
            +{launches.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

function UpgradePaywall() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rail-red/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-rail-red" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Full Launch Calendar
              </h2>
              <p className="text-sm text-gray-500">
                Pro Feature - Upgrade to unlock
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {[
                "6-month launch calendar with real-time updates",
                "Live countdown timers for each mission",
                "Detailed mission objectives and payloads",
                "Filter by provider, country, and mission type",
                "Export to your calendar + email alerts"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{feature}</p>
                </div>
              ))}
            </div>
            
            <Link href="/pricing">
              <Button className="w-full font-medium border-2 border-rail-red bg-transparent hover:bg-rail-red text-rail-red hover:text-white transition-colors" data-testid="upgrade-button">
                Start Free 7-Day Trial
              </Button>
            </Link>
            
            <p className="text-xs text-center text-gray-400 mt-3">
              No credit card required • Cancel anytime
            </p>
            
            <Link href="/">
              <Button variant="ghost" className="w-full mt-4 text-sm text-gray-500 hover:text-gray-900" data-testid="back-home">
                Back to Orbital Planner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LaunchCalendar() {
  useSEO({
    title: "Space Launch Schedule & Calendar 2026 - Upcoming Rocket Launches Worldwide",
    description: "Track upcoming space launches worldwide with our 6-month launch calendar. Live countdown timers, mission details, and launch provider info for SpaceX, ULA, Rocket Lab, ISRO, Arianespace, JAXA, CNSA, and Roscosmos launches from Cape Canaveral, Vandenberg, Kourou, Baikonur, Jiuquan, Wenchang, Sriharikota, Tanegashima, Mahia Peninsula, Alcantara, Satish Dhawan, Plesetsk, and Vostochny.",
    canonical: "/launches",
    keywords: "space launch schedule 2026, upcoming rocket launches, SpaceX launch calendar, rocket launch countdown, satellite launch dates, space launch tracker, next rocket launch, launch manifest 2026, ULA launch schedule, ISRO launch dates, JAXA H3 launch schedule, CNSA Long March launch, Arianespace Ariane 6 launch, Roscosmos Soyuz launch, Cape Canaveral launches, Vandenberg launches, Kourou launches, Baikonur launches, Jiuquan launch site, Wenchang launch center, Sriharikota SDSC, Tanegashima Space Center, Mahia Peninsula Rocket Lab, Alcantara Launch Center Brazil, Satish Dhawan Space Centre, Plesetsk Cosmodrome, Vostochny Cosmodrome, 6-month launch calendar, international launch schedule",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "Upcoming Space Launches - Live Launch Calendar",
      "description": "Real-time space launch tracking with 6-month calendar view. Covers launches from SpaceX, ULA, Rocket Lab, ISRO, Arianespace, JAXA, CNSA, and more from launch sites worldwide including Cape Canaveral, Vandenberg, Kourou, Baikonur, Jiuquan, Wenchang, Sriharikota, Tanegashima, and Mahia Peninsula.",
      "url": "https://www.orbit2orbitexpress.com/launches",
      "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
      "organizer": { "@type": "Organization", "name": "Orbit to Orbit Express" }
    },
  });
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [selectedLaunch, setSelectedLaunch] = useState<SpaceLaunch | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { canAccessFeature } = useSubscription();
  
  const { data, isLoading, error, refetch, isFetching } = useQuery<LaunchResponse>({
    queryKey: ['/api/launches', { days: 180 }],
    queryFn: async () => {
      const res = await fetch('/api/launches?days=180&limit=200');
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    refetchOnWindowFocus: false,
    enabled: canAccessFeature('full_calendar'),
  });

  const providers = data?.launches 
    ? Array.from(new Set(data.launches.map(l => l.provider))).sort()
    : [];

  const filteredLaunches = data?.launches?.filter(launch => 
    providerFilter === "all" || launch.provider === providerFilter
  ) || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const calendarDays = useMemo(() => generateCalendarDays(today, 180), []);
  
  const launchesByDate = useMemo(() => {
    const map: Record<string, SpaceLaunch[]> = {};
    filteredLaunches.forEach(launch => {
      const dateKey = new Date(launch.dateTime).toISOString().split('T')[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(launch);
    });
    return map;
  }, [filteredLaunches]);

  if (!canAccessFeature('full_calendar')) {
    return <UpgradePaywall />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main id="main-content" className="container mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-8 max-w-7xl" role="main">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-rail-red" aria-hidden="true"></div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-rail-red" />
              6-Month Launch Calendar
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {calendarDays[29]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {data?.lastUpdated && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
              {data.cached && <span className="ml-2">(cached)</span>}
            </p>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 hidden md:block" />
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-[160px] md:w-[200px] bg-white border-gray-300 text-gray-900 min-h-[44px]" data-testid="provider-filter">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider} value={provider} className="text-gray-900 hover:bg-gray-50">
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex bg-white border border-gray-200 p-1">
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`min-h-[40px] ${viewMode === 'calendar' ? 'border-2 border-rail-red text-rail-red bg-transparent' : 'text-gray-700'}`}
                data-testid="view-calendar-mode"
              >
                <Grid className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`min-h-[40px] ${viewMode === 'list' ? 'border-2 border-rail-red text-rail-red bg-transparent' : 'text-gray-700'}`}
                data-testid="view-list-mode"
              >
                <List className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-gray-300 text-gray-600 hover:bg-gray-100 min-h-[44px]"
              data-testid="refresh-launches"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredLaunches.length} launch{filteredLaunches.length !== 1 ? 'es' : ''} in next 6 months
          </div>
        </div>

        {error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-8 text-center">
              <p className="text-red-600">Failed to load launch data. Please try again later.</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="min-h-[120px] p-2 bg-white border border-gray-200">
                <Skeleton className="h-4 w-8 mb-2 bg-gray-200" />
                <Skeleton className="h-6 w-12 mb-3 bg-gray-200" />
              </div>
            ))}
          </div>
        ) : viewMode === 'calendar' ? (
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {calendarDays.map((day) => {
              const dateKey = day.toISOString().split('T')[0];
              const dayLaunches = launchesByDate[dateKey] || [];
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <CalendarDayCell
                  key={dateKey}
                  day={day}
                  launches={dayLaunches}
                  isToday={isToday}
                  onLaunchClick={setSelectedLaunch}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLaunches.length > 0 ? (
              filteredLaunches.map(launch => {
                const { date, time, countdown } = formatLaunchDate(launch.dateTime);
                return (
                  <Card 
                    key={launch.id}
                    className="bg-white border-gray-200 shadow-sm border-l-4 border-l-rail-red cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedLaunch(launch)}
                    data-testid={`launch-list-${launch.id}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getStatusColor(launch.status)} text-white text-xs`}>
                              {launch.status}
                            </Badge>
                            <span className={`text-sm font-bold ${countdown === 'Imminent' ? 'text-danger animate-pulse' : 'text-rail-red'}`}>
                              {countdown}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{launch.missionName}</div>
                          <div className="text-sm text-gray-500">
                            {launch.provider} • {launch.vehicle} • {launch.launchSite}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="bg-white border-gray-200">
                <CardContent className="py-12 text-center">
                  <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No launches scheduled in the next 6 months.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        <LaunchDetailModal
          launch={selectedLaunch}
          open={!!selectedLaunch}
          onClose={() => setSelectedLaunch(null)}
        />

        <section className="mt-12 border-t border-gray-200 pt-10">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">Next Steps</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/">
              <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
                <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Orbital Planner</h4>
                <p className="text-xs text-gray-500">Estimate your mission cost using real provider pricing data</p>
              </div>
            </Link>
            <Link href="/directory">
              <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
                <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Company Directory</h4>
                <p className="text-xs text-gray-500">Find and compare 200+ launch providers and space companies</p>
              </div>
            </Link>
            <Link href="/insights">
              <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
                <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Industry Insights</h4>
                <p className="text-xs text-gray-500">Expert analysis on launch economics and space industry trends</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
