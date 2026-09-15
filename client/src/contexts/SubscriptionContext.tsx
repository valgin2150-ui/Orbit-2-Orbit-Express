import { createContext, useContext, type ReactNode } from "react";

type SubscriptionTier = "free" | "pro" | "enterprise";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isProOrHigher: boolean;
  isEnterprise: boolean;
  canAccessFeature: (feature: string) => boolean;
  isSignedIn: boolean;
  clerkEnabled: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "free",
  isProOrHigher: false,
  isEnterprise: false,
  canAccessFeature: () => false,
  isSignedIn: false,
  clerkEnabled: false,
});

interface SubscriptionProviderProps {
  children: ReactNode;
}

function createCanAccessFeature(isProOrHigher: boolean, isEnterprise: boolean) {
  return (feature: string): boolean => {
    const featureMap: Record<string, boolean> = {
      extended_launches: isProOrHigher,
      full_calendar: isProOrHigher,
      unlimited_news: isProOrHigher,
      countdown_timers: isProOrHigher,
      launch_alerts: isProOrHigher,
      export_calendar: isProOrHigher,
      historical_data: isEnterprise,
      api_access: isEnterprise,
      custom_reports: isEnterprise,
    };
    return featureMap[feature] || false;
  };
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  // All features are currently freemium - everyone gets full access
  const tier: SubscriptionTier = "free";
  const isProOrHigher = true; // Freemium: give everyone Pro access
  const isEnterprise = true; // Freemium: give everyone Enterprise access
  const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  return (
    <SubscriptionContext.Provider value={{ 
      tier, 
      isProOrHigher, 
      isEnterprise, 
      canAccessFeature: createCanAccessFeature(isProOrHigher, isEnterprise),
      isSignedIn: false,
      clerkEnabled
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
