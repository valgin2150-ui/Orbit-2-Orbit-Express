import { useEffect } from "react";
import { Cpu, Thermometer, Mountain } from "lucide-react";

export default function LunarCompute() {
  useEffect(() => {
    document.title = "Lunar Compute Infrastructure | LEDC | Orbit2Orbit Express";

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!el) {
        el = document.createElement(selector.startsWith("link") ? "link" : "meta") as HTMLMetaElement;
        document.head.appendChild(el);
      }
      (el as Element).setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", "LEDC is Orbit2Orbit Express's program to design and patent the first purpose-built AI data center architecture for the lunar surface. Built for the cislunar window opening now.");
    setMeta('meta[name="keywords"]', "content", "lunar data center, cislunar compute infrastructure, lunar AI infrastructure, space data center architecture, lunar surface computing, LEDC, Orbit2Orbit Express");

    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setOg("og:title", "Lunar Compute Infrastructure | LEDC | Orbit2Orbit Express");
    setOg("og:description", "The first purpose-built AI data center architecture for the lunar surface. Orbit2Orbit Express is positioning for the cislunar compute window opening now.");
    setOg("og:url", "https://www.orbit2orbitexpress.com/lunar-compute");
    setOg("og:type", "website");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link") as HTMLLinkElement; canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", "https://www.orbit2orbitexpress.com/lunar-compute");

    return () => {
      document.title = "Orbit2Orbit Express — Space Cargo Logistics Platform";
    };
  }, []);

  return (
    <div className="bg-[#303234] min-h-screen text-white font-sans">

      {/* Hero */}
      <section
        className="relative flex flex-col justify-center items-center text-center px-6 py-32 md:py-48 overflow-hidden"
        style={{ minHeight: "80vh" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 40%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(0,0,0,0.08) 0%, transparent 60%), linear-gradient(to bottom, #303234 0%, #3a3a3a 50%, #303234 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-t-full border border-gray-800/40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(200,200,210,0.04) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.25em] uppercase text-gray-500 mb-6">
            Orbit2Orbit Express · LEDC Program
          </p>
          <h1 className="text-3xl md:text-5xl font-light text-white leading-tight mb-6">
            Lunar Compute Infrastructure —
            <br />
            <span className="text-gray-400">Built for the Moon</span>
            <br />
            from the Ground Up.
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            LEDC is Orbit2Orbit Express's long-horizon program to design, patent, and position
            the first purpose-built space data center architecture for the lunar surface.
          </p>
        </div>
      </section>

      <div className="border-t border-gray-800/60" />

      {/* Section 2 — The Problem Worth Solving */}
      <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-10">The Problem Worth Solving</h2>
        <div className="space-y-7 text-gray-300 text-base md:text-lg leading-relaxed">
          <p>
            Earth's AI compute demand is outpacing its power grid. The ceiling is visible. Data
            centers already consume more electricity than many mid-sized nations, and the models
            they serve are growing faster than the infrastructure built to support them.
          </p>
          <p>
            Orbital data centers are being funded as the answer. They have unresolved physics
            problems — radiation exposure, thermal cycling, station-keeping, assembly complexity.
            The engineering burden is real and largely unacknowledged in the investment narratives
            surrounding them.
          </p>
          <p>
            The Moon solves most of them. Nobody has funded a lunar data center yet. That gap is
            where LEDC lives.
          </p>
        </div>
      </section>

      <div className="border-t border-gray-800/60" />

      {/* Section 3 — Why the Moon */}
      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-12">Why the Moon</h2>
        <p className="text-gray-500 text-sm max-w-2xl mb-10 leading-relaxed">
          Lunar surface computing addresses the hard physics problems that orbital platforms cannot.
          Each architectural advantage below is a direct consequence of location.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {[
            {
              icon: <Cpu size={22} strokeWidth={1.5} className="text-gray-400" />,
              title: "Shielded Compute",
              body: "Buried 3–5m below the lunar surface. Near-zero radiation exposure without rad-hardened chips.",
            },
            {
              icon: <Thermometer size={22} strokeWidth={1.5} className="text-gray-400" />,
              title: "Thermal Advantage",
              body: "GPU waste heat captured, cascaded, and productively reused. Excess radiated to vacuum. No active cooling required.",
            },
            {
              icon: <Mountain size={22} strokeWidth={1.5} className="text-gray-400" />,
              title: "Built on the Moon",
              body: "Lunar ISRU materials. Tunnel-based expansion. No orbital assembly. No station-keeping.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="border border-gray-800/70 p-7 flex flex-col gap-4">
              <div className="w-9 h-9 flex items-center justify-center border border-gray-700/60">
                {icon}
              </div>
              <h3 className="text-sm font-medium tracking-wide text-white">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-800/60" />

      {/* Section 4 — Where We Are */}
      <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-10">Where We Are</h2>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          We are not announcing a data center. We are announcing a position. Over the past two
          years, Orbit2Orbit Express has developed a full cislunar compute infrastructure
          architecture, filed provisional patents covering 22 claims across thermal management,
          power generation, construction, siting, and AI operations, and established relationships
          with government and industry stakeholders working on the cislunar layer of the space
          economy. We are building the prospectus, not the press release.
        </p>
      </section>

      <div className="border-t border-gray-800/60" />

      {/* Section 5 — The Horizon */}
      <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-10">The Horizon</h2>
        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
          Artemis changes the timeline. When humans return to the lunar surface, the lunar AI
          infrastructure question becomes urgent. The organizations positioned inside that window
          today will define the compute layer of the space economy for the next fifty years. LEDC
          intends to be one of them.
        </p>
      </section>

      <div className="border-t border-gray-800/60" />

      {/* Section 6 — Contact */}
      <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-10">Contact</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Follow the space economy investment thesis behind LEDC at{" "}
          <a
            href="https://orbitaleconomics.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Orbital Economics on Substack
          </a>
          .
        </p>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          If you're working on the same horizon, we'd like to know you.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>
            <span className="text-gray-600 mr-2">Email</span>
            <a
              href="mailto:vlad@orbit2orbitexpress.com"
              className="text-gray-300 hover:text-white transition-colors"
            >
              vlad@orbit2orbitexpress.com
            </a>
          </p>
          <p>
            <span className="text-gray-600 mr-2">Website</span>
            <a
              href="https://www.orbit2orbitexpress.com"
              className="text-gray-300 hover:text-white transition-colors"
            >
              www.orbit2orbitexpress.com
            </a>
          </p>
          <p>
            <span className="text-gray-600 mr-2">Newsletter</span>
            <a
              href="https://orbitaleconomics.substack.com"
              className="text-gray-300 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Orbital Economics — Space Economy Investment Newsletter
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-800/60 py-10 text-center space-y-3">
        <p className="text-xs text-gray-700 tracking-widest uppercase">
          Orbit2Orbit Express · LEDC · Long Horizon Program
        </p>
        <div className="flex justify-center gap-6 text-xs text-gray-700">
          <a
            href="https://www.orbit2orbitexpress.com"
            className="hover:text-gray-500 transition-colors"
          >
            Orbit2Orbit Express
          </a>
          <a
            href="https://orbitaleconomics.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-500 transition-colors"
          >
            Orbital Economics — Space Economy Investment Newsletter
          </a>
        </div>
      </div>
    </div>
  );
}
