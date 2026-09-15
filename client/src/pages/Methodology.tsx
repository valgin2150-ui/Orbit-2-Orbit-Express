import { Link } from "wouter";
import { ArrowRight, BookOpen, ExternalLink, MapPin, Rocket, Scale } from "lucide-react";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { DataLabel, METHODOLOGY_DISCLAIMER } from "@/components/DataLabel";
import { useSEO } from "@/hooks/useSEO";

const LABELS = [
  {
    kind: "Published figure" as const,
    title: "Published figure",
    description: "A value reported by a launch provider or another primary source, such as a list price or maximum payload.",
  },
  {
    kind: "Derived value" as const,
    title: "Derived value",
    description: "A calculation made from published values, such as theoretical dollars per kilogram at full payload.",
  },
  {
    kind: "O2O model" as const,
    title: "O2O model",
    description: "A planning output calculated by O2O from your inputs, including mission cost, compatibility, and timing suggestions.",
  },
  {
    kind: "Estimate" as const,
    title: "Estimate",
    description: "A planning range or assumption used when a provider does not publish a mission-specific commercial quote.",
  },
];

export default function Methodology() {
  useSEO({
    title: "Sources & Methodology | Orbit to Orbit Express",
    description: "How Orbit to Orbit Express sources launcher data and calculates mission-planning estimates.",
    canonical: "/methodology",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="border-b bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-rail-red">Transparency by design</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-900 md:text-5xl">Sources &amp; Methodology</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
              O2O Express combines published launch-vehicle information with transparent planning models. This page explains what each number means, where it comes from, and why it is not a quote for a specific mission.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex items-center gap-2 bg-rail-red px-5 py-3 text-sm font-medium text-white hover:bg-red-700">
                Open the orbital planner <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/rockets" className="inline-flex items-center gap-2 border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:border-gray-500">
                Browse launcher sources
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {LABELS.map((label) => (
              <article key={label.title} className="border p-5">
                <DataLabel kind={label.kind} />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">{label.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{label.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div className="space-y-10">
            <article className="border-t-4 border-rail-red pt-5">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-rail-red" />
                <h2 className="text-2xl font-semibold text-gray-900">How O2O calculates launch cost</h2>
              </div>
              <p className="mt-4 leading-7 text-gray-600">
                For a compatible launcher with a published rideshare rate, the planner starts with the published rideshare $/kg figure and multiplies it by your payload mass. It then applies the platform&apos;s planning allowance for launch management and fixed mission work, subject to the minimum service floor shown in the calculator.
              </p>
              <div className="mt-5 border bg-gray-50 p-5 font-mono text-sm text-gray-800">
                <p>Base transport estimate = published rideshare $/kg × payload mass</p>
                <p className="mt-2">Planning estimate = base transport estimate × O2O allowance</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                If no compatible launcher has a public per-kilogram price, the result is an <strong>Estimate</strong> rather than a provider price. Cislunar destinations also use a higher planning allowance because they require additional transfer, integration, and mission complexity.
              </p>
            </article>

            <article className="border-t border-gray-200 pt-5">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-rail-red" />
                <h2 className="text-2xl font-semibold text-gray-900">What the launcher numbers mean</h2>
              </div>
              <div className="mt-5 overflow-x-auto border">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-4 font-semibold">Displayed value</th>
                      <th className="p-4 font-semibold">Meaning</th>
                      <th className="p-4 font-semibold">Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr><td className="p-4 font-medium">Advertised mission price</td><td className="p-4 text-gray-600">A provider&apos;s published launch price for a mission or vehicle-level service. It is not automatically the price for your payload.</td><td className="p-4"><DataLabel kind="Published figure" /></td></tr>
                    <tr><td className="p-4 font-medium">Maximum published payload</td><td className="p-4 text-gray-600">The published capacity for the named orbit or destination. Actual performance depends on trajectory, hardware, and mission configuration.</td><td className="p-4"><DataLabel kind="Published figure" /></td></tr>
                    <tr><td className="p-4 font-medium">Theoretical $/kg at full capacity</td><td className="p-4 text-gray-600">Advertised mission price divided by maximum published payload. This is a comparison metric, not a customer quote.</td><td className="p-4"><DataLabel kind="Derived value" /></td></tr>
                    <tr><td className="p-4 font-medium">Rideshare $/kg</td><td className="p-4 text-gray-600">A published or publicly listed price for a rideshare opportunity when one is available. It is separate from a dedicated launch price.</td><td className="p-4"><DataLabel kind="Published figure" /></td></tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article className="border-t border-gray-200 pt-5">
              <h2 className="text-2xl font-semibold text-gray-900">Delta-v and destination assumptions</h2>
              <p className="mt-4 leading-7 text-gray-600">
                Delta-v (Δv) is the change in velocity required by the modeled transfer, expressed in the planner as m/s. It represents an orbital-mechanics planning requirement for the selected destination—not the rocket&apos;s advertised payload capacity and not a promise of delivered performance. Real mission delta-v depends on launch latitude, parking orbit, transfer window, vehicle guidance, injection accuracy, and the spacecraft&apos;s own propulsion.
              </p>
              <p className="mt-4 leading-7 text-gray-600">
                Destination values are representative planning values for common orbit and transfer classes. They help screen compatible options; a mission provider or trajectory team must confirm the final trajectory and performance.
              </p>
            </article>

            <article className="border-t border-gray-200 pt-5">
              <h2 className="text-2xl font-semibold text-gray-900">Rideshare vs. dedicated launch</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="border bg-gray-50 p-5">
                  <h3 className="font-semibold text-gray-900">Rideshare</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Your payload shares a launch with other customers. The published $/kg figure can be useful for early planning, but manifests, adapters, orbit, schedule, and integration rules determine the actual offer.</p>
                </div>
                <div className="border bg-gray-50 p-5">
                  <h3 className="font-semibold text-gray-900">Dedicated launch</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">One customer contracts the launch service or a substantial part of the vehicle. The advertised mission price is a vehicle-level reference and does not include every mission, regulatory, integration, insurance, or schedule cost.</p>
                </div>
              </div>
            </article>

            <article className="border-t border-gray-200 pt-5">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-rail-red" />
                <h2 className="text-2xl font-semibold text-gray-900">Launch-site and inclination constraints</h2>
              </div>
              <p className="mt-4 leading-7 text-gray-600">
                A launcher is not interchangeable across every launch site or orbit. Site latitude, azimuth corridors, range safety, overflight restrictions, recovery plans, and the target inclination can change the usable performance and whether a mission can be accepted. Polar and sun-synchronous missions may favor a different site than an equatorial or geostationary transfer mission.
              </p>
              <p className="mt-4 leading-7 text-gray-600">
                The launcher pages show known sites and provider notes so these constraints are visible. A listed vehicle is not a confirmation that a particular site, inclination, launch window, license, or rideshare slot is available.
              </p>
            </article>
          </div>

          <aside className="space-y-6">
            <div className="border bg-gray-50 p-6">
              <BookOpen className="h-6 w-6 text-rail-red" />
              <h2 className="mt-3 text-xl font-semibold text-gray-900">Why quotations differ</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
                <li>Payload mass, volume, separation hardware, and hazardous-material requirements</li>
                <li>Target orbit, inclination, launch site, trajectory, and performance margin</li>
                <li>Integration, testing, paperwork, export controls, licensing, insurance, and range fees</li>
                <li>Manifest timing, schedule priority, currency, and provider contract terms</li>
              </ul>
            </div>
            <div className="border p-6">
              <h2 className="text-xl font-semibold text-gray-900">Primary source categories</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">Launcher detail pages link the source records used for their data and show a visible verification date.</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><SourceLink href="https://www.spacex.com/vehicles/falcon-9/" label="Launch provider vehicle and service pages" /></li>
                <li><SourceLink href="https://www.nasa.gov/reference/systems-engineering-handbook/" label="NASA technical and systems-engineering references" /></li>
                <li><SourceLink href="https://www.esa.int/Enabling_Support/Space_Transportation" label="ESA space transportation references" /></li>
                <li><SourceLink href="https://www.faa.gov/space" label="FAA commercial space transportation and licensing" /></li>
              </ul>
            </div>
            <div className="border-2 border-rail-red/30 bg-red-50 p-6">
              <h2 className="font-semibold text-gray-900">Use the numbers responsibly</h2>
              <p className="mt-3 text-sm leading-6 text-gray-700">{METHODOLOGY_DISCLAIMER}</p>
              <Link href="/rockets" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rail-red hover:underline">See verified launcher records <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-rail-red hover:underline"><ExternalLink className="h-4 w-4" />{label}</a>;
}