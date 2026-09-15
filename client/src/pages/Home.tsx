import { useState, useEffect, useRef, useMemo } from "react";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";
import Footer from "@/components/Footer";
import { PayloadConfig, CalculatedResults, Rocket, Orbit } from "@/lib/types";
import { calculateLogistics, jsonRocketToRocket, jsonOrbitToOrbit, JsonOrbitDTO } from "@/lib/calculateLogistics";
import { Navigation } from "@/components/Navigation";
import { PricingPreviewModal } from "@/components/PricingPreviewModal";
import { useSEO } from "@/hooks/useSEO";
import { useMissionIntake } from "@/contexts/MissionIntakeContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiSubstack } from "react-icons/si";
import { ArrowRight, FileText, Download, CheckCircle, BookOpen, Clock } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import posts from "@/data/posts.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { loadLaunchers, useLaunchers } from "@/lib/launcherData";

interface DisplayPost {
  slug?: string;
  externalUrl?: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
}

function getCurrentQuarter(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const isLastMonthOfQuarter = month % 3 === 0; // March, June, Sep, Dec
  let q = Math.ceil(month / 3);
  let year = now.getFullYear();
  if (isLastMonthOfQuarter) {
    q += 1;
    if (q > 4) { q = 1; year += 1; }
  }
  return `Q${q} ${year}`;
}

