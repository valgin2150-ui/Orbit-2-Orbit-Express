import { Switch, Route, useLocation } from "wouter";
import { useState, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { MissionCompareProvider } from "@/contexts/MissionCompareContext";
import { MissionIntakeProvider } from "@/contexts/MissionIntakeContext";
import { MissionCompareButton, MissionCompareDialog } from "@/components/MissionCompare";
import { MissionIntakeModal } from "@/components/MissionIntakeModal";
import InquiryChatbot from "@/components/InquiryChatbot";
import CookieConsent from "@/components/CookieConsent";
import PageTracker from "@/components/PageTracker";

const Home = lazy(() => import("@/pages/Home"));
const ExpressHome = lazy(() => import("@/pages/ExpressHome"));
const LaunchCalendar = lazy(() => import("@/pages/LaunchCalendar"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Directory = lazy(() => import("@/pages/Directory"));
const CompanyDetail = lazy(() => import("@/pages/CompanyDetail"));
const SuggestCompany = lazy(() => import("@/pages/SuggestCompany"));
const KidsExperience = lazy(() => import("@/pages/KidsExperience"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const KidsPrivacy = lazy(() => import("@/pages/KidsPrivacy"));
const Insights = lazy(() => import("@/pages/Insights"));
const InsightPost = lazy(() => import("@/pages/InsightPost"));
const Rockets = lazy(() => import("@/pages/Rockets"));
const RocketDetail = lazy(() => import("@/pages/RocketDetail"));
const RocketComparison = lazy(() => import("@/pages/RocketComparison"));
const Orbits = lazy(() => import("@/pages/Orbits"));
const OrbitDetail = lazy(() => import("@/pages/OrbitDetail"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const Methodology = lazy(() => import("@/pages/Methodology"));
const CampaignCalculator = lazy(() => import("@/pages/CampaignCalculator"));
const LunarCompute = lazy(() => import("@/pages/LunarCompute"));
const ReportDownload = lazy(() => import("@/pages/ReportDownload"));
const MissionReadinessChecklist = lazy(() => import("@/pages/MissionReadinessChecklist"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#e3000f] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">Loading</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={ExpressHome}/>
        <Route path="/tools" component={Home}/>
        <Route path="/launches" component={LaunchCalendar}/>
        <Route path="/pricing" component={Pricing}/>
        <Route path="/directory" component={Directory}/>
        <Route path="/directory/:id" component={CompanyDetail}/>
        <Route path="/suggest-company" component={SuggestCompany}/>
        <Route path="/kids" component={KidsExperience}/>
        <Route path="/privacy" component={PrivacyPolicy}/>
        <Route path="/cookies" component={CookiePolicy}/>
        <Route path="/terms" component={TermsOfService}/>
        <Route path="/kids-privacy" component={KidsPrivacy}/>
        <Route path="/insights" component={Insights}/>
        <Route path="/insights/:slug" component={InsightPost}/>
        <Route path="/rockets" component={Rockets}/>
        <Route path="/rockets/:slug" component={RocketDetail}/>
        <Route path="/compare" component={RocketComparison}/>
        <Route path="/compare/:slug" component={RocketComparison}/>
        <Route path="/orbits" component={Orbits}/>
        <Route path="/orbits/:slug" component={OrbitDetail}/>
        <Route path="/glossary" component={Glossary}/>
        <Route path="/methodology" component={Methodology}/>
        <Route path="/campaign" component={CampaignCalculator}/>
        <Route path="/lunar-compute" component={LunarCompute}/>
        <Route path="/report" component={ReportDownload}/>
        <Route path="/mission-readiness-checklist" component={MissionReadinessChecklist}/>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [missionIntakeOpen, setMissionIntakeOpen] = useState(false);
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <MissionCompareProvider>
          <MissionIntakeProvider onOpen={() => setMissionIntakeOpen(true)}>
            <TooltipProvider>
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <Toaster />
              <Router />
              <PageTracker />
              <MissionCompareButton />
              <MissionCompareDialog />
              <InquiryChatbot />
              <CookieConsent />
              <MissionIntakeModal
                isOpen={missionIntakeOpen}
                onClose={() => setMissionIntakeOpen(false)}
              />

              {location !== "/" && (
                <div
                  className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-40 md:hidden"
                  aria-hidden="true"
                />
              )}
            </TooltipProvider>
          </MissionIntakeProvider>
        </MissionCompareProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
