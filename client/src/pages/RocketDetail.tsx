import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, ExternalLink, Package, Rocket, Scale, Weight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DataLabel } from "@/components/DataLabel";
import { LaunchMarketReviewStamp } from "@/components/LaunchMarketReviewStamp";
import { formatAdvertisedMissionPrice, formatLauncherAvailability, formatLauncherPrice, formatVerifiedDate, theoreticalFullCapacityPricePerKg, useLaunchers } from "@/lib/launcherData";
import { useSEO } from "@/hooks/useSEO";

function payload(value: number | null) {
  return value ? `${value.toLocaleString()} kg` : "Not publicly available";
}

export default function RocketDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { launchers, loading, error } = useLaunchers();
  const launcher = launchers.find((record) => record.slug === slug);
  const theoreticalPricePerKg = launcher ? theoreticalFullCapacityPricePerKg(launcher) : null;

  useSEO({
    title: launcher ? `${launcher.vehicle_name}: Launch Vehicle Data | Orbit to Orbit Express` : "Launch Vehicle Data | Orbit to Orbit Express",
    description: launcher?.description ?? "Canonical launch vehicle specifications, published pricing, availability, and sources.",
    canonical: `/rockets/${slug ?? ""}`,
  });

  if (loading) return <div className="min-h-screen bg-white"><Navigation /><main className="pt-32 max-w-6xl mx-auto px-4">Loading launch market data…</main></div>;
  if (error || !launcher) return <div className="min-h-screen bg-white"><Navigation /><main className="pt-32 max-w-6xl mx-auto px-4"><Link href="/rockets" className="text-rail-red flex gap-2 items-center"><ArrowLeft className="w-4 h-4" />Back to launchers</Link><h1 className="text-2xl font-bold mt-8">Launcher not found</h1></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <section className="border-b bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link href="/rockets" className="text-sm text-gray-600 hover:text-rail-red flex items-center gap-2 mb-7"><ArrowLeft className="w-4 h-4" />All launchers</Link>
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
              <div><p className="font-mono text-xs text-rail-red uppercase tracking-widest mb-2">{launcher.provider}</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">{launcher.vehicle_name}</h1><p className="mt-3 text-gray-600 max-w-3xl">{launcher.description}</p><p className="mt-4 text-sm font-medium text-gray-700">Data verified {formatVerifiedDate(launcher.last_verified)}</p></div>
              <div className="border bg-white p-4 min-w-56"><p className="text-xs text-gray-500 uppercase">Vehicle status</p><p className="font-semibold text-gray-900 mt-1">{launcher.vehicle_status}</p><p className="text-xs text-gray-500 mt-3">Confidence: {launcher.confidence_level}</p></div>
            </div>
            <div className="mt-6"><LaunchMarketReviewStamp launchers={launchers} /></div>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Metric icon={<Weight />} label="LEO payload" value={payload(launcher.payload_leo_kg)} kind="Published figure" />
              <Metric icon={<Package />} label="SSO payload" value={payload(launcher.payload_sso_kg)} kind="Published figure" />
              <Metric icon={<Rocket />} label="GTO payload" value={payload(launcher.payload_gto_kg)} kind="Published figure" />
            </div>
            <article className="border p-6">
              <h2 className="text-lg font-semibold">Pricing and availability</h2>
              <div className="grid sm:grid-cols-2 gap-5 mt-5 text-sm">
                <PriceMetric label="Rideshare $/kg" value={formatLauncherPrice(launcher)} kind="Published figure" />
                <PriceMetric label="Advertised mission price" value={formatAdvertisedMissionPrice(launcher)} kind="Published figure" />
                <PriceMetric label="Theoretical $/kg at full capacity" value={theoreticalPricePerKg ? `${launcher.price_currency === "USD" ? "$" : `${launcher.price_currency} `}${theoreticalPricePerKg.toLocaleString()}/kg` : "Not available"} kind="Derived value" />
                <div><p className="text-gray-500">Availability</p><p className="font-semibold text-gray-900 mt-1 flex gap-2"><Calendar className="w-4 h-4 text-gray-500" />{formatLauncherAvailability(launcher)}</p></div>
                <div><p className="text-gray-500">Launch sites</p><p className="font-semibold text-gray-900 mt-1">{launcher.launch_sites.join("; ")}</p></div>
              </div>
              <p className="mt-5 text-sm text-gray-600 border-t pt-4">{launcher.reachable_inclination_notes}</p>
              <p className="mt-3 text-sm text-gray-600">{launcher.notes}</p>
            </article>
            <article className="border p-6">
              <h2 className="text-lg font-semibold">Sources</h2>
              <p className="text-sm text-gray-500 mt-2">{launcher.source_name} · source date: {launcher.source_date.join(", ")}</p>
              <p className="mt-2 text-sm font-medium text-gray-700">Data verified {formatVerifiedDate(launcher.last_verified)}</p>
              <ul className="mt-4 space-y-2">{launcher.source_url.map((url) => <li key={url}><a href={url} target="_blank" rel="noreferrer" className="text-rail-red hover:underline inline-flex gap-2 items-center"><ExternalLink className="w-4 h-4" />View source</a></li>)}</ul>
            </article>
          </div>
          <aside className="space-y-5">
            <div className="border p-5"><h2 className="font-semibold">Plan a mission</h2><p className="text-sm text-gray-600 mt-2">Calculator estimates only use launchers with a published per-kilogram price.</p><Link href="/" className="inline-flex mt-4 bg-rail-red text-white px-4 py-2 text-sm">Open calculator</Link></div>
            <div className="border p-5"><h2 className="font-semibold flex gap-2 items-center"><Scale className="w-4 h-4" />Compare launchers</h2><p className="text-sm text-gray-600 mt-2">Compare canonical payload, pricing, and status records side by side.</p><Link href="/compare" className="inline-block mt-4 text-rail-red text-sm">Open comparison →</Link></div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ icon, label, value, kind }: { icon: React.ReactNode; label: string; value: string; kind: "Published figure" }) {
  return <div className="border p-4"><div className="text-gray-500 flex gap-2 text-sm">{icon}{label}</div><div className="mt-2"><DataLabel kind={kind} /></div><p className="font-semibold text-gray-900 mt-2">{value}</p></div>;
}

function PriceMetric({ label, value, kind }: { label: string; value: string; kind: "Published figure" | "Derived value" }) {
  return <div><p className="text-gray-500">{label}</p><div className="mt-1"><DataLabel kind={kind} /></div><p className="font-semibold text-gray-900 mt-2">{value}</p></div>;
}