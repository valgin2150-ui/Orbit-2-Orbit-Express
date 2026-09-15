import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";

export default function TermsOfService() {
  useSEO({
    title: "Terms of Service - Orbit to Orbit Express",
    description: "Terms of Service for Orbit to Orbit Express. Read about the rules and conditions for using our space cargo logistics platform.",
    canonical: "/terms",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Orbit to Orbit Express ("O2O Express," "the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Description of Service</h2>
              <p>O2O Express provides:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Space cargo logistics cost estimation tools</li>
                <li>Launch calendar and space industry intelligence</li>
                <li>Space company directory</li>
                <li>Educational content including the "Yeet It To Space" kids section</li>
                <li>Newsletter and market reports</li>
              </ul>
              <p className="mt-2">All cost estimates, calculations, and data are provided for informational and educational purposes only. They do not constitute professional advice, quotes, or offers.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. User Accounts</h2>
              <p>Some features may require creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and notify us of any unauthorized use.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose</li>
                <li>Submit false, misleading, or harmful content</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated tools (bots, scrapers) to extract data without permission</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Submit personal information of others without their consent</li>
                <li>Use the Kids section to collect information from children or engage in harmful behavior</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Kids Section ("Yeet It To Space")</h2>
              <p>The Kids section is designed for users of all ages. Special terms apply:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>No personal information is required to use the Kids section</li>
                <li>Nicknames submitted are voluntary and should not contain real names, addresses, or identifying information</li>
                <li>Parents and guardians are encouraged to supervise their children's use of the platform</li>
                <li>We reserve the right to remove any inappropriate content submitted to the Kids section</li>
                <li>The Kids section is for educational entertainment — all data and calculations are fictional/illustrative</li>
              </ul>
              <p className="mt-2">See our <Link href="/kids-privacy" className="text-rail-red underline">Children's Privacy Notice</Link> for details on how we handle children's data.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Intellectual Property</h2>
              <p>All content, design, code, and materials on O2O Express are owned by or licensed to us and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission, except as permitted by applicable law.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. User-Generated Content</h2>
              <p>By submitting content (yeet submissions, company suggestions, inquiry messages), you grant us a non-exclusive, royalty-free license to use, display, and store that content in connection with the Service. You represent that you have the right to submit such content and that it does not violate any third-party rights.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Subscription Services</h2>
              <p>Some features may require a paid subscription. By subscribing:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You agree to pay the applicable fees</li>
                <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
                <li>Refunds are handled according to applicable law and our refund policy</li>
                <li>We reserve the right to change pricing with reasonable notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Disclaimer of Warranties</h2>
              <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Cost estimates, calculations, or data are accurate, complete, or current</li>
                <li>The Service will meet your specific requirements</li>
              </ul>
              <p className="mt-2"><strong>Space launch cost estimates are for informational purposes only and should not be used as the sole basis for business decisions.</strong></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, O2O Express shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if we have been advised of the possibility of such damages.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">11. Indemnification</h2>
              <p>You agree to indemnify and hold harmless O2O Express from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">12. Modifications</h2>
              <p>We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the revised Terms. We will make reasonable efforts to notify users of significant changes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">13. Governing Law</h2>
              <p>These Terms are governed by and construed in accordance with the laws of the jurisdiction in which O2O Express operates, without regard to conflict of law principles.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">14. Severability</h2>
              <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">15. Contact</h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:vlad@orbit2orbitexpress.com" className="text-rail-red underline">vlad@orbit2orbitexpress.com</a>.
              </p>
              <p className="mt-2">
                See also: <Link href="/privacy" className="text-rail-red underline">Privacy Policy</Link> | <Link href="/cookies" className="text-rail-red underline">Cookie Policy</Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
