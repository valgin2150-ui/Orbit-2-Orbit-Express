import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Printer, Mail, Download } from "lucide-react";
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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [missionName, setMissionName] = useState("");
  const [emailReady, setEmailReady] = useState(false);
  const brief = [
    "O2O Mission Readiness Checklist", `Mission / organization: ${missionName.trim() || "Not provided"}`,
    ...sections.map(([title]) => `\n${title} — ${reviewed[title] ? "Reviewed" : "Open"}\n${answers[title]?.trim() || "To discuss"}`),
  ].join("\n");
  const downloadBrief = () => {
    const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "O2O-mission-checklist.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const emailBrief = () => {
    // Keep the mailto short: long briefs are attached by the customer from the downloaded copy.
    const body = brief.length <= 1400 ? brief : "Hi Vlad,\n\nI would like to discuss my mission. I will attach my completed O2O mission checklist to this email.";
    if (brief.length > 1400) downloadBrief();
    window.location.href = `mailto:vlad@orbit2orbitexpress.com?subject=${encodeURIComponent("O2O Mission Readiness Checklist")}&body=${encodeURIComponent(body)}`;
    setEmailReady(true);
  };
  useSEO({
    title: "Mission Readiness Checklist — Orbit2Orbit Express",
    description: "A print-friendly checklist for turning an uncertain space mission objective into a useful brief.",
    canonical: "/mission-readiness-checklist",
  });

  return (
    <main id="main-content" className="checklist-page">
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
        <label className="checklist-field">
          Mission or organization (optional)
          <input value={missionName} onChange={e => setMissionName(e.target.value)} maxLength={160} />
        </label>
        <p className="checklist-print-answer">Mission / organization: {missionName || "________________________"}</p>
        <p className="checklist-help">Fill in what you know, then print or save as PDF, download a text copy, or open an email draft to Vlad. Answers stay on this page until you leave or reload it. Send only information appropriate for an initial inquiry.</p>
        <section className="checklist-grid" aria-label="Mission readiness questions">
          {sections.map(([title, questions]) => (
            <section className="checklist-item" key={title}>
              <h2>{title}</h2>
              <label className="checklist-review"><input type="checkbox" checked={!!reviewed[title]} onChange={e => setReviewed({ ...reviewed, [title]: e.target.checked })} /> Reviewed {title.toLowerCase()}</label>
            <ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
              <label className="checklist-field">{title} notes
                <textarea rows={4} maxLength={3000} value={answers[title] || ""} onChange={e => setAnswers({ ...answers, [title]: e.target.value })} placeholder="What you know, assumptions, or questions to discuss" />
              </label>
              <p className="checklist-print-answer">{answers[title] || "Notes: ________________________________________"}</p>
            </section>
          ))}
        </section>
        <div className="checklist-actions">
          <button type="button" onClick={() => window.print()}><Printer size={14} /> Print / Save as PDF</button>
          <button type="button" onClick={downloadBrief}><Download size={14} /> Download answers</button>
          <button type="button" onClick={emailBrief}><Mail size={14} /> Open email draft</button>
          <Link href="/">Return to mission architecture</Link>
        </div>
        {emailReady && <p role="status" className="checklist-help">Your email application should open a draft. Review it and press Send there. For a long brief, attach the downloaded text file. If no draft opens, download your answers and email them to vlad@orbit2orbitexpress.com.</p>}
      </article>
    </main>
  );
}