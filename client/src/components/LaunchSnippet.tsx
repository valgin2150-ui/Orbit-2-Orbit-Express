import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Rocket, Calendar, ChevronRight, Lock, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LaunchResponse, getStatusColor, formatLaunchDate } from "@/lib/launchTypes";
import { useSubscription } from "@/contexts/SubscriptionContext";

function LiveCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-gray-900 font-bold">{timeLeft.days}</span>
          <span className="text-gray-400 text-xs">d</span>
        </>
      )}
      <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-gray-900 font-bold">{pad(timeLeft.hours)}</span>
      <span className="text-rail-red font-bold">:</span>
      <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-gray-900 font-bold">{pad(timeLeft.minutes)}</span>
      <span className="text-rail-red font-bold">:</span>
      <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 text-rail-red font-bold">{pad(timeLeft.seconds)}</span>
    </div>
  );
}

export default function LaunchSnippet() {
  const { isProOrHigher } = useSubscription();
  const maxLaunches = isProOrHigher ? 8 : 4;
  
  const { data, isLoading, error } = useQuery<LaunchResponse>({
    queryKey: ['/api/launches', { limit: 10 }],
  });

  return (
    <Card className="bg-white border-gray-200 shadow-sm" data-testid="launch-snippet-card">
      <CardHeader className="pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-rail-red" />
            <span>Upcoming Launches</span>
          </CardTitle>
          <Link href="/launches">
            <Button variant="ghost" size="sm" className="text-rail-red hover:text-rail-redDark hover:bg-gray-50 text-xs" data-testid="view-calendar-link">
              30-Day Calendar
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {data?.launches && data.launches.length > 0 && (() => {
          const nextLaunch = data.launches[0];
          return (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-rail-red" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Launch</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{nextLaunch.missionName}</p>
                  <p className="text-xs text-gray-500">{nextLaunch.providerAbbrev} · {nextLaunch.vehicle}</p>
                </div>
                <LiveCountdown targetDate={nextLaunch.dateTime} />
              </div>
            </div>
          );
        })()}
        {data?.fallback && (
          <div className="mb-3 p-2.5 bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Showing sample launches • Live data refreshes every 6 hours
            </p>
          </div>
        )}
        {error ? (
          <div className="text-center py-6 text-gray-500">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Launch data temporarily unavailable</p>
            <p className="text-xs text-gray-400 mt-1">Please try again shortly</p>
          </div>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50">
              <Skeleton className="h-10 w-14 bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                <Skeleton className="h-3 w-1/2 bg-gray-200" />
              </div>
            </div>
          ))
        ) : data?.launches && data.launches.length > 0 ? (
          data.launches.slice(0, maxLaunches).map((launch) => {
            const { date, countdown } = formatLaunchDate(launch.dateTime);
            return (
              <Link href="/launches" key={launch.id}>
                <div 
                  className="flex items-center gap-3 p-2.5 bg-gray-50 border-l-2 border-rail-red/50 hover:border-rail-red transition-all cursor-pointer group"
                  data-testid={`launch-item-${launch.id}`}
                >
                  <div className="flex-shrink-0 text-center min-w-[56px] bg-white py-1.5 px-2 border border-gray-200">
                    <div className="font-mono text-[10px] font-medium text-gray-400 uppercase">{date}</div>
                    <div className={`font-mono text-xs font-bold ${countdown === 'Imminent' ? 'text-danger' : 'text-rail-red'}`}>
                      {countdown}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-rail-red transition-colors">{launch.missionName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="font-medium text-gray-600">{launch.providerAbbrev}</span>
                      <span className="text-gray-400">•</span>
                      <span>{launch.vehicle}</span>
                    </div>
                  </div>
                  <Badge 
                    className={`${getStatusColor(launch.status)} text-white text-[9px] px-1.5 py-0.5 font-medium`}
                  >
                    {launch.statusAbbrev}
                  </Badge>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-500">
            No upcoming launches found
          </div>
        )}
        
        {data?.launches && data.launches.length > maxLaunches && (
          <Link href={isProOrHigher ? "/launches" : "/pricing"}>
            <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-rail-red/50 transition-all mt-2" data-testid="see-all-launches-button">
              {isProOrHigher ? (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Full 30-Day Calendar
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Full Calendar (Pro)
                </>
              )}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
