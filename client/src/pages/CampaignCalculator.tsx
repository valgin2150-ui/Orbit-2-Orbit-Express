import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Plus, X, RotateCcw, Info, Send, CheckCircle } from "lucide-react";
import type { LauncherRecord } from "@/lib/launcherData";
import { DataLabel, MethodologyNotice } from "@/components/DataLabel";

type RocketData = LauncherRecord;

interface Line {
  id: number;
  label: string;
  rocket: string;
  launches: number;
  satsEach: number;
  expendable: boolean;
}

const DEFAULT_SAT_MASS = 6100;

const ASTS_PRESET: Omit<Line, "id">[] = [
  { label: "Falcon 9 — batch already in flow", rocket: "Falcon 9 Block 5", launches: 1, satsEach: 4, expendable: false },
  { label: "Falcon 9 backbone", rocket: "Falcon 9 Block 5", launches: 5, satsEach: 3, expendable: false },
  { label: "Falcon Heavy — New Glenn analog", rocket: "Falcon Heavy", launches: 1, satsEach: 8, expendable: true },
  { label: "Vulcan VC6 — diversification", rocket: "Vulcan Centaur", launches: 1, satsEach: 4, expendable: false },
  { label: "Falcon 9 — additional", rocket: "Falcon 9 Block 5", launches: 1, satsEach: 4, expendable: false },
];

let _id = 1;
const withIds = (rows: Omit<Line, "id">[]): Line[] => rows.map((r) => ({ ...r, id: _id++ }));

