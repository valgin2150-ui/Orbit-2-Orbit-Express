import { Link } from "wouter";
import { ArrowLeft, Printer } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

const sections: Array<[string, string[]]> = [
  ["Objective", ["What are you trying to learn, demonstrate, manufacture, or change?", "What would make the mission useful even if the result is inconclusive?", "Who needs to make the next decision?"]],
  ["Payload and experiment", ["What is the payload, instrument, or experiment in plain language?", "Approximate mass, dimensions, power, data, and thermal needs.", "What is fixed today, and what is still a working assumption?"]],
  ["Orbit and operations", ["What environment or access does the objective require?", "How long must the payload operate or remain accessible?", "What ground, communications, or return-to-Earth needs exist?"]],
  ["Timing and resources", ["What event is driving the target date?", "What budget range, funding gate, or procurement constraint matters?", "Which internal people can make technical, commercial, and regulatory decisions?"]],
  ["Risk and readiness", ["What could make the mission not worth pursuing?", "What approvals, export controls, safety reviews, or sensitive data apply?", "What would you like an outside mission architect to resolve first?"]],
  ["Path to a decision", ["What do you need to know before selecting a provider?", "Which options are you already considering, without assuming they are the answer?", "What is the smallest useful next step?"]],
];

export default function MissionReadinessChecklist() {
  useSEO({
    title: "Mission Readiness Checklist — Orbit2Orbit Express",
    description: "A print-friendly checklist for turning an uncertain space mission objective into a useful brief.",
    canonical: "/mission-readiness-checklist",
  });

  return (
    <main className="checklist-page">
      <article className="checklist-sheet">
        <header className="checklist-header">
          <div>
            <Link href="/" className="express-eyebrow"><ArrowLeft size={13} /> Orbit2Orbit Express</Link>
            <h1>Mission Readiness Checklist</h1>
            <p>A working page for payload owners preparing a first mission conversation. Bring what you know. Leave the rest open.</p>
          </div>
          <span className="checklist-meta">O2O / BRIEF 01</span>
        </header>
        <div className="checklist-intro">
          <strong>Incomplete answers are acceptable.</strong> This is not a compliance form or a flight-readiness review. It is a way to expose the assumptions, decisions, and unknowns that shape a credible mission path.
        </div>
        <section className="checklist-grid" aria-label="Mission readiness questions">
          {sections.map(([title, questions]) => (
            <section className="checklist-item" key={title}>
              <h2>{title}</h2>
            <ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
            </section>
          ))}
        </section>
        <div className="checklist-actions">
          <button type="button" onClick={() => window.print()}><Printer size={14} /> Print checklist</button>
          <Link href="/">Return to mission architecture</Link>
        </div>
      </article>
    </main>
  );
}