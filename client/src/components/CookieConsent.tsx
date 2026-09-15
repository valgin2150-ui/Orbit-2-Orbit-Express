import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Shield, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "o2o_consent_v1";

type ConsentPreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

function getStoredConsent(): ConsentPreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function storeConsent(prefs: ConsentPreferences) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(getStoredConsent);
  const update = (prefs: ConsentPreferences) => {
    storeConsent(prefs);
    setConsent(prefs);
  };
  return { consent, update };
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const { consent, update } = useConsent();

  useEffect(() => {
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (!visible || consent) return null;

  const acceptAll = () => {
    update({ necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() });
    setVisible(false);
  };

  const acceptSelected = () => {
    update({ necessary: true, analytics, marketing, timestamp: new Date().toISOString() });
    setVisible(false);
  };

  const rejectAll = () => {
    update({ necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
    setVisible(false);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden">
        {!showPrefs ? (
          <div className="p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-rail-red flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Your Privacy Matters</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar technologies to improve your experience.
                  We respect your right to privacy under GDPR, CCPA, and other regulations.
                  You can customize your preferences or accept/reject all at once.
                  See our{" "}
                  <Link href="/privacy" className="text-rail-red underline">Privacy Policy</Link>,{" "}
                  <Link href="/cookies" className="text-rail-red underline">Cookie Policy</Link>, and{" "}
                  <Link href="/kids-privacy" className="text-rail-red underline">Children's Privacy Notice</Link>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={acceptAll} className="bg-rail-red hover:bg-red-700 text-white text-xs px-4 py-2 min-h-[40px]">
                    Accept All
                  </Button>
                  <Button onClick={rejectAll} variant="outline" className="border-gray-300 text-gray-700 text-xs px-4 py-2 min-h-[40px]">
                    Reject Non-Essential
                  </Button>
                  <Button onClick={() => setShowPrefs(true)} variant="ghost" className="text-gray-500 text-xs px-4 py-2 min-h-[40px] gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Privacy Preferences
              </h3>
              <button onClick={() => setShowPrefs(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">Strictly Necessary</span>
                  <p className="text-xs text-gray-500">Required for the site to function. Cannot be disabled.</p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 accent-rail-red" />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-900">Analytics</span>
                  <p className="text-xs text-gray-500">Privacy-friendly analytics (Plausible) to improve the site. No personal data collected.</p>
                </div>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="w-4 h-4 accent-rail-red" />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-900">Marketing & Communications</span>
                  <p className="text-xs text-gray-500">Newsletter signup preferences and promotional content.</p>
                </div>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="w-4 h-4 accent-rail-red" />
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={acceptSelected} className="bg-rail-red hover:bg-red-700 text-white text-xs px-4 py-2 min-h-[40px]">
                Save Preferences
              </Button>
              <Button onClick={rejectAll} variant="outline" className="border-gray-300 text-gray-700 text-xs px-4 py-2 min-h-[40px]">
                Reject All
              </Button>
            </div>

            <p className="text-[10px] text-gray-400 mt-3">
              You can change your preferences at any time via the "Privacy" link in the footer.
              For California residents: selecting "Reject All" exercises your CCPA right to opt out of the sale/sharing of personal information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
