import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";


interface MissionIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 5;

const PAYLOAD_OPTIONS = [
  "CubeSat (1U–12U, under 24kg)",
  "Small Satellite (25kg–150kg)",
  "Instrument / Experiment",
  "Commercial Payload (150kg+)",
  "I'm still in planning — not sure yet",
];

const DESTINATION_OPTIONS = [
  "Low Earth Orbit (LEO)",
  "Sun-Synchronous Orbit (SSO)",
  "Geostationary (GEO / GTO)",
  "Lunar Orbit or Surface",
  "Deep Space / Interplanetary",
  "Not sure yet — need guidance",
];

const TIMELINE_OPTIONS = [
  "Within 12 months",
  "2027",
  "2028 or later",
  "Still in early planning",
];

const CHALLENGE_OPTIONS = [
  "Finding the right launch provider",
  "Understanding costs and budget",
  "ITAR / export control / documentation",
  "Payload integration requirements",
  "No launch broker or advisor yet",
  "Internal approvals or funding",
  "Something else",
  "I don't know yet — help me frame the problem",
];

const TECHNICAL_REQUIREMENTS = [
  "Power",
  "Thermal",
  "Communications / data",
  "Pointing / attitude",
  "Microgravity / environment",
  "Return or recovery",
  "Not sure — need help defining these",
];

const SPECIAL_HANDLING = [
  "Hazardous materials",
  "Biological materials",
  "Cryogenic or pressurized systems",
  "Radioactive materials",
  "Sensitive or export-controlled hardware",
  "None known",
  "Not sure — need guidance",
];

const REGULATORY_STATUS = [
  "No review started",
  "Internal review underway",
  "Export-control review underway",
  "Licensing or safety review underway",
  "Requirements already documented",
  "Not sure — need help mapping this",
];

const MATURITY_OPTIONS = [
  "Objective only — concept stage",
  "Requirements being defined",
  "Prototype or lab work underway",
  "Flight hardware in development",
  "Flight-ready or previously flown",
  "Not sure how to classify it",
];

const SPACECRAFT_STATUS_OPTIONS = [
  "Payload only — spacecraft not selected",
  "Comparing spacecraft or platforms",
  "Spacecraft selected",
  "Hosted payload arrangement under discussion",
  "Spacecraft or bus in development",
  "Not applicable / need guidance",
];

const STEP_LABELS = [
  "Payload",
  "Destination",
  "Timeline",
  "Challenges",
  "Contact",
];

function RadioCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 ${
        selected
          ? "border-[#e3000f] bg-[#e3000f]/5"
          : "border-gray-200 bg-white hover:border-gray-400"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          selected ? "border-[#e3000f]" : "border-gray-400"
        }`}
      >
        {selected && (
          <span className="w-2 h-2 rounded-full bg-[#e3000f]" />
        )}
      </span>
      <span className="text-sm text-gray-800">{label}</span>
    </button>
  );
}

function CheckboxCard({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center gap-3 ${
        checked
          ? "border-[#e3000f] bg-[#e3000f]/5"
          : "border-gray-200 bg-white hover:border-gray-400"
      }`}
    >
      <span
        className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center ${
          checked ? "border-[#e3000f] bg-[#e3000f]" : "border-gray-400 bg-white"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-gray-800">{label}</span>
    </button>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex gap-1 mb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 transition-all duration-300 ${
              i < step ? "bg-[#e3000f]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 tracking-wide">
        Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
      </p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-3">
      {children}
    </p>
  );
}

