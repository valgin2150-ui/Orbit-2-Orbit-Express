import { useMemo, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ExternalLink, 
  Linkedin, 
  MapPin, 
  Calendar, 
  Users,
  Building2,
  Trophy,
  Rocket,
  ChevronRight,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getCompanyById, 
  spaceCompanies
} from "@/lib/companyDirectory";
import { formatLauncherPrice, useLaunchers } from "@/lib/launcherData";
import { 
  SEGMENT_LABELS, 
  SEGMENT_COLORS, 
  COMPANY_TYPE_LABELS 
} from "@shared/schema";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSEO } from "@/hooks/useSEO";

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", IT: "🇮🇹", ES: "🇪🇸",
  CN: "🇨🇳", IN: "🇮🇳", JP: "🇯🇵", RU: "🇷🇺", CA: "🇨🇦", AU: "🇦🇺",
  NZ: "🇳🇿", IL: "🇮🇱", KR: "🇰🇷", AE: "🇦🇪", SA: "🇸🇦", BR: "🇧🇷",
  MX: "🇲🇽", AR: "🇦🇷", PL: "🇵🇱", NO: "🇳🇴", SE: "🇸🇪", DK: "🇩🇰",
  SG: "🇸🇬", ZA: "🇿🇦", LU: "🇱🇺", TR: "🇹🇷", EU: "🇪🇺", FI: "🇫🇮",
};

interface Launch {
  id: string;
  name: string;
  net: string;
  status: { name: string };
  rocket: { configuration: { name: string } };
  mission?: { name: string; description: string };
  pad?: { name: string; location: { name: string } };
  launch_service_provider?: { name: string };
}

