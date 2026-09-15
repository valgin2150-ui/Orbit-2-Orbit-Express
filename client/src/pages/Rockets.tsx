import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpDown, ChevronRight, Filter, Rocket } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DataLabel } from "@/components/DataLabel";
import { LaunchMarketReviewStamp } from "@/components/LaunchMarketReviewStamp";
import {
  formatLauncherPrice,
  hasPublishedPerKgPrice,
  useLaunchers,
  type VehicleStatus,
} from "@/lib/launcherData";
import { useSEO } from "@/hooks/useSEO";

const STATUS_STYLE: Record<VehicleStatus, string> = {
  Operational: "bg-green-100 text-green-800 border-green-200",
  "Limited–government only": "bg-violet-100 text-violet-800 border-violet-200",
  "In flight test": "bg-blue-100 text-blue-800 border-blue-200",
  "In development": "bg-amber-100 text-amber-800 border-amber-200",
  Retired: "bg-gray-100 text-gray-600 border-gray-200",
  Planned: "bg-slate-100 text-slate-700 border-slate-200",
};

const sizeClasses = ["All", "Micro", "Small", "Medium", "Heavy", "Super-heavy"];

export default function Rockets() {
  useSEO({
    title: "Launch Vehicles: Canonical Launcher Database | Orbit to Orbit Express",
    description: "Compare launcher payload capacity, publicly available pricing, provider, commercial availability, and operating status.",
    canonical: "/rockets",
  });

  const { launchers, loading, error } = useLaunchers();
  const [size, setSize] = useState("All");
  const [sort, setSort] = useState<"default" | "price" | "payload">("default");

  const displayed = useMemo(() => {
    const filtered = size === "All"
      ? launchers
      : launchers.filter((launcher) => launcher.size_class === size.toLowerCase());
    return [...filtered].sort((a, b) => {
      if (sort === "price") return (a.rideshare_price_per_kg ?? Infinity) - (b.rideshare_price_per_kg ?? Infinity);
      if (sort === "payload") return (b.payload_leo_kg ?? 0) - (a.payload_leo_kg ?? 0);
      return 0;
    });
  }, [launchers, size, sort]);

  const operationalCount = launchers.filter((launcher) => launcher.vehicle_status === "Operational").length;
  const cheapest = launchers
    .filter((launcher) => launcher.vehicle_status === "Operational" && hasPublishedPerKgPrice(launcher))
    .sort((a, b) => a.rideshare_price_per_kg! - b.rideshare_price_per_kg!)[0];
  const highestLift = [...launchers].sort((a, b) => (b.payload_leo_kg ?? 0) - (a.payload_leo_kg ?? 0))[0];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-rail-red">Home</Link><ChevronRight className="w-4 h-4" /> Launchers
            </div>
            <div className="flex flex-col lg:flex-row gap-6 justify-between lg:items-end">
              <div>
                <p className="font-mono text-xs text-rail-red uppercase tracking-widest mb-2">Canonical launcher records</p>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Launch vehicle database</h1>
                <p className="mt-3 max-w-2xl text-gray-600">Compare only published data. Unpriced services and unconfirmed availability are shown explicitly rather than estimated as zero.</p>
              </div>
              <LaunchMarketReviewStamp launchers={launchers} />
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="border p-4"><p className="text-xs text-gray-500 uppercase">Operational</p><p className="text-2xl font-bold">{operationalCount}</p></div>
            <div className="border p-4"><p className="text-xs text-gray-500 uppercase">Lowest published $/kg</p><p className="text-lg font-bold">{cheapest ? formatLauncherPrice(cheapest) : "Pricing not publicly available"}</p></div>
            <div className="border p-4"><p className="text-xs text-gray-500 uppercase">Highest LEO payload</p><p className="text-lg font-bold">{highestLift?.payload_leo_kg ? `${highestLift.payload_leo_kg.toLocaleString()} kg` : "Not publicly available"}</p></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
            <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-gray-500" />{sizeClasses.map((option) => <button key={option} onClick={() => setSize(option)} className={`px-3 py-2 text-sm border ${size === option ? "bg-rail-red text-white border-rail-red" : "border-gray-300 text-gray-700"}`}>{option}</button>)}</div>
            <button onClick={() => setSort(sort === "default" ? "price" : sort === "price" ? "payload" : "default")} className="border px-3 py-2 text-sm flex items-center gap-2"><ArrowUpDown className="w-4 h-4" />Sort: {sort === "default" ? "Default" : sort === "price" ? "Price" : "Payload"}</button>
          </div>
          {loading && <p className="text-gray-600">Loading launch market data…</p>}
          {error && <p className="text-red-700">{error}</p>}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayed.map((launcher) => (
              <Link key={launcher.id} href={`/rockets/${launcher.slug}`} className="border border-gray-200 p-5 hover:border-rail-red transition-colors">
                <div className="flex justify-between gap-3"><div><h2 className="font-semibold text-lg text-gray-900">{launcher.vehicle_name}</h2><p className="text-sm text-gray-500">{launcher.provider}</p></div><Rocket className="w-5 h-5 text-rail-red shrink-0" /></div>
                <span className={`inline-block mt-4 border px-2 py-1 text-xs font-medium ${STATUS_STYLE[launcher.vehicle_status]}`}>{launcher.vehicle_status}</span>
                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t text-sm"><div><p className="text-gray-500">Rideshare $/kg</p><div className="mt-1"><DataLabel kind="Published figure" /></div><p className="font-semibold text-gray-900 mt-2">{formatLauncherPrice(launcher)}</p></div><div><p className="text-gray-500">Maximum published LEO payload</p><div className="mt-1"><DataLabel kind="Published figure" /></div><p className="font-semibold text-gray-900 mt-2">{launcher.payload_leo_kg ? `${launcher.payload_leo_kg.toLocaleString()} kg` : "Not publicly available"}</p></div></div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}