export function MissionIntakeModal({ isOpen, onClose }: MissionIntakeModalProps) {
  const [step, setStep] = useState(1);
  const [payloadType, setPayloadType] = useState("");
  const [payloadMass, setPayloadMass] = useState("");
  const [destination, setDestination] = useState("");
  const [timeline, setTimeline] = useState("");
  const [challenges, setChallenges] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [missionObjective, setMissionObjective] = useState("");
  const [missionSuccess, setMissionSuccess] = useState("");
  const [payloadDimensions, setPayloadDimensions] = useState("");
  const [formFactor, setFormFactor] = useState("");
  const [desiredAltitude, setDesiredAltitude] = useState("");
  const [desiredInclination, setDesiredInclination] = useState("");
  const [missionMaturity, setMissionMaturity] = useState("");
  const [spacecraftStatus, setSpacecraftStatus] = useState("");
  const [technicalRequirements, setTechnicalRequirements] = useState<string[]>([]);
  const [specialHandling, setSpecialHandling] = useState<string[]>([]);
  const [regulatoryStatus, setRegulatoryStatus] = useState<string[]>([]);
  const [earliestFlightDate, setEarliestFlightDate] = useState("");
  const [latestFlightDate, setLatestFlightDate] = useState("");
  const [timingFlexible, setTimingFlexible] = useState("");
  const [biggestQuestion, setBiggestQuestion] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setStep(1);
    setPayloadType("");
    setPayloadMass("");
    setDestination("");
    setTimeline("");
    setChallenges([]);
    setAdditionalContext("");
    setMissionObjective("");
    setMissionSuccess("");
    setPayloadDimensions("");
    setFormFactor("");
    setDesiredAltitude("");
    setDesiredInclination("");
    setMissionMaturity("");
    setSpacecraftStatus("");
    setTechnicalRequirements([]);
    setSpecialHandling([]);
    setRegulatoryStatus([]);
    setEarliestFlightDate("");
    setLatestFlightDate("");
    setTimingFlexible("");
    setBiggestQuestion("");
    setBudgetRange("");
    setName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setWebsite("");
    setSubmitting(false);
    setSubmitted(false);
    setError("");
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(reset, 300);
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen) return;
    (window as any).plausible?.("Modal Open");
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  const toggleChallenge = (val: string) => {
    setChallenges((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleValue = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) => {
    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  const canAdvance = () => {
    if (step === 1) return !!payloadType;
    if (step === 2) return !!destination;
    if (step === 3) return !!timeline;
    if (step === 4) return true;
    if (step === 5) {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      const validPhone = /^\+?[0-9().\-\s]{7,30}$/.test(phone.trim());
      return !!name.trim() && validEmail && validPhone;
    }
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError("");
    try {
      await apiRequest("POST", "/api/mission-intake", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization.trim() || undefined,
        website: website.trim() || undefined,
        missionObjective: missionObjective.trim() || undefined,
        missionSuccess: missionSuccess.trim() || undefined,
        payloadDimensions: payloadDimensions.trim() || undefined,
        formFactor: formFactor.trim() || undefined,
        desiredAltitude: desiredAltitude.trim() || undefined,
        desiredInclination: desiredInclination.trim() || undefined,
        missionMaturity: missionMaturity || undefined,
        spacecraftStatus: spacecraftStatus || undefined,
        technicalRequirements,
        specialHandling,
        regulatoryStatus,
        earliestFlightDate: earliestFlightDate || undefined,
        latestFlightDate: latestFlightDate || undefined,
        timingFlexible: timingFlexible || undefined,
        biggestQuestion: biggestQuestion.trim() || undefined,
        budgetRange: budgetRange || undefined,
        payloadType,
        payloadMass: payloadMass.trim() || undefined,
        destination,
        timeline,
        challenges,
        additionalContext: additionalContext.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email vlad@orbit2orbitexpress.com directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Mission Brief"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-[560px] bg-white border-2 border-[#e3000f] overflow-y-auto max-h-[90vh]"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#e3000f] font-semibold mb-0.5">
              O2O Express
            </p>
            <h2 className="text-lg font-semibold text-gray-900">Mission Brief</h2>
            <p className="text-xs text-gray-500 mt-1">Start with what you know. Unknowns are useful signals.</p>
            <a
              href="https://calendar.app.google/nQ8xro2EQ9UwhqmT7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-[#e3000f] underline"
            >
              Prefer a direct conversation? Book a 30-minute call
            </a>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {submitted ? (
            <div className="py-6 text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: "#2e7d32" }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-2">
                MISSION BRIEF RECEIVED
              </p>
              <p className="text-gray-900 text-base mb-3">
                Thank you, <span className="font-semibold">{name}</span>. Your intake has been sent to Vlad.
              </p>
              <p className="text-sm text-gray-500 mb-5">
                We'll be in touch within 24 hours to schedule your consultation.<br />
                Questions in the meantime?{" "}
                <a
                  href="mailto:vlad@orbit2orbitexpress.com"
                  className="text-[#e3000f] underline"
                >
                  vlad@orbit2orbitexpress.com
                </a>
              </p>
              <a
                href="https://calendar.app.google/nQ8xro2EQ9UwhqmT7"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => (window as any).plausible?.("Booking Click")}
                className="inline-block bg-[#e3000f] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#c0000d] transition-colors"
              >
                Book Your Free 30-Minute Call →
              </a>
            </div>
          ) : (
            <>
              <ProgressBar step={step} />

              {step === 1 && (
                <div>
                  <FieldLabel>What are you launching?</FieldLabel>
                  <div className="space-y-2">
                    {PAYLOAD_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt}
                        label={opt}
                        selected={payloadType === opt}
                        onClick={() => setPayloadType(opt)}
                      />
                    ))}
                  </div>
                  {payloadType && payloadType !== "I'm still in planning — not sure yet" && (
                    <div className="mt-4">
                      <FieldLabel>Payload mass (kg) — optional</FieldLabel>
                      <Input
                        type="number"
                        placeholder="e.g. 12"
                        value={payloadMass}
                        onChange={(e) => setPayloadMass(e.target.value)}
                        className="rounded-none border-gray-300 text-base h-11"
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <FieldLabel>What are you trying to accomplish? — optional</FieldLabel>
                    <textarea
                      rows={3}
                      placeholder="A short description of the research, product, or operational objective"
                      value={missionObjective}
                      onChange={(e) => setMissionObjective(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#e3000f] resize-none"
                    />
                  </div>
                  <details className="mt-4 border-t border-gray-100 pt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                      Add payload details <span className="font-normal text-gray-400">(optional)</span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <textarea
                        rows={2}
                        placeholder="What would success look like? (optional)"
                        value={missionSuccess}
                        onChange={(e) => setMissionSuccess(e.target.value)}
                        aria-label="Mission success"
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#e3000f] resize-none"
                      />
                      <Input
                        type="text"
                        placeholder="Payload dimensions, e.g. 10 x 10 x 20 cm"
                        value={payloadDimensions}
                        onChange={(e) => setPayloadDimensions(e.target.value)}
                        aria-label="Payload dimensions"
                        className="rounded-none border-gray-300 text-base h-11"
                      />
                      <Input
                        type="text"
                        placeholder="Form factor or interface notes"
                        value={formFactor}
                        onChange={(e) => setFormFactor(e.target.value)}
                        aria-label="Form factor"
                        className="rounded-none border-gray-300 text-base h-11"
                      />
                      <FieldLabel>Mission maturity</FieldLabel>
                      <div className="space-y-2">
                        {MATURITY_OPTIONS.map((option) => (
                          <RadioCard key={option} label={option} selected={missionMaturity === option} onClick={() => setMissionMaturity(option)} />
                        ))}
                      </div>
                      <FieldLabel>Spacecraft or platform status</FieldLabel>
                      <div className="space-y-2">
                        {SPACECRAFT_STATUS_OPTIONS.map((option) => (
                          <RadioCard key={option} label={option} selected={spacecraftStatus === option} onClick={() => setSpacecraftStatus(option)} />
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {step === 2 && (
                <div>
                  <FieldLabel>Where does it need to go?</FieldLabel>
                  <div className="space-y-2">
                    {DESTINATION_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt}
                        label={opt}
                        selected={destination === opt}
                        onClick={() => setDestination(opt)}
                      />
                    ))}
                  </div>
                  <details className="mt-4 border-t border-gray-100 pt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                      Add orbit parameters <span className="font-normal text-gray-400">(optional)</span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <Input
                        type="text"
                        placeholder="Desired altitude, e.g. 500–550 km"
                        value={desiredAltitude}
                        onChange={(e) => setDesiredAltitude(e.target.value)}
                        aria-label="Desired altitude"
                        className="rounded-none border-gray-300 text-base h-11"
                      />
                      <Input
                        type="text"
                        placeholder="Desired inclination, e.g. sun-synchronous or 51.6°"
                        value={desiredInclination}
                        onChange={(e) => setDesiredInclination(e.target.value)}
                        aria-label="Desired inclination"
                        className="rounded-none border-gray-300 text-base h-11"
                      />
                      <p className="text-xs text-gray-400">Not sure? Leave these blank and we can help map the mission to an orbit.</p>
                    </div>
                  </details>
                </div>
              )}

              {step === 3 && (
                <div>
                  <FieldLabel>When are you targeting launch?</FieldLabel>
                  <div className="space-y-2">
                    {TIMELINE_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt}
                        label={opt}
                        selected={timeline === opt}
                        onClick={() => setTimeline(opt)}
                      />
                    ))}
                  </div>
                  <details className="mt-4 border-t border-gray-100 pt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                      Add timing detail <span className="font-normal text-gray-400">(optional)</span>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <Input type="date" value={earliestFlightDate} onChange={(e) => setEarliestFlightDate(e.target.value)} aria-label="Earliest flight date" className="rounded-none border-gray-300 text-base h-11" />
                      <Input type="date" value={latestFlightDate} onChange={(e) => setLatestFlightDate(e.target.value)} aria-label="Latest flight date" className="rounded-none border-gray-300 text-base h-11" />
                      <FieldLabel>How flexible is the timing?</FieldLabel>
                      {["Fixed date or event", "Some flexibility", "Very flexible", "Not sure yet"].map((option) => (
                        <RadioCard key={option} label={option} selected={timingFlexible === option} onClick={() => setTimingFlexible(option)} />
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {step === 4 && (
                <div>
                  <FieldLabel>What's your biggest challenge right now?</FieldLabel>
                  <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
                  <div className="space-y-2">
                    {CHALLENGE_OPTIONS.map((opt) => (
                      <CheckboxCard
                        key={opt}
                        label={opt}
                        checked={challenges.includes(opt)}
                        onClick={() => toggleChallenge(opt)}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <FieldLabel>Budget or funding context — optional</FieldLabel>
                    <Input
                      type="text"
                      placeholder="e.g. exploring, funded, awaiting approval"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="rounded-none border-gray-300 text-base h-11 mb-4"
                    />
                    <FieldLabel>Anything else we should know? (optional)</FieldLabel>
                    <textarea
                      rows={3}
                      placeholder="Mission context, constraints, specific questions…"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#e3000f] resize-none"
                    />
                  </div>
                  <details className="mt-4 border-t border-gray-100 pt-4">
                    <summary className="cursor-pointer text-xs font-semibold text-gray-600">
                      Add technical and regulatory detail <span className="font-normal text-gray-400">(optional)</span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div>
                        <FieldLabel>Technical requirements — select all that apply</FieldLabel>
                        <div className="space-y-2">
                          {TECHNICAL_REQUIREMENTS.map((option) => (
                            <CheckboxCard key={option} label={option} checked={technicalRequirements.includes(option)} onClick={() => toggleValue(setTechnicalRequirements, option)} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Special handling — select all that apply</FieldLabel>
                        <div className="space-y-2">
                          {SPECIAL_HANDLING.map((option) => (
                            <CheckboxCard key={option} label={option} checked={specialHandling.includes(option)} onClick={() => toggleValue(setSpecialHandling, option)} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Regulatory status — select all that apply</FieldLabel>
                        <div className="space-y-2">
                          {REGULATORY_STATUS.map((option) => (
                            <CheckboxCard key={option} label={option} checked={regulatoryStatus.includes(option)} onClick={() => toggleValue(setRegulatoryStatus, option)} />
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="What is the biggest question you want answered? (optional)"
                        value={biggestQuestion}
                        onChange={(e) => setBiggestQuestion(e.target.value)}
                        aria-label="Biggest question"
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#e3000f] resize-none"
                      />
                    </div>
                  </details>
                </div>
              )}

              {step === 5 && (
                <div>
                  <FieldLabel>Let's talk</FieldLabel>
                  <p className="text-xs text-gray-400 mb-4">
                    Send us your mission brief and we'll reach out within 24 hours to schedule a free 30-minute call — focused on your payload, not a sales pitch.
                  </p>
                  <div className="space-y-3 mb-5">
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-none border-gray-300 text-base h-11"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="rounded-none border-gray-300 text-base h-11"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      aria-label="Phone number"
                      className="rounded-none border-gray-300 text-base h-11"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Company, university, or agency (optional)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="rounded-none border-gray-300 text-base h-11"
                    />
                    <Input
                      type="url"
                      placeholder="Website or project link (optional)"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      autoComplete="url"
                      className="rounded-none border-gray-300 text-base h-11"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Prefer to talk first?{" "}
                    <a href="https://calendar.app.google/nQ8xro2EQ9UwhqmT7" target="_blank" rel="noopener noreferrer" className="text-[#e3000f] underline">
                      Book a direct 30-minute call
                    </a>
                    {" "}without completing this brief.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6">
                <Button
                  type="button"
                  onClick={step === TOTAL_STEPS ? handleSubmit : handleNext}
                  disabled={!canAdvance() || submitting}
                  className="w-full h-11 bg-[#e3000f] hover:bg-[#c0000d] text-white text-sm font-medium rounded-none border-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Submitting…"
                    : step === TOTAL_STEPS
                    ? "Send Mission Brief →"
                    : (
                      <span className="flex items-center justify-center gap-1">
                        Next <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                </Button>
                {step > 1 && !submitted && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
