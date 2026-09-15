import { Link } from "wouter";

export type DataLabelKind = "Estimate" | "Published figure" | "Derived value" | "O2O model";

const LABEL_STYLES: Record<DataLabelKind, string> = {
  Estimate: "bg-amber-50 text-amber-800 border-amber-200",
  "Published figure": "bg-blue-50 text-blue-800 border-blue-200",
  "Derived value": "bg-purple-50 text-purple-800 border-purple-200",
  "O2O model": "bg-red-50 text-red-800 border-red-200",
};

export const METHODOLOGY_DISCLAIMER =
  "O2O Express provides mission-planning estimates based on published and modelled data. Final pricing, performance, launch availability, licensing, and mission compatibility require confirmation with the launch or mission provider.";

export function DataLabel({ kind }: { kind: DataLabelKind }) {
  return (
    <span className={`inline-flex items-center border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LABEL_STYLES[kind]}`}>
      {kind}
    </span>
  );
}

export function MethodologyNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 ${className}`}>
      <p>{METHODOLOGY_DISCLAIMER}</p>
      <Link href="/methodology" className="mt-2 inline-block font-medium text-amber-900 underline hover:text-rail-red">
        Read Sources &amp; Methodology
      </Link>
    </div>
  );
}