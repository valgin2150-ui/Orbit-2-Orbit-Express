import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { ChevronRight, Globe, ArrowRight } from "lucide-react";

interface OrbitData {
  name: string;
  slug: string;
  abbreviation: string;
  altitudeKm: string;
  deltaVKms: number;
  category: string;
  typicalUseCases: string[];
  exampleMissions: string[];
  description: string;
}

const CATEGORIES = ["Earth Orbits", "Special Earth Orbits", "Deep Space"];

const CATEGORY_META: Record<string, { icon: string; desc: string }> = {
  "Earth Orbits": {
    icon: "🌍",
    desc: "Standard circular and elliptical orbits around Earth — the backbone of commercial satellite operations.",
  },
  "Special Earth Orbits": {
    icon: "🛰️",
    desc: "Specialized orbital regimes engineered for specific coverage, resonance, or transfer requirements.",
  },
  "Deep Space": {
    icon: "🚀",
    desc: "Beyond Earth orbit — the Moon, Mars, asteroid belt, outer planets, and interplanetary transfer trajectories.",
  },
};

const DELTA_V_COLOR = (dv: number) => {
  if (dv < 10) return "text-green-700 bg-green-50 border-green-200";
  if (dv < 13) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
};

const currentYear = new Date().getFullYear();

export default function Orbits() {
  useSEO({
    title: `Orbital Destinations ${currentYear}: LEO, GEO, SSO, Moon, Mars & Beyond | Orbit to Orbit Express`,
    description:
      "Complete orbital destination reference for space mission planners. Delta-V requirements, altitude ranges, typical use cases, and example missions for every orbit — LEO, GEO, SSO, TLI, LLO, Mars, and deep space. Updated for 2026.",
    canonical: "/orbits",
    keywords: "orbital destinations, LEO altitude, GEO orbit, SSO orbit, delta-v requirements, lunar orbit, Mars orbit, deep space missions, orbit types explained, satellite orbit selection, space mission planning orbits",
  });

  const [orbits, setOrbits] = useState<OrbitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/orbits.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load orbit data");
        return r.json();
      })
      .then((data) => {
        setOrbits(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Orbits load error:", err);
        setError("Could not load orbit data. Please try again.");
        setLoading(false);
      });
  }, []);

  const byCategory = (cat: string) => orbits.filter((o) => o.category === cat);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content" className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-10">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-3">
              <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-900">Orbital Destinations</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 border-2 border-[#e3000f] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe className="w-5 h-5 text-[#e3000f]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
                  Orbital Destinations
                </h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">
                  {orbits.length > 0 ? `${orbits.length} destinations` : "Complete orbit database"}{" "}
                  — LEO to deep space · delta-V, altitude, use cases
                </p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-[#e3000f] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">Loading</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Delta-V tier guide */}
          {!loading && !error && orbits.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 p-4 bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <span className="font-mono font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Δv guide</span>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-500 flex-shrink-0" />
                  <span className="text-green-700 font-medium">&lt;10 km/s</span>
                  <span className="text-gray-400">— LEO / Near-Earth</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 flex-shrink-0" />
                  <span className="text-amber-700 font-medium">10–13 km/s</span>
                  <span className="text-gray-400">— GEO / Moon</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-medium">&gt;13 km/s</span>
                  <span className="text-gray-400">— Deep Space</span>
                </span>
              </div>
              <Link href="/" className="sm:ml-auto flex items-center gap-1 text-[#e3000f] hover:underline flex-shrink-0 font-medium">
                Calculate mission cost <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Sections by category */}
          {!loading && !error && (
            <div className="space-y-12">
              {CATEGORIES.map((cat) => {
                const group = byCategory(cat);
                if (group.length === 0) return null;
                const meta = CATEGORY_META[cat];
                return (
                  <section key={cat}>
                    {/* Category header */}
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">{cat}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
                      </div>
                      <span className="ml-auto text-xs font-mono text-gray-400">
                        {group.length} orbit{group.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.map((orbit) => (
                        <Link
                          key={orbit.slug}
                          href={`/orbits/${orbit.slug}`}
                          className="group block border border-gray-200 hover:border-[#e3000f] transition-colors bg-white"
                        >
                          <div className="p-4">
                            {/* Abbreviation badge */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-block px-2 py-0.5 text-xs font-bold font-mono text-[#e3000f] bg-red-50 border border-red-100">
                                {orbit.abbreviation}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium border ${DELTA_V_COLOR(orbit.deltaVKms)}`}
                              >
                                Δv {orbit.deltaVKms} km/s
                              </span>
                            </div>

                            {/* Name */}
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors leading-tight mb-1">
                              {orbit.name}
                            </h3>

                            {/* Altitude */}
                            <p className="text-xs text-gray-500 font-mono mb-3">{orbit.altitudeKm}</p>

                            {/* Use cases */}
                            <div className="border-t border-gray-100 pt-3 space-y-1">
                              {orbit.typicalUseCases.slice(0, 2).map((uc, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#e3000f] text-[10px] mt-0.5 flex-shrink-0">▸</span>
                                  <span className="text-[11px] text-gray-600 leading-snug">{uc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Footer CTA */}
                          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                              {orbit.category}
                            </span>
                            <span className="text-xs text-[#e3000f] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Details <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* Calculator CTA */}
              <div className="border border-gray-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Calculate your mission cost</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select any orbit in the Orbital Planner to get compatible rockets, delta-V, and estimated launch cost.
                  </p>
                </div>
                <Link
                  href="/"
                  className="flex-shrink-0 px-4 py-2 bg-[#e3000f] text-white text-xs font-medium hover:bg-[#c0000d] transition-colors"
                >
                  Open Planner
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
