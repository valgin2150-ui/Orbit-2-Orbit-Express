import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Mail, Clock, ExternalLink } from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useMissionIntake } from "@/contexts/MissionIntakeContext";
import { useQuery } from "@tanstack/react-query";

interface NavigationProps {
  onOpenPricing?: () => void;
}

interface NavLinkItem {
  href: string;
  label: string;
  testId: string;
  external?: boolean;
}


function NavCountdown() {
  const { data } = useQuery<{ results: Array<{ net: string; name: string }> }>({
    queryKey: ['/api/launches'],
    staleTime: 300000,
  });

  const [timeLeft, setTimeLeft] = useState("");

  const nextLaunchDate = data?.results?.[0]?.net;

  useEffect(() => {
    if (!nextLaunchDate) return;
    const update = () => {
      const now = Date.now();
      const target = new Date(nextLaunchDate).getTime();
      const diff = target - now;
      if (diff <= 0) { setTimeLeft("LIFTOFF"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft(d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextLaunchDate]);

  if (!timeLeft) return null;

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
      <Clock className="w-3 h-3 text-rail-red" />
      <span className="text-gray-500">Next Launch:</span>
      <span className="text-rail-red font-bold">T-{timeLeft}</span>
    </div>
  );
}

export function Navigation({ onOpenPricing }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { tier, isSignedIn } = useSubscription();
  const { openMissionIntake } = useMissionIntake();
  const [showAnnouncement, setShowAnnouncement] = useState(
    () => sessionStorage.getItem("announcementDismissed") !== "1"
  );
  const announcementRef = useRef<HTMLDivElement>(null);
  const [announcementHeight, setAnnouncementHeight] = useState(32);

  useEffect(() => {
    if (!showAnnouncement) { setAnnouncementHeight(0); return; }
    const measure = () => {
      if (announcementRef.current) setAnnouncementHeight(announcementRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [showAnnouncement]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const navLinks: NavLinkItem[] = [
    { href: "/tools", label: "Orbital Planner", testId: "nav-calculator" },
    { href: "/launches", label: "Calendar", testId: "nav-calendar" },
    { href: "/rockets", label: "Launchers", testId: "nav-rockets" },
    { href: "/compare", label: "Compare", testId: "nav-compare" },
    { href: "/orbits", label: "Orbits", testId: "nav-orbits" },
    { href: "/directory", label: "Directory", testId: "nav-directory" },
    { href: "/insights", label: "Insights", testId: "nav-insights" },
    { href: "/methodology", label: "Sources & Methodology", testId: "nav-methodology" },
    { href: "/lunar-compute", label: "Lunar Compute", testId: "nav-lunar-compute" },
    { href: "https://swiftobservatoryorbit.replit.app/", label: "Swift Tracker", testId: "nav-swift-tracker", external: true },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <>
      {showAnnouncement && (
        <div ref={announcementRef} className="fixed top-0 left-0 right-0 z-[60] bg-gray-900 text-white">
          <div className="container mx-auto px-4 flex items-center justify-between py-1.5">
            <a
              href="https://open.substack.com/pub/orbitaleconomics?utm_source=orbit2orbitexpress&utm_medium=announcement_bar&utm_campaign=substack_subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-xs sm:text-sm font-medium hover:text-gray-200 transition-colors"
            >
              <span className="mr-1">🚀</span>
              <span className="hidden sm:inline">Get the latest on space capital flows. </span>
              Subscribe to <span className="underline">Orbital Economics</span> on Substack
            </a>
            <button
              onClick={() => { setShowAnnouncement(false); sessionStorage.setItem("announcementDismissed", "1"); }}
              className="ml-2 p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header 
        className={`fixed left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-200 ${
          isScrolled ? "shadow-sm" : ""
        }`}
        style={{ top: `${announcementHeight}px` }}
        role="banner"
      >
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className={`flex items-center justify-between transition-all duration-200 ${
            isScrolled ? "h-12" : "h-14 md:h-16"
          }`}>
            <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
              <Link href="/" className="flex items-center gap-2" data-testid="nav-home">
                <span className="w-7 h-7 sm:w-8 sm:h-8 border-2 border-rail-red flex items-center justify-center flex-shrink-0">
                  <span className="text-rail-red font-medium text-xs sm:text-sm">O2O</span>
                </span>
                <span className={`font-normal text-gray-900 transition-all duration-200 whitespace-nowrap ${isScrolled ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
                  <span className="hidden sm:inline">ORBIT </span>
                  <span className="sm:hidden text-rail-red font-medium">O</span>
                  <span className="text-rail-red font-medium">2</span>
                  <span className="hidden sm:inline"> ORBIT</span>
                  <span className="sm:hidden text-rail-red font-medium">O</span>
                  <span className="text-gray-400 ml-1">EXPRESS</span>
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-5" aria-label="Main navigation">
                {navLinks.map((link) => link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap inline-flex items-center gap-1"
                    data-testid={link.testId}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs lg:text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-rail-red"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    data-testid={link.testId}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <NavCountdown />

              <a
                href="https://www.orbitaleconomics.substack.com?utm_source=orbit2orbitexpress&utm_medium=nav_icon&utm_campaign=substack_subscribe"
                target="_blank"
                rel="noopener noreferrer"
                title="Orbital Economics on Substack"
                className="hidden md:flex items-center justify-center w-8 h-8 text-[#FF6719] hover:bg-orange-50 transition-colors"
              >
                <SiSubstack className="w-4 h-4" />
              </a>

              {tier !== "free" && (
                <span className="hidden sm:inline-flex px-3 py-1 text-xs font-semibold bg-rail-red/10 text-rail-red border border-rail-red/30">
                  {tier.toUpperCase()}
                </span>
              )}

              <button
                onClick={openMissionIntake}
                className="hidden md:inline-flex items-center px-3 lg:px-4 py-2 bg-[#e3000f] text-white text-xs lg:text-sm font-medium min-h-[44px] hover:bg-[#c0000d] transition-colors whitespace-nowrap"
                data-testid="nav-mission-help"
              >
                Get Mission Help
              </button>
              
              <button
                className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-lg overflow-y-auto"
            style={{ top: `${announcementHeight + (isScrolled ? 48 : 56)}px`, maxHeight: `calc(100dvh - ${announcementHeight + (isScrolled ? 48 : 56)}px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors min-h-[48px] flex items-center justify-between"
                  data-testid={`${link.testId}-mobile`}
                >
                  {link.label}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-4 px-4 text-base font-medium transition-colors min-h-[48px] flex items-center ${
                    isActive(link.href)
                      ? "text-rail-red bg-rail-red/5"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  data-testid={`${link.testId}-mobile`}
                >
                  {link.label}
                </Link>
              ))}
              
              <a 
                href="https://open.substack.com/pub/orbitaleconomics?utm_source=orbit2orbitexpress&utm_medium=mobile_menu&utm_campaign=substack_subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-4 text-base font-medium text-[#FF6719] hover:bg-orange-50 transition-colors min-h-[48px] flex items-center gap-2"
              >
                <SiSubstack className="w-4 h-4" />
                Orbital Economics
              </a>
              
              <div className="border-t border-gray-200 mt-2 pt-4">
                <a 
                  href="mailto:vlad@orbit2orbitexpress.com" 
                  className="py-4 px-4 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors min-h-[48px] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </div>

              <div className="border-t border-gray-200 mt-2 pt-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openMissionIntake();
                  }}
                  className="w-full py-3 min-h-[48px] text-base font-medium bg-[#e3000f] text-white hover:bg-[#c0000d] transition-colors"
                  data-testid="nav-mission-help-mobile"
                >
                  Get Mission Help
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
