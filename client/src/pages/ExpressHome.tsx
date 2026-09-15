import { ArrowUpRight, Check, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useMissionIntake } from "@/contexts/MissionIntakeContext";
import { useSEO } from "@/hooks/useSEO";
import { useState } from "react";

const audiences = [
  ["University Research Labs", "Scientific payloads and microgravity experiments ready for flight data without a dedicated multi-year program team."],
  ["Biotech & Life Sciences", "Commercial teams testing crystallization, protein structures, and manufacturing processes in low-Earth orbit."],
  ["Technology Startups", "In-orbit hardware and edge-computing demonstrations that require provider coordination and risk management."],
  ["Satellite Owners", "Assets affected by orbital decay, propulsion depletion, or insertion into the wrong orbit."],
  ["Defense Subcontractors", "Flight-ready payloads that need an independent route to launch and integration."],
];

const steps = [
  ["01", "Mission Clarity Call", "A 30-minute introductory conversation to understand your objective, constraints, and the questions that need answering. If further work is useful, we agree the scope of a separate Mission Clarity Session."],
  ["02", "Architecture and Access", "If the mission is viable, we translate your objective into requirements — orbit, timeline, mass, power, integration, regulatory — and identify the real providers who can execute at your scale."],
  ["03", "Provider Coordination", "We manage the interfaces between launch, spacecraft, integration, ground operations, and compliance specialists. You have one point of contact. We handle the complexity behind it."],
  ["04", "Readiness and Decision Gates", "We turn open questions into documented decisions, track technical and commercial risks, and show you what must be true before you commit capital or schedule."],
  ["05", "Handoff or Ongoing Orchestration", "You choose the right next step: take a credible brief to your selected providers, or keep O2O coordinating the interfaces as the mission develops. No flight promise is implied."],
];

const services = [
  {
    name: "Mission Clarity Session",
    description: "Two hours of direct, honest assessment. We test the objective, constraints, likely mission shape, and decision risks. No commitment to proceed required.",
    deliverables: ["Written mission feasibility summary", "Preliminary cost and schedule range", "Recommended launch and integration approach", "Named blockers and how to clear them", "Decision: proceed, revise, or stop"],
    featured: true,
  },
  {
    name: "Mission Architecture Package",
    description: "A decision-ready mission design document you can take to a launch provider, an investor, or a board. Requirements defined, options compared, interfaces mapped, risks identified, compliance path outlined.",
    deliverables: ["Mission requirements document", "Launch vehicle and rideshare comparison", "Payload accommodation assessment", "Regulatory and licensing roadmap", "Preliminary cost model and schedule", "Provider shortlist with outreach coordination"],
  },
  {
    name: "Mission Orchestration Retainer",
    description: "Ongoing coordination across the mission development cycle. We manage providers, maintain the risk register, track milestones, and keep the work moving — so you can stay focused on your science or product.",
    deliverables: ["Single point of contact across all providers", "Monthly status and risk review", "Launch campaign coordination", "Coordination with compliance and insurance specialists", "Decision-gate facilitation"],
  },
];