export default function Home() {
  useSEO({
    title: "Orbital Planner & Launch Expense Estimator | Orbit to Orbit Express",
    description: "Free orbital transfer cost calculator for aerospace engineers. Estimate satellite launch expenses, compare rockets from SpaceX, ULA, ISRO, Rocket Lab, Arianespace, JAXA & CNSA, and plan missions to LEO, GEO, Moon & Mars. Planning estimates for initial exploration; provider quotes and mission-specific verification are required.",
    canonical: "/tools",
    keywords: "orbital transfer cost calculator, launch expense estimator, space launch cost calculator, satellite launch cost, rocket comparison tool, mission planning software, SpaceX launch cost, LEO launch price, delta-v calculator, space cargo logistics, orbital mechanics calculator, CubeSat launch cost 2026, orbit transfer cost, NASA, JPL, SpaceX, Blue Origin, Astranis, Aether Industries, ULA, Rocket Lab, Arianespace, ISRO, JAXA, CNSA, Roscosmos, KARI, UAE Space Agency, Saudi Space Commission, CONAE Argentina, ACE Chile, Luxembourg Space Agency, ESA, Seattle, Space Alley, Kent WA, Redmond WA, Cape Canaveral, Vandenberg, Kourou, Baikonur, Jiuquan, Sriharikota, Mahia Peninsula, Wenchang, Tanegashima, Alcantara, Satish Dhawan, Plesetsk, Vostochny",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Orbit to Orbit Express - Orbital Planner",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "alternateName": ["Launch Cost Calculator", "Orbital Transfer Cost Calculator", "Launch Expense Estimator", "Space Launch Cost Calculator", "Delta-V Calculator"],
      "description": "Free orbital transfer cost calculator and launch expense estimator for aerospace professionals. Compare rockets, calculate delta-v, and plan missions to any orbit.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "url": "https://www.orbit2orbitexpress.com/tools"
    },
  });

  const { openMissionIntake } = useMissionIntake();
  const { launchers } = useLaunchers();
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculatedResults | null>(null);
  const [currentPayload, setCurrentPayload] = useState<PayloadConfig | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [reportEmail, setReportEmail] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Live launch count from API (next 90 days)
  const [upcomingLaunches, setUpcomingLaunches] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/launches?days=90&limit=200")
      .then((r) => r.json())
      .then((data) => setUpcomingLaunches(data.launches?.length ?? null))
      .catch(() => setUpcomingLaunches(null));
  }, []);

  // Live Substack / Orbital Economics feed (falls back to posts.json)
  const [liveArticles, setLiveArticles] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/substack-feed")
      .then((r) => r.json())
      .then((data) => { if (data.articles?.length) setLiveArticles(data.articles); })
      .catch(() => {});
  }, []);

  const displayPosts = useMemo((): DisplayPost[] => {
    if (!liveArticles) {
      return (posts as any[]).slice(0, 3).map((p: any) => ({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        category: p.category,
        date: p.date,
        readTime: p.readTime,
      }));
    }
    return liveArticles.slice(0, 3).map((article: any) => {
      const match = (posts as any[]).find((p: any) => p.substackUrl === article.url);
      return {
        slug: match?.slug,
        externalUrl: article.url,
        title: article.title,
        summary: match?.summary || article.summary,
        category: match?.category || (article.categories?.[0] || "Insights"),
        date: match?.date || article.date,
        readTime: match?.readTime || "~5 min",
      };
    });
  }, [liveArticles]);

  // Stats derived from actual data — always accurate
  const operationalOrbitalRockets = useMemo(
    () => launchers.filter((r) => r.vehicle_status === "Operational" && r.size_class !== "micro" && typeof r.rideshare_price_per_kg === "number"),
    [launchers]
  );
  const providerCount = useMemo(
    () => new Set(launchers.filter((r) => r.vehicle_status === "Operational").map((r) => r.provider)).size,
    [launchers]
  );
  const lowestCostPerKg = useMemo(
    () => operationalOrbitalRockets.length ? Math.min(...operationalOrbitalRockets.map((r) => r.rideshare_price_per_kg!)) : null,
    [operationalOrbitalRockets]
  );
  const lowestCostFormatted = lowestCostPerKg == null ? "Contact provider" : lowestCostPerKg >= 1000
    ? `$${(lowestCostPerKg / 1000).toFixed(1)}K`
    : `$${lowestCostPerKg}`;

  const jsonOrbitsRef = useRef<Orbit[]>([]);
  const jsonRocketsRef = useRef<Rocket[]>([]);
  const [jsonDataStatus, setJsonDataStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    Promise.all([
      fetch("/data/orbits.json").then((r) => r.json() as Promise<JsonOrbitDTO[]>),
      loadLaunchers(),
    ])
      .then(([orbitData, rocketData]) => {
        jsonOrbitsRef.current = orbitData.map(jsonOrbitToOrbit);
        jsonRocketsRef.current = rocketData
          .filter((launcher) => typeof launcher.rideshare_price_per_kg === "number" && launcher.rideshare_price_per_kg > 0)
          .map(jsonRocketToRocket)
          .filter((rocket) => rocket.maxMass > 0);
        setJsonDataStatus("ready");
      })
      .catch(() => {
        setJsonDataStatus("error");
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const missionParam = params.get("mission");
    const configParam = params.get("config");
    if (missionParam) {
      try {
        const decoded = atob(missionParam);
        const missionParams = new URLSearchParams(decoded);
        const orbit = missionParams.get("orbit") || "LEO";
        const mass = Number(missionParams.get("mass") || "10");
        const payload: PayloadConfig = {
          payloadType: "custom",
          mass,
          volume: mass * 0.001,
          orbit,
          region: "any",
        };
        setResults(calculateLogistics(payload, jsonOrbitsRef.current, jsonRocketsRef.current));
        setCurrentPayload(payload);
        setShowResults(true);
        window.history.replaceState({}, "", "/");
      } catch {}
    } else if (configParam) {
      try {
        const decoded = atob(configParam);
        const configParams = new URLSearchParams(decoded);
        const payloadType = configParams.get("type") || "cubesat";
        const orbit = configParams.get("orbit") || "LEO";
        const region = configParams.get("region") || "any";
        const massMap: Record<string, number> = { cubesat: 10, experiment: 50, spareParts: 100, custom: 50 };
        const volMap: Record<string, number> = { cubesat: 0.01, experiment: 0.1, spareParts: 0.5, custom: 0.05 };
        const payload: PayloadConfig = {
          payloadType,
          mass: massMap[payloadType] || 50,
          volume: volMap[payloadType] || 0.05,
          orbit,
          region,
        };
        setResults(calculateLogistics(payload, jsonOrbitsRef.current, jsonRocketsRef.current));
        setCurrentPayload(payload);
        setShowResults(true);
        window.history.replaceState({}, "", "/");
      } catch {}
    }
  }, []);

  const handleCalculate = (payload: PayloadConfig) => {
    setResults(calculateLogistics(payload, jsonOrbitsRef.current, jsonRocketsRef.current));
    setCurrentPayload(payload);
    setShowResults(true);
  };

  const handleBack = () => setShowResults(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation onOpenPricing={() => setShowPricingModal(true)} />

      <main
        id="main-content"
        className="container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-12 flex flex-col"
        role="main"
      >
        {/* Hero */}
        <section className="pt-6 pb-8 text-center" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700 uppercase tracking-wider mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block flex-shrink-0" />
            {getCurrentQuarter()} · Peak Launch Window Open
          </div>
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-medium text-gray-900 mb-3 tracking-tight"
          >
            Calculate. Plan. Launch.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Your payload, any orbit, handled end to end.{" "}
            <span className="text-gray-500">
              Free mission cost calculator — or talk to a launch consultant who can take it from estimate to orbit.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <button
              onClick={openMissionIntake}
              className="w-full sm:w-auto px-6 py-3 bg-[#e3000f] text-white text-sm font-medium min-h-[48px] hover:bg-[#c0000d] transition-colors"
              data-testid="hero-mission-help"
            >
              Get Mission Help
            </button>
            <a
              href="#orbital-planner"
              className="w-full sm:w-auto px-6 py-3 border-2 border-[#e3000f] text-[#e3000f] bg-white text-sm font-medium min-h-[48px] hover:bg-[#e3000f]/5 transition-colors flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("orbital-planner")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Run the Calculator
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Trusted by CubeSat teams, university programs, and emerging space startups.
          </p>
        </section>

        {/* Summer stats strip */}
        <div className="w-full max-w-4xl mx-auto mb-8 bg-amber-50 border border-amber-100 py-4 px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4">
            <Link href="/calendar" className="text-center group">
              <p className="text-xl font-bold text-gray-900 group-hover:text-amber-700 font-mono leading-none transition-colors">
                {upcomingLaunches !== null ? upcomingLaunches : "—"}
              </p>
              <p className="text-[11px] text-amber-700 uppercase tracking-wider mt-1 group-hover:underline underline-offset-2">Launches next 90 days ↗</p>
            </Link>
            <Link href="/rockets" className="text-center sm:border-l sm:border-amber-200 group">
              <p className="text-xl font-bold text-gray-900 group-hover:text-amber-700 font-mono leading-none transition-colors">
                {operationalOrbitalRockets.length}
              </p>
              <p className="text-[11px] text-amber-700 uppercase tracking-wider mt-1 group-hover:underline underline-offset-2">Operational launchers ↗</p>
            </Link>
            <div className="text-center sm:border-l sm:border-amber-200">
              <p className="text-xl font-bold text-gray-900 font-mono leading-none">{providerCount}</p>
              <p className="text-[11px] text-amber-700 uppercase tracking-wider mt-1">Launch providers</p>
            </div>
            <Link href="/compare" className="text-center sm:border-l sm:border-amber-200 group">
              <p className="text-xl font-bold text-gray-900 group-hover:text-amber-700 font-mono leading-none transition-colors">{lowestCostFormatted}</p>
              <p className="text-[11px] text-amber-700 uppercase tracking-wider mt-1 group-hover:underline underline-offset-2">Lowest /kg to LEO ↗</p>
            </Link>
          </div>
        </div>

        {/* Sponsored Banner */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="border border-[#e3000f]/20 bg-[#e3000f]/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="shrink-0 text-[10px] uppercase tracking-wider font-bold bg-[#e3000f]/15 px-2 py-0.5 text-[#e3000f]">Sponsored</span>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Launch Logistics Partner Spot</h4>
                <p className="text-xs text-gray-500">Looking for payload slots on upcoming 2026 trans-lunar flights? Secure your integration window today.</p>
              </div>
            </div>
            <button
              onClick={openMissionIntake}
              className="shrink-0 px-4 py-2 bg-[#e3000f] text-white text-xs font-medium hover:bg-[#c0000d] transition-colors whitespace-nowrap"
            >
              Contact Broker
            </button>
          </div>
        </div>

        {/* Calculator */}
        <div id="orbital-planner" className="w-full max-w-4xl mx-auto">
          {jsonDataStatus === "loading" && (
            <p className="text-xs text-gray-400 text-center mb-2">Loading latest rocket &amp; orbit data…</p>
          )}
          {jsonDataStatus === "error" && (
            <p className="text-xs text-amber-600 text-center mb-2">Using cached data — live pricing unavailable.</p>
          )}
          {!showResults ? (
            <InputPanel onCalculate={handleCalculate} />
          ) : results && (
            <div className="space-y-6">
              <ResultsPanel results={results} onBack={handleBack} payload={currentPayload || undefined} />
              <LeadCaptureForm
                heading="Get a Detailed Mission Report Emailed to You"
                description="Enter your details and we'll send you a personalized mission analysis based on your configuration."
                source="calculator-results"
                context={
                  currentPayload
                    ? `Payload: ${currentPayload.payloadType}, ${currentPayload.mass}kg to ${currentPayload.orbit}`
                    : undefined
                }
                showMessage={false}
                variant="banner"
              />
            </div>
          )}
        </div>

        {/* FAQ */}
        <section className="mt-14 mb-10 max-w-3xl mx-auto w-full" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-medium text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cost">
              <AccordionTrigger className="text-left text-gray-800">How much does it cost to launch a satellite into orbit?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Launch costs vary by orbit, payload size, and service type. Published pricing and payload limits change frequently, so use the launcher database and calculator above for the current sourced figures and availability notes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cheapest">
              <AccordionTrigger className="text-left text-gray-800">What is the cheapest way to launch a payload into space?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Compare published rideshare pricing, payload limits, vehicle status, and availability in the launcher database. Services without public pricing are clearly marked rather than estimated.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rockets">
              <AccordionTrigger className="text-left text-gray-800">What launchers are available for commercial launches in 2026?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Major operational launch vehicles include SpaceX Falcon 9 and Falcon Heavy, ULA Vulcan Centaur, Rocket Lab Electron, ISRO PSLV and GSLV, Arianespace Ariane 6, JAXA H3, and Roscosmos Soyuz. SpaceX Starship is progressing through testing. Our calculator includes 15+ launch vehicles with current pricing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="deltav">
              <AccordionTrigger className="text-left text-gray-800">What is delta-v and why does it matter?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Delta-v (change in velocity) measures the total velocity change needed for a space mission. It determines which rockets can reach your destination. LEO requires ~9.4 km/s, GEO needs ~14 km/s, Moon missions need ~15.5 km/s, and Mars requires ~18+ km/s. Higher delta-v means higher costs and more capable launchers are needed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="orbits">
              <AccordionTrigger className="text-left text-gray-800">What is the difference between LEO, GEO, and MEO orbits?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                LEO (Low Earth Orbit, 200–2,000 km) is used for the ISS, Earth observation, and Starlink. MEO (Medium Earth Orbit, 2,000–35,786 km) is used for GPS and navigation satellites. GEO (Geostationary Orbit, 35,786 km) keeps satellites fixed over one spot and is used for communications and weather. Each orbit type has different cost and delta-v requirements.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="university">
              <AccordionTrigger className="text-left text-gray-800">Can universities launch their own satellites?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes. CubeSat and small satellite programs make space accessible to universities. Our calculator helps academic institutions estimate costs using launchers with publicly available pricing, and the launcher database identifies other providers that require a quote.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="companies">
              <AccordionTrigger className="text-left text-gray-800">How do I find space companies and launch providers by country?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Our <a href="/directory" className="text-[#e3000f] underline">space company directory</a> includes 200+ space industry companies and 155+ space agencies worldwide, searchable by country, segment, and capability. Browse companies across the Americas, Europe, Asia-Pacific, Middle East, and Africa.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="kids">
              <AccordionTrigger className="text-left text-gray-800">What are the best space education resources for kids?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Our free <a href="/kids" className="text-[#e3000f] underline">kids space education section</a> features an interactive "Yeet to Space" calculator, space vocabulary with fun kid-friendly definitions, daily space word challenges, and a leaderboard. Kids can learn about rockets, orbits, delta-v, and mission planning through play.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tracking">
              <AccordionTrigger className="text-left text-gray-800">How do I track upcoming rocket launches in real time?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Our <a href="/launches" className="text-[#e3000f] underline">6-month launch calendar</a> provides real-time data from the Launch Library 2 API. Track launches from SpaceX, ULA, Rocket Lab, ISRO, Arianespace, JAXA, CNSA, and more with countdown timers, mission details, and launch pad information from sites worldwide.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Latest Insights */}
        <section className="mb-10 max-w-3xl mx-auto w-full" aria-labelledby="latest-insights-heading">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF6719]" />
              <h2 id="latest-insights-heading" className="text-2xl font-medium text-gray-900">
                Latest from Orbital Economics
              </h2>
            </div>
            <Link
              href="/insights"
              className="text-sm font-medium text-gray-500 hover:text-[#e3000f] transition-colors inline-flex items-center gap-1"
            >
              All insights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {displayPosts.map((post, i) => {
              const diffDays = (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24);
              const isNew = diffDays <= 7;
              const cardContent = (
                <Card className="bg-white border-gray-200 hover:border-gray-400 transition-all cursor-pointer group h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#e3000f] bg-red-50 px-2 py-0.5">
                        {post.category}
                      </span>
                      {isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#e3000f] text-white animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors leading-snug mb-2 text-[15px]">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-3">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-auto pt-3 border-t border-gray-100">
                      <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
              return post.slug ? (
                <Link key={i} href={`/insights/${post.slug}`}>{cardContent}</Link>
              ) : (
                <a key={i} href={post.externalUrl} target="_blank" rel="noopener noreferrer">{cardContent}</a>
              );
            })}
          </div>
        </section>

        {/* CTAs */}
        <section className="mb-10 max-w-3xl mx-auto w-full space-y-5">
          {/* Report download */}
          <div className="border-2 border-gray-900 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 border-2 border-gray-900 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-900" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-medium text-gray-900 mb-1">2026 Orbital Market Entry Report — Q2/Q3 Update</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Free PDF — Q2/Q3 update covering the SpaceX IPO mechanics, New Glenn grounding, Neutron slip, Stoke Space's Pacific Northwest pipeline, and what the FY27 NASA budget means for capital allocation.
                </p>
                {reportSubmitted ? (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Your report is downloading now!</span>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!reportEmail.trim()) return;
                      setReportSubmitted(true);
                      try {
                        const resp = await fetch("/api/download-report", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: reportEmail }),
                        });
                        const data = await resp.json();
                        if (data.downloadUrl) {
                          const link = document.createElement("a");
                          link.href = data.downloadUrl;
                          link.download = "2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      } catch {
                        window.open("/2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf", "_blank");
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      required
                      className="flex-1 border-gray-300"
                    />
                    <Button
                      type="submit"
                      className="bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm flex-shrink-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Get Free Report
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Substack */}
          <div className="border-2 border-[#e3000f] p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <SiSubstack className="w-6 h-6 text-[#FF6719]" />
              <h2 className="text-xl font-medium text-gray-900">Stay Ahead of the Space Economy</h2>
            </div>
            <p className="text-gray-600 mb-5 max-w-lg mx-auto">
              Get weekly analysis of launch market trends, capital flows, and the business of getting to orbit — delivered straight to your inbox via Orbital Economics.
            </p>
            <a
              href="https://open.substack.com/pub/orbitaleconomics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] border-2 border-[#e3000f] text-[#e3000f] hover:bg-[#e3000f] hover:text-white font-medium transition-colors"
            >
              Subscribe to Orbital Economics
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </main>

      <PricingPreviewModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </div>
  );
}
