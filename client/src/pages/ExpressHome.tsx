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
  ["01", "Free 30-Minute Call", "Talk directly with Vlad Algin about your objective, what you already know, and where you need help. No completed brief or technical specifications are needed. Together, we decide whether a paid assessment would be useful."],
  ["02", "Architecture and Access", "For an agreed follow-on engagement, we organize your requirements and compare potential mission paths. Provider availability and technical fit need confirmation from the relevant specialists."],
  ["03", "Provider Coordination", "Where included in the agreed scope, we coordinate questions and follow-up with potential providers and specialists. Technical approvals and delivery commitments remain with the responsible parties."],
  ["04", "Readiness and Decision Gates", "We turn open questions into documented decisions, track technical and commercial risks, and show you what must be true before you commit capital or schedule."],
  ["05", "Handoff or Ongoing Orchestration", "You choose the right next step: take a credible brief to your selected providers, or keep O2O coordinating the interfaces as the mission develops. No flight promise is implied."],
];

const services = [
  {
    name: "Mission Clarity Session",
    description: "A paid, two-hour working session to organize your mission objective, constraints, and unanswered questions. We agree the fee, scope, and timing of the written summary before you commit.",
    deliverables: ["Written mission brief: objective and known constraints", "Potential mission paths and their assumptions", "Key unknowns requiring provider or specialist input", "Next-step action list and decision points", "Recommendation: investigate further, revise, or pause"],
    featured: true,
  },
  {
    name: "Mission Architecture Package",
    description: "A separately scoped planning package for discussions with providers, funders, and technical specialists. Depth depends on the information available and the expert input the mission requires.",
    deliverables: ["Mission requirements document", "Launch vehicle and rideshare comparison", "Payload accommodation assessment", "Regulatory and licensing roadmap", "Preliminary cost and schedule assumptions, with sources", "Provider shortlist with outreach coordination"],
  },
  {
    name: "Mission Orchestration Retainer",
    description: "Follow-on coordination where the mission, providers, and responsibilities are sufficiently defined. We agree the interfaces, milestones, and reporting cadence before work begins.",
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
          <a className="express-nav-cta" href={bookingUrl} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Book a Free Call</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="express-hero">
          <div className="express-hero-copy">
            <p className="express-eyebrow">Mission Architecture &amp; Orchestration</p>
            <h1>What do you want to send to space?</h1>
            <p className="express-lede">An experiment, a technology demonstration, or a payload: start with what you want to accomplish. Vlad Algin helps research teams, startups, and payload owners organize the requirements, explore possible routes, and identify what needs checking next.</p>
            <div className="express-actions">
              <a className="express-button express-button-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a Free 30-Minute Call <ArrowUpRight size={17} /></a>
              <button className="express-button express-button-quiet" onClick={prepareBrief}>Prepare Your Mission Brief</button>
            </div>
            <p className="express-action-note">No technical specifications or completed form needed to book. Prefer to prepare first? <Link href="/mission-readiness-checklist" className="underline">fill in the Mission Readiness Checklist</Link>.</p>
          </div>
          <aside className="express-credentials">
            <h2>Who you’ll speak with</h2>
            <p>Vlad Algin, founder of Algin Technologies Inc. Orbit2Orbit Express is its mission-development and coordination service.</p>
            <dl>
              <div><dt>Approach</dt><dd>Independent, provider-agnostic</dd></div>
              <div><dt>Operating base</dt><dd>Sammamish, Washington</dd></div>
              <div><dt>Primary focus</dt><dd>Payload access &amp; asset mobility</dd></div>
              <div><dt>Mission scope</dt><dd>Focused payload missions</dd></div>
            </dl>
          </aside>
        </section>

        <section className="express-section express-walls" aria-labelledby="walls-heading">
          <div className="express-section-kicker">01 / Mission owners</div>
          <div>
            <h2 id="walls-heading">Have a payload idea and need a next step?</h2>
             <p>You may be exploring a first experiment, preparing a demonstration, or assessing an existing satellite’s options. Bring the objective and the questions you have today; the first conversation helps identify the information needed next.</p>
             <p className="express-provider-note"><strong>Independent by default.</strong> O2O does not represent a preferred launch provider or imply an endorsement. We help you evaluate the path before engaging the right specialists.</p>
          </div>
          <ul className="express-audience-list">
            {audiences.map(([title, text]) => <li key={title}><span className="express-dot" /><span><strong>{title}</strong><small>{text}</small></span></li>)}
          </ul>
        </section>

        <section className="express-section express-process" id="how" aria-labelledby="how-heading">
          <div className="express-section-kicker">02 / Methodology</div>
          <div>
            <h2 id="how-heading">Start with a conversation. Scope the work from there.</h2>
            <p className="express-intro">The free call comes first. Further work is agreed separately, with clear responsibilities and decision points.</p>
            <div className="express-steps">{steps.map(([number, title, text]) => <article className="express-step" key={number}><span className="express-step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          </div>
        </section>

        <section className="express-section express-services" id="services" aria-labelledby="services-heading">
          <div className="express-section-kicker">03 / Engagements</div>
          <div>
             <h2 id="services-heading">A clear first step, with follow-on support if needed</h2>
             <p className="express-intro">Start with the free call. Paid work has an agreed scope, fee, and written output. Early assessments identify questions to resolve; they do not certify flight feasibility or reserve launch capacity.</p>
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
           <div><p className="express-eyebrow">Mission evaluation</p><h2 id="contact-heading">Tell us what you're trying to put in space.</h2><p>Book a free 30-minute conversation with Vlad. Tell him your objective and what is getting in the way. The Mission Brief and checklist are optional preparation; you can talk first.</p><div className="express-actions"><a className="express-button express-button-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a Free 30-Minute Call <ArrowUpRight size={17} /></a><button className="express-button express-button-quiet" onClick={prepareBrief}>Prepare Your Mission Brief</button></div></div>
        </section>
      </main>
       <footer className="express-footer"><p>© 2026 Algin Technologies Inc. · Orbit2Orbit Express · Sammamish, WA</p><div><Link href="/tools">Launch Tools &amp; Data</Link><Link href="/mission-readiness-checklist">Mission Readiness Checklist</Link><a href="https://orbitaleconomics.substack.com" target="_blank" rel="noopener noreferrer">Orbital Economics</a><a href="mailto:vlad@orbit2orbitexpress.com">vlad@orbit2orbitexpress.com</a></div></footer>
    </div>
  );
}