export default function ExpressHome() {
  const { openMissionIntake } = useMissionIntake();
  const [menuOpen, setMenuOpen] = useState(false);
  const bookingUrl = "https://calendar.app.google/nQ8xro2EQ9UwhqmT7";
  useSEO({
    title: "Orbit2Orbit Express — Mission Architecture & Space Mission Orchestration",
    description: "Mission architecture and space mission orchestration for research teams, startups, and payload owners navigating a credible path to orbit.",
    canonical: "/",
    jsonLd: {
      "@context": "https://schema.org", "@type": "Service",
      name: "Space Mission Architecture and Orchestration",
      url: "https://www.orbit2orbitexpress.com/",
      provider: { "@id": "https://www.orbit2orbitexpress.com/#organization" },
      description: "Requirements definition, mission pathway evaluation, interface planning, and specialist coordination for payload owners."
    },
  });


  const closeMenu = () => setMenuOpen(false);
  const prepareBrief = () => { closeMenu(); openMissionIntake(); };

  return (
    <div className="express-page">
      <header className="express-nav">
        <Link href="/" className="express-logo" aria-label="Orbit2Orbit Express home" onClick={closeMenu}>
          Orbit<span>2</span>Orbit <span>Express</span>
        </Link>
        <button className="express-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
         <nav className={`express-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#how" onClick={closeMenu}>Methodology</a>
          <a href="https://swiftobservatoryorbit.replit.app/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Swift Tracker</a>
          <Link href="/tools" onClick={closeMenu}>Launch Tools</Link>
          <a className="express-nav-cta" href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Book Consultation</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="express-hero">
          <div className="express-hero-copy">
            <p className="express-eyebrow">Mission Architecture &amp; Orchestration</p>
            <h1>You have something that belongs in space.</h1>
            <p className="express-lede">A credible mission starts with the right questions. Orbit2Orbit Express helps research teams, startups, and payload owners turn an uncertain objective into a disciplined mission path — before they overcommit to hardware, providers, or schedule.</p>
            <div className="express-actions">
              <a className="express-button express-button-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a Mission Clarity Call <ArrowUpRight size={17} /></a>
              <button className="express-button express-button-quiet" onClick={prepareBrief}>Prepare Your Mission Brief</button>
            </div>
            <p className="express-action-note">Start with a 30-minute introductory call, or <Link href="/mission-readiness-checklist" className="underline">fill in the Mission Readiness Checklist</Link>.</p>
          </div>
          <aside className="express-credentials">
            <h2>Operating Parameters</h2>
            <p>Provider-agnostic by design. We help define the mission first, then compare the providers and paths that fit it.</p>
            <dl>
              <div><dt>Entity</dt><dd>Delaware C Corporation</dd></div>
              <div><dt>Operating base</dt><dd>Sammamish, Washington</dd></div>
              <div><dt>Primary focus</dt><dd>Payload access &amp; asset mobility</dd></div>
              <div><dt>Mission scope</dt><dd>Focused payload missions</dd></div>
            </dl>
          </aside>
        </section>

        <section className="express-section express-walls" aria-labelledby="walls-heading">
          <div className="express-section-kicker">01 / Mission owners</div>
          <div>
            <h2 id="walls-heading">Built for payload owners hitting institutional walls</h2>
             <p>Traditional aerospace primes are structured around government programs and large constellations. We focus on the questions smaller missions still need answered: what problem belongs in orbit, what constraints govern it, and what must happen next.</p>
             <p className="express-provider-note"><strong>Independent by default.</strong> O2O does not represent a preferred launch provider or imply an endorsement. We help you evaluate the path before engaging the right specialists.</p>
          </div>
          <ul className="express-audience-list">
            {audiences.map(([title, text]) => <li key={title}><span className="express-dot" /><span><strong>{title}</strong><small>{text}</small></span></li>)}
          </ul>
        </section>

        <section className="express-section express-process" id="how" aria-labelledby="how-heading">
          <div className="express-section-kicker">02 / Methodology</div>
          <div>
            <h2 id="how-heading">The orchestration lifecycle</h2>
            <p className="express-intro">A gated process designed to protect capital, establish feasibility early, and prevent speculative engineering.</p>
            <div className="express-steps">{steps.map(([number, title, text]) => <article className="express-step" key={number}><span className="express-step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          </div>
        </section>

        <section className="express-section express-services" id="services" aria-labelledby="services-heading">
          <div className="express-section-kicker">03 / Engagements</div>
          <div>
             <h2 id="services-heading">What O2O may help solve</h2>
             <p className="express-intro">Clear scope, fixed milestones, and documented outputs for the points where a promising mission usually gets stuck.</p>
            <div className="express-service-stack">{services.map((service) => <article className={`express-service-card ${service.featured ? "is-featured" : ""}`} key={service.name}>
              <div className="express-card-heading"><h3>{service.name}</h3></div>
              <p>{service.description}</p>
              <ul>{service.deliverables.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>
            </article>)}</div>
          </div>
             <div className="express-tool-path"><strong>Need the landscape before a conversation?</strong><span>Use the mission-intelligence tools to inspect launch, orbit, and provider data separately from our advisory work. </span><Link href="/tools">Open Mission Intelligence Tools <ArrowUpRight size={14} /></Link></div>
        </section>

        <section className="express-cta" id="contact" aria-labelledby="contact-heading">
          <div className="express-cta-mark" aria-hidden="true">O2O</div>
           <div><p className="express-eyebrow">Mission evaluation</p><h2 id="contact-heading">Tell us what you're trying to put in space.</h2><p>Start with a direct conversation, or prepare a structured brief so we can spend less time collecting basics and more time evaluating the mission. Incomplete answers are acceptable.</p><div className="express-actions"><a className="express-button express-button-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a Mission Clarity Call <ArrowUpRight size={17} /></a><button className="express-button express-button-quiet" onClick={prepareBrief}>Prepare Your Mission Brief</button></div></div>
        </section>
      </main>
       <footer className="express-footer"><p>© 2026 Algin Technologies Inc. · Orbit2Orbit Express · Sammamish, WA</p><div><Link href="/tools">Launch Tools &amp; Data</Link><Link href="/mission-readiness-checklist">Mission Readiness Checklist</Link><a href="https://orbitaleconomics.substack.com" target="_blank" rel="noopener noreferrer">Orbital Economics</a><a href="mailto:vlad@orbit2orbitexpress.com">vlad@orbit2orbitexpress.com</a></div></footer>
    </div>
  );
}