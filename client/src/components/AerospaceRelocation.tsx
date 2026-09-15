import { MapPin, Building2, Rocket, ExternalLink, Plane } from "lucide-react";

const hubs = [
  {
    name: "Kent Hub",
    label: "Space Valley",
    companies: ["Blue Origin (HQ)", "Stoke Space", "Boeing"],
    color: "from-blue-500/20 to-blue-600/10",
    accent: "bg-blue-500",
  },
  {
    name: "Redmond / Kirkland Hub",
    label: "Satellite Central",
    companies: ["SpaceX (Starlink)", "Amazon (Project Kuiper)", "Aerojet Rocketdyne (Propulsion)"],
    color: "from-indigo-500/20 to-indigo-600/10",
    accent: "bg-indigo-500",
  },
  {
    name: "Everett / Renton Hub",
    label: "Assembly Corridor",
    companies: ["Boeing (Commercial/Defense)", "MagniX"],
    color: "from-emerald-500/20 to-emerald-600/10",
    accent: "bg-emerald-500",
  },
];

interface AerospaceRelocationProps {
  variant?: "sidebar" | "featured";
}

export function AerospaceRelocation({ variant = "sidebar" }: AerospaceRelocationProps) {
  if (variant === "sidebar") {
    return (
      <div className="relative overflow-hidden border border-white/20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-white/40 to-blue-50/60 dark:from-gray-800/80 dark:via-gray-900/40 dark:to-blue-900/20 pointer-events-none" />
        <div className="relative p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-rail-red flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Relocation Intelligence</h3>
          </div>

          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 mb-3">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Engineering Your PNW Relocation</span> — Washington hosts the largest aerospace supply chain in the U.S. Whether joining Blue Origin in Kent, SpaceX in Redmond, or Boeing in Everett, access MLS intelligence for a strategic move.
          </p>

          <div className="space-y-2 mb-4">
            {hubs.map((hub) => (
              <div key={hub.name} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 mt-1.5 rounded-full ${hub.accent} flex-shrink-0`} />
                <div>
                  <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{hub.name}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400"> — {hub.companies.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://www.alginrealestate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full min-h-[48px] bg-rail-red hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Access Housing Intelligence
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
      <div className="relative overflow-hidden border border-white/30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/50 to-blue-50/70 dark:from-gray-800/90 dark:via-gray-900/50 dark:to-blue-900/30 pointer-events-none" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rail-red flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Engineering Your PNW Relocation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">Aerospace Relocation Intelligence</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-6 max-w-3xl">
            Washington is home to the largest aerospace supply chain in the U.S. Whether you are joining Blue Origin in 'Space Valley' (Kent), SpaceX or Amazon Kuiper in 'Satellite Central' (Redmond/Kirkland), or the Boeing assembly hubs in Everett and Renton, we provide the MLS intelligence required for a strategic move.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {hubs.map((hub) => (
              <div key={hub.name} className={`relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-gradient-to-br ${hub.color} p-4`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${hub.accent}`} />
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{hub.name}</h4>
                </div>
                <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{hub.label}</p>
                <ul className="space-y-1">
                  {hub.companies.map((company) => (
                    <li key={company} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                      <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      {company}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <a
            href="https://www.alginrealestate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 bg-rail-red hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            <Rocket className="w-4 h-4" />
            Access Housing Intelligence
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
