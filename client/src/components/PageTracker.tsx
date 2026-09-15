import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

export default function PageTracker() {
  const [location] = useLocation();
  const lastTracked = useRef("");

  useEffect(() => {
    if (location === lastTracked.current) return;
    lastTracked.current = location;

    // Fire Plausible pageview — works on all platforms (iOS Safari, Android Chrome, desktop)
    // Using manual mode so we control when pageviews fire for this SPA
    if (typeof window !== "undefined" && typeof window.plausible === "function") {
      window.plausible("pageview");
    }

    // Also send to custom server-side analytics for daily digest emails
    const referrer = document.referrer || "";
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location, referrer }),
    }).catch(() => {});
  }, [location]);

  return null;
}
