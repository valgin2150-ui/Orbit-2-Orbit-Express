import { Mail } from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4 sm:px-6 py-8 pb-8 md:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 border-2 border-rail-red flex items-center justify-center">
                <span className="text-rail-red font-medium text-xs">O2O</span>
              </span>
              <span className="font-normal text-gray-900">
                ORBIT <span className="text-rail-red font-medium">2</span> ORBIT
                <span className="text-gray-400 ml-1.5">EXPRESS</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Space Cargo Logistics & Launch Intelligence Platform
            </p>
            <a 
              href="mailto:vlad@orbit2orbitexpress.com" 
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-rail-red text-rail-red hover:bg-rail-red hover:text-white text-sm font-medium transition-colors"
            >
              <Mail size={16} />
              Contact Us
            </a>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Orbital Planner</Link></li>
              <li><Link href="/launches" className="text-gray-600 hover:text-gray-900 transition-colors">Launch Calendar</Link></li>
              <li><Link href="/directory" className="text-gray-600 hover:text-gray-900 transition-colors">Company Directory</Link></li>
              <li><Link href="/insights" className="text-gray-600 hover:text-gray-900 transition-colors">Insights</Link></li>
              <li><Link href="/compare" className="text-gray-600 hover:text-gray-900 transition-colors">Launcher Comparisons</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
              <li><Link href="/glossary" className="text-gray-600 hover:text-gray-900 transition-colors">Space Glossary</Link></li>
              <li><Link href="/methodology" className="text-gray-600 hover:text-gray-900 transition-colors">Sources &amp; Methodology</Link></li>
               <li><a href="/api/download/source" download className="text-gray-600 hover:text-gray-900 transition-colors">Download Source Code</a></li>
              <li><Link href="/kids" className="text-purple-500 hover:text-purple-700 transition-colors">🚀 Yeet It To Space (Kids)</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Launch Vehicles
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rockets" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">All 29 Launchers →</Link></li>
              <li><Link href="/compare" className="text-gray-600 hover:text-gray-900 transition-colors">Launcher Comparisons</Link></li>
            </ul>
            <h4 className="text-xs font-semibold text-gray-400 mt-4 mb-3 uppercase tracking-wide">
              Orbits
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/orbits" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">All 18 Destinations →</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:vlad@orbit2orbitexpress.com?subject=Help Request" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:vlad@orbit2orbitexpress.com?subject=Feature Request" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Send Feedback
                </a>
              </li>
              <li>
                <a 
                  href="mailto:vlad@orbit2orbitexpress.com?subject=Partnership Inquiry" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Partnerships
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Connect
            </h4>
            <div className="space-y-3">
              <a 
                href="https://open.substack.com/pub/orbitaleconomics?utm_source=orbit2orbitexpress&utm_medium=footer&utm_campaign=substack_subscribe" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                data-testid="link-substack"
              >
                <SiSubstack size={16} />
                <span>Substack: Orbital Economics</span>
              </a>
              <a 
                href="mailto:vlad@orbit2orbitexpress.com" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Mail size={16} />
                <span>vlad@orbit2orbitexpress.com</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Orbit 2 Orbit Express. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-gray-600 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/kids-privacy" className="text-gray-400 hover:text-gray-600 transition-colors">
              Children's Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