export default function CompanyDetail() {
  const params = useParams<{ id: string }>();
  const company = useMemo(() => getCompanyById(params.id || ""), [params.id]);
  const { launchers } = useLaunchers();

  useSEO({
    title: company ? `${company.name} - Space Company Profile & Launch Info` : "Space Company Profile",
    description: company
      ? `Learn about ${company.name}, a ${company.companyType} space company based in ${company.country}. View capabilities, launch history, and mission details.`
      : "Detailed space company profile with capabilities, launch history, and mission information.",
    canonical: `/directory/${params.id || ""}`,
    keywords: company
      ? `${company.name}, ${company.country} space company, ${company.segments.join(", ")}, aerospace company profile`
      : "space company profile, aerospace company details",
  });

  // Track company page views for popularity analytics
  useEffect(() => {
    if (company && typeof window !== "undefined" && (window as any).plausible) {
      (window as any).plausible("company_view", {
        props: { company: company.name, country: company.country, segment: company.segments[0] || "unknown" }
      });
    }
  }, [company?.id]);

  const isLaunchProvider = company?.segments.includes("launch_provider");

  const { data: launchData, isLoading: launchesLoading } = useQuery<{ launches: Launch[] }>({
    queryKey: ["/api/launches"],
    enabled: isLaunchProvider
  });

  const companyLaunches = useMemo(() => {
    if (!company || !launchData?.launches) return [];
    const companyNameLower = company.name.toLowerCase();
    return launchData.launches
      .filter(launch => {
        const providerName = launch.launch_service_provider?.name?.toLowerCase() || "";
        return providerName.includes(companyNameLower) || 
               companyNameLower.includes(providerName.split(" ")[0]);
      })
      .slice(0, 5);
  }, [company, launchData]);

  const relatedByCountry = useMemo(() => {
    if (!company) return [];
    return spaceCompanies
      .filter(c => c.country === company.country && c.id !== company.id)
      .slice(0, 6);
  }, [company]);

  const relatedBySegment = useMemo(() => {
    if (!company) return [];
    return spaceCompanies
      .filter(c => 
        c.id !== company.id && 
        c.segments.some(s => company.segments.includes(s))
      )
      .slice(0, 6);
  }, [company]);

  const companyRockets = useMemo(() => {
    if (!company) return [];
    return launchers.filter(r =>
      r.provider.toLowerCase().includes(company.name.toLowerCase()) ||
      company.name.toLowerCase().includes(r.provider.toLowerCase())
    );
  }, [company, launchers]);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">Company Not Found</h1>
          <Link href="/directory">
            <Button className="bg-[#e3000f] hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-8">
        <div className="flex items-center mb-8">
          <Link href="/directory" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors min-h-[44px]" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Directory</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-bold text-[#e3000f] shrink-0">
                {company.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                    {company.name}
                  </h1>
                  <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1">{company.countryCode}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.headquartersCity}, {company.country}</span>
                  </div>
                  {company.foundedYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {company.foundedYear}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {company.segments.map(segment => (
                    <Badge 
                      key={segment} 
                      className={`${SEGMENT_COLORS[segment]} text-white`}
                    >
                      {SEGMENT_LABELS[segment]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* About */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-[#e3000f]" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{company.description}</p>
              </CardContent>
            </Card>

            {/* Notable Achievements */}
            {company.notableAchievements && company.notableAchievements.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Notable Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {company.notableAchievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-yellow-500 mt-0.5">★</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Active Products */}
            {company.activeProducts && company.activeProducts.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                    <Rocket className="w-5 h-5 text-[#e3000f]" />
                    Active Products & Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.activeProducts.map((product, i) => (
                      <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Launch Vehicles */}
            {companyRockets.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                    <Rocket className="w-5 h-5 text-[#e3000f]" />
                    Launch Vehicles in Our Orbital Planner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {companyRockets.map(rocket => (
                      <div key={rocket.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900">{rocket.vehicle_name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatLauncherPrice(rocket)} · {rocket.payload_leo_kg?.toLocaleString() ?? "—"} kg max
                          </p>
                        </div>
                        <Link href="/">
                          <Button variant="outline" size="sm" className="border-[#e3000f] text-[#e3000f] hover:bg-red-50">
                            Calculate
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href="/launches">
                      <Button variant="ghost" className="text-[#e3000f] hover:text-red-700 p-0" data-testid="link-launches">
                        View upcoming launches →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Launches */}
            {isLaunchProvider && (
              <Card className="bg-white border-gray-200 shadow-sm" data-testid="card-upcoming-launches">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Upcoming Launches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {launchesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full bg-gray-200" />
                      ))}
                    </div>
                  ) : companyLaunches.length > 0 ? (
                    <div className="space-y-2">
                      {companyLaunches.map(launch => (
                        <div key={launch.id} className="p-3 bg-gray-50 border border-gray-200" data-testid={`launch-item-${launch.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{launch.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {launch.rocket?.configuration?.name}
                              </p>
                              {launch.pad?.location?.name && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  📍 {launch.pad.location.name}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {new Date(launch.net).toLocaleDateString()}
                              </div>
                              <Badge 
                                className={`text-xs mt-1 text-white ${
                                  launch.status?.name === "Go" ? "bg-green-600" : 
                                  launch.status?.name === "TBD" ? "bg-yellow-600" : "bg-gray-400"
                                }`}
                              >
                                {launch.status?.name || "TBD"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link href="/launches">
                          <Button variant="ghost" className="text-[#e3000f] hover:text-red-700 p-0" data-testid="link-all-launches">
                            View full launch calendar →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm mb-3">No upcoming launches found in calendar</p>
                      <Link href="/launches">
                        <Button variant="outline" size="sm" className="border-[#e3000f] text-[#e3000f] hover:bg-red-50">
                          Browse Launch Calendar
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Company Type</p>
                  <p className="text-gray-900 font-medium">{COMPANY_TYPE_LABELS[company.companyType]}</p>
                </div>
                {company.employeeRange && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Employees</p>
                    <p className="text-gray-900 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {company.employeeRange}
                    </p>
                  </div>
                )}
                {company.fundingStage && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Funding Stage</p>
                    <p className="text-gray-900 font-medium">{company.fundingStage}</p>
                  </div>
                )}
                <Separator className="bg-gray-200" />
                <div className="space-y-3">
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#e3000f] hover:text-red-700 transition-colors text-sm font-medium"
                    data-testid="link-website"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                  {company.linkedin && (
                    <a 
                      href={company.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#e3000f] hover:text-red-700 transition-colors text-sm font-medium"
                      data-testid="link-linkedin"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {relatedByCountry.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                    <span>{COUNTRY_FLAGS[company.countryCode]}</span>
                    More from {company.country}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {relatedByCountry.map(c => (
                      <Link 
                        key={c.id} 
                        href={`/directory/${c.id}`}
                        className="block p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <p className="text-gray-900 font-medium text-sm group-hover:text-[#e3000f]">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.headquartersCity}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {relatedBySegment.length > 0 && (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 text-lg">Similar Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {relatedBySegment.map(c => (
                      <Link 
                        key={c.id} 
                        href={`/directory/${c.id}`}
                        className="block p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{COUNTRY_FLAGS[c.countryCode]}</span>
                          <p className="text-gray-900 font-medium text-sm">{c.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
