import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeftRight, Scale } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DataLabel } from "@/components/DataLabel";
import { LaunchMarketReviewStamp } from "@/components/LaunchMarketReviewStamp";
import { formatAdvertisedMissionPrice, formatLauncherAvailability, formatLauncherPrice, formatVerifiedDate, theoreticalFullCapacityPricePerKg, useLaunchers, type LauncherRecord } from "@/lib/launcherData";
import { useSEO } from "@/hooks/useSEO";

function launcherSlugPair(a: LauncherRecord, b: LauncherRecord) {
  return `${a.slug}-vs-${b.slug}`;
}

function mass(value: number | null) {
  return value ? `${value.toLocaleString()} kg` : "Not publicly available";
}

function Comparison({ a, b, all }: { a: LauncherRecord; b: LauncherRecord; all: LauncherRecord[] }) {
  const rows = [
    ["Provider", a.provider, b.provider],
    ["Status", a.vehicle_status, b.vehicle_status],
    ["Maximum published LEO payload", mass(a.payload_leo_kg), mass(b.payload_leo_kg), "Published figure"],
    ["Maximum published SSO payload", mass(a.payload_sso_kg), mass(b.payload_sso_kg), "Published figure"],
    ["Maximum published GTO payload", mass(a.payload_gto_kg), mass(b.payload_gto_kg), "Published figure"],
    ["Advertised mission price", formatAdvertisedMissionPrice(a), formatAdvertisedMissionPrice(b), "Published figure"],
    ["Theoretical $/kg at full capacity", theoreticalFullCapacityPricePerKg(a) ? `$${theoreticalFullCapacityPricePerKg(a)!.toLocaleString()}/kg` : "Not available", theoreticalFullCapacityPricePerKg(b) ? `$${theoreticalFullCapacityPricePerKg(b)!.toLocaleString()}/kg` : "Not available", "Derived value"],
    ["Rideshare $/kg", formatLauncherPrice(a), formatLauncherPrice(b), "Published figure"],
    ["Availability", formatLauncherAvailability(a), formatLauncherAvailability(b)],
    ["Launch sites", a.launch_sites.join("; "), b.launch_sites.join("; ")],
    ["Confidence", a.confidence_level, b.confidence_level],
  ];
  return <main className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <Link href="/compare" className="text-sm text-gray-600">← Choose another pair</Link>
    <div className="mt-7 flex flex-col md:flex-row gap-5 items-center justify-between">
      <div><p className="font-mono text-xs text-rail-red uppercase tracking-widest">Canonical comparison</p><h1 className="text-3xl font-bold text-gray-900 mt-2">{a.vehicle_name} <span className="text-gray-400">vs</span> {b.vehicle_name}</h1></div>
      <LaunchMarketReviewStamp launchers={all} />
    </div>
    <div className="grid md:grid-cols-2 gap-5 mt-8">
      {[a, b].map((launcher) => <article key={launcher.id} className="border p-5"><p className="text-sm text-gray-500">{launcher.provider}</p><h2 className="text-xl font-semibold mt-1">{launcher.vehicle_name}</h2><div className="mt-4"><DataLabel kind="Published figure" /></div><p className="mt-2 text-sm text-gray-500">Rideshare $/kg</p><p className="font-bold text-xl">{formatLauncherPrice(launcher)}</p><p className="mt-3 text-xs font-medium text-gray-600">Data verified {formatVerifiedDate(launcher.last_verified)}</p><p className="mt-4 text-sm text-gray-600">{launcher.notes}</p><Link href={`/rockets/${launcher.slug}`} className="mt-4 inline-block text-sm text-rail-red hover:underline">View sources and methodology →</Link></article>)}
    </div>
    <div className="border mt-6 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-4">Specification</th><th className="text-left p-4">{a.vehicle_name}</th><th className="text-left p-4">{b.vehicle_name}</th></tr></thead><tbody>{rows.map(([label, av, bv, kind]) => <tr key={label} className="border-t"><td className="p-4 font-medium text-gray-700"><div>{label}</div>{kind && <div className="mt-2"><DataLabel kind={kind as "Published figure" | "Derived value"} /></div>}</td><td className="p-4">{av}</td><td className="p-4">{bv}</td></tr>)}</tbody></table></div>
  </main>;
}

function ComparisonPicker({ launchers }: { launchers: LauncherRecord[] }) {
  const [, setLocation] = useLocation();
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const a = launchers.find((launcher) => launcher.id === aId);
  const b = launchers.find((launcher) => launcher.id === bId);
  return <main className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <p className="font-mono text-xs text-rail-red uppercase tracking-widest">Canonical launch data</p><h1 className="text-3xl font-bold text-gray-900 mt-2">Compare launchers</h1><p className="text-gray-600 mt-3 max-w-2xl">Pricing, payload, status, availability, and sources are read from the same launcher records used across the site.</p>
    <div className="grid md:grid-cols-2 gap-5 border p-6 mt-8">
      <Picker label="Vehicle A" value={aId} onChange={setAId} launchers={launchers} exclude={bId} />
      <Picker label="Vehicle B" value={bId} onChange={setBId} launchers={launchers} exclude={aId} />
    </div>
    <button disabled={!a || !b} onClick={() => a && b && setLocation(`/compare/${launcherSlugPair(a, b)}`)} className="mt-5 bg-rail-red text-white px-5 py-3 disabled:opacity-40 flex items-center gap-2"><Scale className="w-4 h-4" />Compare selected launchers</button>
    <div className="mt-8"><LaunchMarketReviewStamp launchers={launchers} /></div>
  </main>;
}

function Picker({ label, value, onChange, launchers, exclude }: { label: string; value: string; onChange: (value: string) => void; launchers: LauncherRecord[]; exclude: string }) {
  return <label className="text-sm font-medium text-gray-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border p-3 bg-white"><option value="">Select a launcher</option>{launchers.filter((launcher) => launcher.id !== exclude).map((launcher) => <option key={launcher.id} value={launcher.id}>{launcher.vehicle_name} — {launcher.provider}</option>)}</select></label>;
}

export default function RocketComparison() {
  const { slug } = useParams<{ slug?: string }>();
  const { launchers, loading, error } = useLaunchers();
  useSEO({ title: "Launcher Comparison | Orbit to Orbit Express", description: "Compare canonical launcher payload, public pricing, status, and availability.", canonical: slug ? `/compare/${slug}` : "/compare" });
  const pair = useMemo(() => {
    if (!slug) return null;
    const [left, right] = slug.split("-vs-");
    return [launchers.find((launcher) => launcher.slug === left), launchers.find((launcher) => launcher.slug === right)] as const;
  }, [launchers, slug]);
  if (loading) return <div className="min-h-screen bg-white"><Navigation /><main className="pt-32 max-w-5xl mx-auto px-4">Loading launch market data…</main></div>;
  return <div className="min-h-screen bg-white"><Navigation />{error ? <main className="pt-32 max-w-5xl mx-auto px-4 text-red-700">{error}</main> : pair?.[0] && pair?.[1] ? <Comparison a={pair[0]} b={pair[1]} all={launchers} /> : <ComparisonPicker launchers={launchers} />}<Footer /></div>;
}