export default function CampaignCalculator() {
  useSEO({
    title: "Launch Campaign Calculator — Multi-Launch Cost Estimator",
    description:
      "Build a multi-launch campaign across providers and total the published list prices. Estimate the real launch-services cost of deploying or re-manifesting a satellite constellation.",
    canonical: "/campaign",
  });

  const [rockets, setRockets] = useState<RocketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>(() => withIds(ASTS_PRESET));
  const [overheadPct, setOverheadPct] = useState(22);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadWindow, setLeadWindow] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail.trim()) return;
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      const res = await fetch("/api/campaign-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          launchWindow: leadWindow,
          campaignSummary: `${totals.launches} launches · ${totals.sats} sats · $${totals.allIn}M all-in`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setLeadSubmitted(true);
    } catch {
      setLeadError("Something went wrong — email vlad@orbit2orbitexpress.com directly.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  useEffect(() => {
    fetch("/data/rockets.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load rocket data");
        return r.json();
      })
      .then((data: RocketData[]) => {
        setRockets(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const pricedRockets = useMemo(
    () => rockets.filter((r) => typeof r.published_launch_price === "number"),
    [rockets]
  );

  const rocketByName = useMemo(() => {
    const m: Record<string, RocketData> = {};
    rockets.forEach((r) => (m[r.vehicle_name] = r));
    return m;
  }, [rockets]);

  function priceFor(line: Line): number {
    const r = rocketByName[line.rocket];
    if (!r || r.published_launch_price == null) return 0;
    return r.published_launch_price / 1_000_000;
  }

  const totals = useMemo(() => {
    let launches = 0;
    let sats = 0;
    let cost = 0;
    lines.forEach((l) => {
      launches += l.launches;
      sats += l.launches * l.satsEach;
      cost += l.launches * priceFor(l);
    });
    return { launches, sats, cost, allIn: Math.round(cost * (1 + overheadPct / 100)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, overheadPct, rocketByName]);

  const update = (id: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: number) => setLines((prev) => prev.filter((l) => l.id !== id));
  const add = () =>
    setLines((prev) => [
      ...prev,
      { id: _id++, label: "New launch line", rocket: pricedRockets[0]?.vehicle_name ?? "Falcon 9 Block 5", launches: 1, satsEach: 3, expendable: false },
    ]);
  const reset = () => setLines(withIds(ASTS_PRESET));

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 pt-28 md:pt-32">
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#e3000f]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Plan "B" Calculator</span>
        </nav>

        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e3000f] font-bold">
          From the Manifest Desk
        </p>
        <h1 className="text-3xl font-bold mt-1 mb-2">Plan "B" — Launch Campaign Calculator</h1>
        <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">
          Build a multi-launch campaign across providers and total the published list prices.
          Pre-loaded with a re-manifest scenario after the New Glenn grounding. Every price is a
          public list estimate, not a contracted rate — change any number to model your own.
        </p>

        {loading && <p className="mt-8 text-gray-400 font-mono text-sm">Loading rocket data…</p>}
        {error && <p className="mt-8 text-red-600 text-sm">Could not load rocket data: {error}</p>}

        {!loading && !error && (
          <>
            <div className="border border-gray-200 rounded-lg mt-6 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Campaign Manifest</h2>
                <button
                  onClick={reset}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#e3000f]"
                  data-testid="campaign-reset"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to ASTS scenario
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500 border-b border-gray-200">
                      <th className="px-3 py-2">Launch line</th>
                      <th className="px-3 py-2">Vehicle</th>
                      <th className="px-3 py-2 text-right">Launches</th>
                      <th className="px-3 py-2 text-right">Sats/ea</th>
                      <th className="px-3 py-2 text-right">$M/launch</th>
                      <th className="px-3 py-2 text-right">Subtotal</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => {
                      const price = priceFor(l);
                      return (
                        <tr key={l.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input
                              value={l.label}
                              onChange={(e) => update(l.id, { label: e.target.value })}
                              className="w-full bg-transparent text-sm focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={l.rocket}
                              onChange={(e) => update(l.id, { rocket: e.target.value })}
                              className="font-mono text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                            >
                              {pricedRockets.map((r) => (
                                <option key={r.id} value={r.vehicle_name}>{r.vehicle_name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={l.launches}
                              onChange={(e) => update(l.id, { launches: Math.max(0, +e.target.value) })}
                              className="w-14 text-right font-mono text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-900"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              value={l.satsEach}
                              onChange={(e) => update(l.id, { satsEach: Math.max(0, +e.target.value) })}
                              className="w-14 text-right font-mono text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 text-gray-900"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{price ? `$${price}` : "—"}</td>
                          <td className="px-3 py-2 text-right font-mono">${l.launches * price}M</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => remove(l.id)}
                              className="text-gray-400 hover:text-[#e3000f] p-1"
                              aria-label="Remove line"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={add}
                className="flex items-center gap-1 m-3 px-3 py-2 text-sm font-semibold text-[#e3000f] border border-dashed border-[#e3000f] rounded hover:bg-red-50"
                data-testid="campaign-add-line"
              >
                <Plus className="w-4 h-4" /> Add launch line
              </button>

              <div className="grid grid-cols-3 gap-px bg-gray-200 border-t border-gray-200">
                <div className="bg-white px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Total launches</div>
                  <div className="font-mono text-2xl font-bold mt-0.5">{totals.launches}</div>
                </div>
                <div className="bg-white px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Satellites</div>
                  <div className="font-mono text-2xl font-bold mt-0.5">{totals.sats}</div>
                </div>
                <div className="bg-white px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">Direct launch services</div>
                  <div className="mt-1"><DataLabel kind="Published figure" /></div>
                  <div className="font-mono text-2xl font-bold mt-0.5 text-[#e3000f]">${totals.cost}M</div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t-2 border-gray-900">
                <div className="text-sm">
                  <span className="font-semibold">All-in program cost</span>
                  <span className="ml-2 align-middle"><DataLabel kind="O2O model" /></span>
                  <label className="ml-2 text-xs text-gray-500">
                    +{" "}
                    <input
                      type="number"
                      min={0}
                      value={overheadPct}
                      onChange={(e) => setOverheadPct(Math.max(0, +e.target.value))}
                      className="w-14 text-right font-mono border border-gray-200 rounded px-1 py-0.5 bg-gray-50 text-gray-900"
                    />
                    % integration · dispenser · insurance
                  </label>
                </div>
                <span className="font-mono text-xl font-bold">≈ ${totals.allIn}M</span>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4 text-xs text-gray-500 leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Falcon 9 lines are typically <strong>volume / dispenser-limited, not mass-limited</strong>:
                at ~{DEFAULT_SAT_MASS.toLocaleString()} kg per satellite (BlueBird Block 2 class), the
                binding constraint is fairing volume and the dispenser, not the rocket's lift capacity.
                Per-launch prices are <strong>published list estimates, not contracted rates</strong> — large
                operators negotiate below list on volume.
              </p>
            </div>
            <MethodologyNotice className="mt-4 text-xs" />

            <div className="mt-6 text-xs text-gray-500 border-l-2 border-gray-200 pl-3 leading-relaxed">
              <strong>Sources:</strong>{" "}
              {pricedRockets
                .filter((r) => r.source_name)
                .map((r) => `${r.vehicle_name} — ${r.source_name}`)
                .join(" · ")}
            </div>

            {/* Lead capture panel */}
            <div className="mt-8 border border-[#e3000f]/20 bg-[#e3000f]/5">
              <div className="px-5 py-4 border-b border-[#e3000f]/15">
                <p className="text-xs font-mono uppercase tracking-widest text-[#e3000f] font-bold mb-1">Ready to Execute?</p>
                <h3 className="text-base font-semibold text-gray-900">Match your parameters directly with verified flight managers.</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your campaign is estimated at <strong className="text-gray-800 font-mono">${totals.allIn}M all-in</strong> across <strong className="text-gray-800">{totals.launches} launches</strong>.
                  Submit your window and we'll identify available manifest slots within 24h.
                </p>
              </div>

              {leadSubmitted ? (
                <div className="px-5 py-6 flex items-center gap-3 text-green-700">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Request received.</p>
                    <p className="text-xs text-gray-500">Vlad will follow up at {leadEmail} within 24 hours.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="px-5 py-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e3000f] transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Target Launch Window</label>
                    <input
                      type="text"
                      value={leadWindow}
                      onChange={(e) => setLeadWindow(e.target.value)}
                      placeholder="e.g. Q1 2027, H2 2026"
                      className="w-full border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#e3000f] transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      className="flex items-center gap-2 px-5 py-2 bg-[#e3000f] text-white text-sm font-medium hover:bg-[#c0000d] transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" />
                      {leadSubmitting ? "Sending…" : "Connect Me"}
                    </button>
                  </div>
                </form>
              )}
              {leadError && <p className="px-5 pb-4 text-xs text-red-600">{leadError}</p>}
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Need a manifest stress-tested or a provider-diversification plan built?{" "}
              <a href="mailto:vlad@orbit2orbitexpress.com" className="text-[#e3000f] font-semibold">
                vlad@orbit2orbitexpress.com
              </a>
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
