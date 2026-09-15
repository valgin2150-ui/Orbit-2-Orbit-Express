export interface SpaceLaunch {
  id: string;
  name: string;
  missionName: string;
  provider: string;
  providerAbbrev: string;
  vehicle: string;
  launchSite: string;
  padName: string;
  dateTime: string;
  status: string;
  statusAbbrev: string;
  missionType: string;
  missionDescription: string;
  webcastUrl: string | null;
  imageUrl: string | null;
  probability: number | null;
}

export interface LaunchResponse {
  launches: SpaceLaunch[];
  cached?: boolean;
  stale?: boolean;
  fallback?: boolean;
  message?: string;
  lastUpdated: string;
}

export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('go') || statusLower.includes('confirmed')) return 'bg-green-500';
  if (statusLower.includes('tbd') || statusLower.includes('tentative')) return 'bg-yellow-500';
  if (statusLower.includes('hold') || statusLower.includes('scrub')) return 'bg-red-500';
  if (statusLower.includes('success')) return 'bg-blue-500';
  return 'bg-gray-500';
};

export const getProviderColor = (provider: string): string => {
  return 'border-l-rail-red';
};

export const formatLaunchDate = (dateTime: string): { date: string; time: string; countdown: string } => {
  const launchDate = new Date(dateTime);
  const now = new Date();
  const diff = launchDate.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  let countdown = '';
  if (diff < 0) {
    countdown = 'Launched';
  } else if (days > 0) {
    countdown = `T-${days}d ${hours}h`;
  } else if (hours > 0) {
    countdown = `T-${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    countdown = `T-${minutes}m`;
  } else {
    countdown = 'Imminent';
  }
  
  return {
    date: launchDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: launchDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    countdown
  };
};
