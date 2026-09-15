import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";

export default function CookiePolicy() {
  useSEO({
    title: "Cookie Policy - Orbit to Orbit Express",
    description: "Cookie Policy for Orbit to Orbit Express. Learn about the cookies and local storage we use and how to manage your preferences.",
    canonical: "/cookies",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences and improve your experience. "Local storage" is a similar browser feature that stores data on your device.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Our Approach to Cookies</h2>
              <p>We believe in privacy by design. Our site uses minimal cookies and tracking:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We use <strong>Plausible Analytics</strong>, which is completely cookie-free and does not track individual users.</li>
                <li>We do <strong>not</strong> use Google Analytics, Facebook Pixel, or any advertising trackers.</li>
                <li>We do <strong>not</strong> engage in cross-site tracking or behavioral advertising.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">What We Store</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200 mt-3">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Name</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Type</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Purpose</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Duration</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 font-mono text-xs">o2o_consent_v1</td>
                      <td className="border border-gray-200 px-3 py-2">Local Storage</td>
                      <td className="border border-gray-200 px-3 py-2">Remembers your cookie/privacy consent preferences</td>
                      <td className="border border-gray-200 px-3 py-2">Persistent</td>
                      <td className="border border-gray-200 px-3 py-2">Strictly Necessary</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 font-mono text-xs">o2o_announcement_dismissed</td>
                      <td className="border border-gray-200 px-3 py-2">Local Storage</td>
                      <td className="border border-gray-200 px-3 py-2">Remembers if you dismissed the announcement bar</td>
                      <td className="border border-gray-200 px-3 py-2">Persistent</td>
                      <td className="border border-gray-200 px-3 py-2">Strictly Necessary</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2 font-mono text-xs">__clerk_*</td>
                      <td className="border border-gray-200 px-3 py-2">Cookie</td>
                      <td className="border border-gray-200 px-3 py-2">Authentication session (only if you create an account)</td>
                      <td className="border border-gray-200 px-3 py-2">Session / 30 days</td>
                      <td className="border border-gray-200 px-3 py-2">Strictly Necessary</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Managing Your Preferences</h2>
              <p>You can manage your cookie preferences at any time:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the cookie consent banner that appears when you first visit the site.</li>
                <li>Clear your browser's local storage and cookies to reset all preferences.</li>
                <li>Use your browser's built-in cookie management settings.</li>
              </ul>
              <p className="mt-2">To clear local storage: Open your browser's Developer Tools (F12), go to the "Application" or "Storage" tab, and clear local storage for this site.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Third-Party Cookies</h2>
              <p>We do not set any third-party advertising or tracking cookies. The only third-party cookies that may be present are from Clerk (authentication provider) if you choose to create an account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Do Not Track (DNT)</h2>
              <p>We respect the "Do Not Track" browser signal. Since we use Plausible Analytics (which does not track individuals), your DNT preference is honored by default.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
              <p>
                If you have questions about our use of cookies, contact us at{" "}
                <a href="mailto:vlad@orbit2orbitexpress.com" className="text-rail-red underline">vlad@orbit2orbitexpress.com</a>.
              </p>
              <p className="mt-2">
                See also: <Link href="/privacy" className="text-rail-red underline">Privacy Policy</Link> | <Link href="/kids-privacy" className="text-rail-red underline">Children's Privacy Notice</Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
