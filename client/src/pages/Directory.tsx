import { useState, useMemo } from "react";
import { Link } from "wouter";
import { 
  Search, 
  Building2, 
  Globe, 
  Layers,
  ChevronRight,
  Plus,
  Landmark,
  Mail,
  ExternalLink,
  Share2,
  Copy,
  MapPin
} from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  spaceCompanies, 
  getCompaniesByCountry, 
  getCompaniesBySegment,
  getCountryStats,
  searchCompanies,
  DIRECTORY_LAST_UPDATED,
  US_STATE_NAMES,
  extractUSState,
} from "@/lib/companyDirectory";
import { 
  spaceAgencies,
  searchAgencies,
  REGION_LABELS,
  type SpaceAgency
} from "@/lib/spaceAgencies";
import { 
  SEGMENT_LABELS, 
  type SpaceCompany,
  type SegmentType 
} from "@shared/schema";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { AerospaceRelocation } from "@/components/AerospaceRelocation";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";

const SUBSTACK_URL = "https://open.substack.com/pub/orbitaleconomics";

function CompanyCard({ company }: { company: SpaceCompany }) {
  return (
    <Link href={`/directory/${company.id}`}>
      <Card 
        className="bg-white border-gray-200 hover:border-rail-red/50 transition-all cursor-pointer group shadow-sm"
        data-testid={`company-card-${company.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-xl font-bold text-rail-red shrink-0">
              {company.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-rail-red transition-colors">
                  {company.name}
                </h3>
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 shrink-0">{company.countryCode}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{company.headquartersCity}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {company.segments.slice(0, 2).map(segment => (
                  <Badge 
                    key={segment} 
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-0 border border-gray-200"
                  >
                    {SEGMENT_LABELS[segment]}
                  </Badge>
                ))}
                {company.segments.length > 2 && (
                  <Badge className="bg-gray-50 text-gray-500 text-xs px-2 py-0">
                    +{company.segments.length - 2}
                  </Badge>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rail-red transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AgencyCard({ 
  agency, 
  selected, 
  onSelect 
}: { 
  agency: SpaceAgency; 
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Card 
      className={`bg-white border-gray-200 transition-all shadow-sm ${selected ? 'border-rail-red ring-1 ring-rail-red' : 'hover:border-gray-300'}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center pt-1">
            <Checkbox 
              checked={selected}
              onCheckedChange={() => onSelect(agency.id)}
              className="border-gray-300 data-[state=checked]:bg-rail-red data-[state=checked]:border-rail-red"
            />
          </div>
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-sm font-bold text-rail-red shrink-0">
            {agency.acronym.slice(0, 3)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm">
                {agency.acronym}
              </h3>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5">{agency.countryCode}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{agency.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{agency.country}</p>
            <div className="flex items-center gap-2 mt-2">
              {agency.email ? (
                <a 
                  href={`mailto:${agency.email}`}
                  className="inline-flex items-center gap-1 text-xs text-rail-red hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="w-3 h-3" />
                  {agency.email.length > 25 ? agency.email.slice(0, 22) + "..." : agency.email}
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">No email</span>
              )}
              <a 
                href={agency.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OutreachPanel({ 
  selectedAgencies, 
  onClear 
}: { 
  selectedAgencies: SpaceAgency[];
  onClear: () => void;
}) {
  const { toast } = useToast();
  const emailsWithContact = selectedAgencies.filter(a => a.email);
  
  const generateEmailList = () => {
    return emailsWithContact.map(a => a.email).join(", ");
  };
  
  const generateBccLink = () => {
    const emails = emailsWithContact.map(a => a.email).join(",");
    const subject = encodeURIComponent("Space Economy Insights from Orbital Economics");
    const body = encodeURIComponent(`Dear Space Industry Colleagues,

I wanted to share our latest space economy research and investment insights from Orbital Economics.

Visit our Substack for the latest analysis: ${SUBSTACK_URL}

Best regards`);
    return `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
  };

  const copyEmails = () => {
    navigator.clipboard.writeText(generateEmailList());
    toast({
      title: "Emails copied",
      description: `${emailsWithContact.length} email addresses copied to clipboard`,
    });
  };

  if (selectedAgencies.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-rail-red shadow-lg p-4 max-w-xl w-full mx-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-rail-red flex items-center justify-center">
            <Share2 className="w-5 h-5 text-rail-red" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {selectedAgencies.length} selected
            </p>
            <p className="text-xs text-gray-500">
              {emailsWithContact.length} with email addresses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyEmails}
            disabled={emailsWithContact.length === 0}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy emails
          </Button>
          <a href={generateBccLink()}>
            <Button
              size="sm"
              disabled={emailsWithContact.length === 0}
              className="bg-rail-red hover:bg-rail-red/90 text-white"
            >
              <SiSubstack className="w-4 h-4 mr-1" />
              Share Substack
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-gray-500"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

function CompanyListView({ searchQuery, activeLetter }: { searchQuery: string; activeLetter: string }) {
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...spaceCompanies].sort((a, b) => a.name.localeCompare(b.name));
    }
    return searchCompanies(searchQuery);
  }, [searchQuery]);

  const groupedByLetter = useMemo(() => {
    const groups: Record<string, SpaceCompany[]> = {};
    filteredCompanies.forEach(company => {
      const letter = company.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(company);
    });
    return groups;
  }, [filteredCompanies]);

  const availableLetters = useMemo(
    () => Object.keys(groupedByLetter).sort(),
    [groupedByLetter]
  );

  const displayedGroups = useMemo(() => {
    if (activeLetter === "all") return availableLetters;
    return availableLetters.filter(l => l === activeLetter);
  }, [availableLetters, activeLetter]);

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">
        {filteredCompanies.length} companies found
        {activeLetter !== "all" && <span> — <span className="font-semibold text-rail-red">{activeLetter}</span></span>}
      </p>

      {/* Featured sponsor slot */}
      <a
        href="mailto:vlad@orbit2orbitexpress.com?subject=Featured Company Listing"
        className="block border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 transition-colors mb-2"
      >
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-medium border border-amber-400/40 bg-amber-100 text-amber-800 mt-0.5">
              Featured Provider
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Your Company Here</p>
              <p className="text-xs text-gray-500">Reach 150+ space companies and agencies browsing this directory. Featured listings appear above all results.</p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-amber-700 font-medium whitespace-nowrap">Enquire about placement →</span>
        </div>
      </a>

      {displayedGroups.map(letter => (
        <div key={letter}>
          <h3 className="text-2xl font-semibold text-rail-red mb-4 sticky top-16 bg-gray-50 py-2 z-10">
            {letter}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupedByLetter[letter].map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      ))}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No companies found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

function AgencyListView({ 
  searchQuery,
  selectedIds,
  onToggleSelect
}: { 
  searchQuery: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  const filteredAgencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...spaceAgencies].sort((a, b) => a.name.localeCompare(b.name));
    }
    return searchAgencies(searchQuery);
  }, [searchQuery]);

  const agenciesByRegion = useMemo(() => {
    const grouped: Record<string, SpaceAgency[]> = {};
    filteredAgencies.forEach(agency => {
      const region = REGION_LABELS[agency.region];
      if (!grouped[region]) grouped[region] = [];
      grouped[region].push(agency);
    });
    return grouped;
  }, [filteredAgencies]);

  const regionOrder = ["Americas", "Europe", "Asia-Pacific", "Middle East", "Africa", "International"];

  const selectAllInRegion = (region: string) => {
    const agenciesInRegion = agenciesByRegion[region] || [];
    agenciesInRegion.forEach(a => {
      if (!selectedIds.has(a.id)) {
        onToggleSelect(a.id);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-gray-500 text-sm">
          {filteredAgencies.length} agencies • {filteredAgencies.filter(a => a.email).length} with email contacts
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Select by region:</span>
          {regionOrder.map(region => (
            agenciesByRegion[region]?.length > 0 && (
              <Button
                key={region}
                variant="outline"
                size="sm"
                onClick={() => selectAllInRegion(region)}
                className="text-xs border-gray-300 hover:border-rail-red hover:text-rail-red"
              >
                {region}
              </Button>
            )
          ))}
        </div>
      </div>

      {regionOrder.map(region => (
        agenciesByRegion[region]?.length > 0 && (
          <div key={region}>
            <div className="flex items-center gap-3 mb-4 sticky top-16 bg-gray-50 py-2 z-10">
              <h3 className="text-xl font-semibold text-rail-red">
                {region}
              </h3>
              <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                {agenciesByRegion[region].length} agencies
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agenciesByRegion[region].map(agency => (
                <AgencyCard 
                  key={agency.id} 
                  agency={agency} 
                  selected={selectedIds.has(agency.id)}
                  onSelect={onToggleSelect}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {filteredAgencies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No agencies found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

function USStateListView() {
  const usCompanies = useMemo(
    () => spaceCompanies.filter(c => c.countryCode === "US"),
    []
  );

  const stateGroups = useMemo(() => {
    const groups: Record<string, SpaceCompany[]> = {};
    usCompanies.forEach(company => {
      const code = extractUSState(company.headquartersCity);
      if (!code) return;
      if (!groups[code]) groups[code] = [];
      groups[code].push(company);
    });
    return groups;
  }, [usCompanies]);

  const sortedStates = useMemo(
    () =>
      Object.entries(stateGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([code]) => code),
    [stateGroups]
  );

  const [selectedState, setSelectedState] = useState<string>(() => sortedStates[0] ?? "");

  const companies = stateGroups[selectedState] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-gray-500 text-sm">
            {usCompanies.length} US companies across {sortedStates.length} states
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-rail-red focus:ring-rail-red">
              <MapPin className="w-4 h-4 text-rail-red mr-2 shrink-0" />
              <SelectValue placeholder="Select a state…" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 max-h-72">
              {sortedStates.map(code => (
                <SelectItem key={code} value={code} className="focus:bg-gray-50 focus:text-rail-red">
                  <span className="font-medium">{US_STATE_NAMES[code] ?? code}</span>
                  <span className="ml-2 text-gray-400 text-xs">
                    {stateGroups[code].length} {stateGroups[code].length === 1 ? "company" : "companies"}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedState && (
        <>
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <span className="text-sm font-mono bg-rail-red text-white px-2 py-1 font-semibold">{selectedState}</span>
            <h3 className="font-display font-semibold text-gray-900 text-lg">
              {US_STATE_NAMES[selectedState] ?? selectedState}
            </h3>
            <Badge className="border-2 border-rail-red text-rail-red bg-transparent ml-auto">
              {companies.length} {companies.length === 1 ? "company" : "companies"}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function CountryListView() {
  const countryStats = useMemo(() => getCountryStats(), []);
  const companiesByCountry = useMemo(() => getCompaniesByCountry(), []);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">
        {countryStats.length} countries represented
      </p>
      {countryStats.map(({ country, countryCode, count }) => (
        <div key={country} className="border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setExpandedCountry(expandedCountry === country ? null : country)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            data-testid={`country-toggle-${countryCode}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono bg-gray-100 text-rail-red px-2 py-1 font-semibold">{countryCode}</span>
              <span className="font-display font-semibold text-gray-900 text-lg">{country}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="border-2 border-rail-red text-rail-red bg-transparent">{count} companies</Badge>
              <ChevronRight 
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedCountry === country ? 'rotate-90' : ''}`} 
              />
            </div>
          </button>
          {expandedCountry === country && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {companiesByCountry[country]?.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SegmentListView() {
  const companiesBySegment = useMemo(() => getCompaniesBySegment(), []);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const segmentStats = useMemo(() => {
    return Object.entries(companiesBySegment)
      .map(([segment, companies]) => ({
        segment: segment as SegmentType,
        count: companies.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [companiesBySegment]);

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm mb-6">
        14 industry segments
      </p>
      {segmentStats.map(({ segment, count }) => (
        <div key={segment} className="border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setExpandedSegment(expandedSegment === segment ? null : segment)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            data-testid={`segment-toggle-${segment}`}
          >
            <div className="flex items-center gap-3">
              <Badge className="bg-gray-100 text-gray-700 px-3 py-1">
                {SEGMENT_LABELS[segment]}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{count} companies</span>
              <ChevronRight 
                className={`w-5 h-5 text-gray-400 transition-transform ${expandedSegment === segment ? 'rotate-90' : ''}`} 
              />
            </div>
          </button>
          {expandedSegment === segment && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {companiesBySegment[segment]?.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Directory() {
  useSEO({
    title: "Space Industry Company Directory - 200+ Aerospace Companies & Agencies",
    description: "Browse the most comprehensive space industry directory with 200+ aerospace companies and 155+ space agencies worldwide. Find launch providers, satellite manufacturers, ground stations, and aerospace startups by country, segment, and capability. Includes SpaceX, NASA, ESA, ISRO, JAXA, CNSA, UAE Space Agency, Saudi Space Commission, and more.",
    canonical: "/directory",
    keywords: "space company directory, aerospace companies list, space industry companies, launch providers list, satellite manufacturers, space agencies directory, commercial space companies, space startups, aerospace industry directory 2026, space company database, space companies in USA, space companies in India, space companies in China, space companies in Japan, space companies in UAE, space companies in Saudi Arabia, space companies in Luxembourg, space companies in France, space companies in Germany, space companies in UK, space companies in Israel, space companies in South Korea, space companies in Brazil, space companies in Argentina, space companies in Chile, space companies in Australia, space companies in New Zealand, space companies in Canada, space companies in Italy, space companies in Russia, Blue Origin Kent WA, SpaceX Redmond, Amazon Kuiper Kirkland, Boeing Everett, Aerojet Rocketdyne, Space Alley Seattle, Pacific Northwest aerospace, ground station operators, satellite bus manufacturers, space propulsion companies, space launch brokers",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Space Industry Company Directory",
      "description": "Comprehensive directory of 200+ space industry companies, launch providers, satellite manufacturers, and space agencies worldwide.",
      "url": "https://www.orbit2orbitexpress.com/directory",
      "numberOfItems": 200,
      "itemListOrder": "https://schema.org/ItemListUnordered"
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("companies");
  const [activeLetter, setActiveLetter] = useState<string>("all");
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<Set<string>>(new Set());

  const availableLetters = useMemo(
    () => [...new Set(spaceCompanies.map(c => c.name.charAt(0).toUpperCase()))].sort(),
    []
  );

  const toggleAgencySelection = (id: string) => {
    setSelectedAgencyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedAgencies = useMemo(() => {
    return spaceAgencies.filter(a => selectedAgencyIds.has(a.id));
  }, [selectedAgencyIds]);

  const clearSelection = () => {
    setSelectedAgencyIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />

      <main id="main-content" className="max-w-7xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-24" role="main">

        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-rail-red" aria-hidden="true"></div>
                <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
                  Space Industry Directory
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl">
                Comprehensive database of 160+ companies and 140+ space agencies worldwide. 
                Select agencies to build outreach lists and share Orbital Economics insights.
              </p>
              <p className="mt-3 text-sm text-gray-400">
                Updated {DIRECTORY_LAST_UPDATED}
              </p>
            </div>
            <Link href="/suggest-company">
              <Button className="px-4 py-2 border-2 border-rail-red bg-transparent hover:bg-rail-red text-rail-red hover:text-white text-sm font-medium whitespace-nowrap transition-colors" data-testid="button-suggest-company">
                <Plus className="w-4 h-4 mr-2" />
                Suggest a Company
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies, agencies, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-rail-red"
              data-testid="input-search"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex items-center flex-wrap gap-1 bg-white border border-gray-200 w-full sm:w-auto p-1">
            {/* Letter dropdown replacing the A-Z tab */}
            <Select
              value={activeLetter}
              onValueChange={(val) => { setActiveLetter(val); setActiveTab("companies"); }}
            >
              <SelectTrigger
                data-testid="tab-companies"
                className={`w-auto inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-auto shadow-none focus:ring-0 whitespace-nowrap rounded-sm ${activeTab === "companies" ? "border border-rail-red bg-rail-red/5 text-rail-red font-medium" : "border border-transparent bg-transparent text-gray-700 hover:text-gray-900"}`}
              >
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <SelectValue placeholder="A–Z" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all" className="focus:bg-gray-50 focus:text-rail-red">All companies</SelectItem>
                {availableLetters.map(l => (
                  <SelectItem key={l} value={l} className="focus:bg-gray-50 focus:text-rail-red">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TabsList className="bg-transparent border-0 shadow-none p-0 gap-1 h-auto flex-wrap inline-flex">
              <TabsTrigger 
                value="agencies" 
                className="data-[state=active]:border-2 data-[state=active]:border-rail-red data-[state=active]:text-rail-red data-[state=active]:bg-transparent flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                data-testid="tab-agencies"
              >
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden min-[400px]:inline">Gov</span>
                <Badge className="bg-rail-red/10 text-rail-red text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 ml-0.5 sm:ml-1">140+</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="countries" 
                className="data-[state=active]:border-2 data-[state=active]:border-rail-red data-[state=active]:text-rail-red data-[state=active]:bg-transparent flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                data-testid="tab-countries"
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden min-[400px]:inline">Countries</span>
              </TabsTrigger>
              <TabsTrigger 
                value="us-states"
                className="data-[state=active]:border-2 data-[state=active]:border-rail-red data-[state=active]:text-rail-red data-[state=active]:bg-transparent flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                data-testid="tab-us-states"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden min-[400px]:inline">US State</span>
              </TabsTrigger>
              <TabsTrigger 
                value="segments" 
                className="data-[state=active]:border-2 data-[state=active]:border-rail-red data-[state=active]:text-rail-red data-[state=active]:bg-transparent flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5"
                data-testid="tab-segments"
              >
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden min-[400px]:inline">Segment</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="companies" className="mt-6">
            <CompanyListView searchQuery={searchQuery} activeLetter={activeLetter} />
          </TabsContent>

          <TabsContent value="agencies" className="mt-6">
            <AgencyListView 
              searchQuery={searchQuery} 
              selectedIds={selectedAgencyIds}
              onToggleSelect={toggleAgencySelection}
            />
          </TabsContent>

          <TabsContent value="countries" className="mt-6">
            <CountryListView />
          </TabsContent>

          <TabsContent value="us-states" className="mt-6">
            <USStateListView />
          </TabsContent>

          <TabsContent value="segments" className="mt-6">
            <SegmentListView />
          </TabsContent>
        </Tabs>
      </main>

      <OutreachPanel 
        selectedAgencies={selectedAgencies} 
        onClear={clearSelection}
      />

      <AerospaceRelocation variant="featured" />

      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
        <LeadCaptureForm
          heading="Need Help Choosing a Launch Provider? Talk to Us"
          description="With 200+ companies and agencies in our directory, finding the right match can be overwhelming. Tell us about your mission and we'll help you narrow it down."
          source="directory"
          variant="banner"
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
        <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">Related Resources</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/">
            <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
              <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Orbital Planner</h4>
              <p className="text-xs text-gray-500">Calculate mission costs with real data from providers in this directory</p>
            </div>
          </Link>
          <Link href="/launches">
            <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
              <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Launch Calendar</h4>
              <p className="text-xs text-gray-500">See upcoming launches from companies listed in our directory</p>
            </div>
          </Link>
          <Link href="/insights">
            <div className="bg-gray-50 border border-gray-200 hover:border-rail-red/50 p-5 transition-all cursor-pointer group">
              <h4 className="font-semibold text-gray-900 group-hover:text-rail-red transition-colors mb-1">Industry Insights</h4>
              <p className="text-xs text-gray-500">Analysis of launch economics and provider comparisons</p>
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
