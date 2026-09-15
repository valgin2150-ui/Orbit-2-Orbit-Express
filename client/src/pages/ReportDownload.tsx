import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Download, CheckCircle } from "lucide-react";

export default function ReportDownload() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"downloading" | "done">("downloading");

  useEffect(() => {
    const link = document.createElement("a");
    link.href = "/2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf";
    link.download = "2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const timer = setTimeout(() => {
      setStatus("done");
      setTimeout(() => setLocation("/"), 1500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {status === "downloading" ? (
          <>
            <div className="w-12 h-12 border-2 border-gray-900 flex items-center justify-center mx-auto mb-5">
              <Download className="w-6 h-6 text-gray-900 animate-bounce" />
            </div>
            <h1 className="text-lg font-medium text-gray-900 mb-2">Your report is downloading</h1>
            <p className="text-sm text-gray-500">
              2026 Orbital Market Entry Report — Q2/Q3 Update
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-2 border-green-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-lg font-medium text-gray-900 mb-2">Download started</h1>
            <p className="text-sm text-gray-500">Taking you back to the homepage…</p>
          </>
        )}
      </div>
    </div>
  );
}
