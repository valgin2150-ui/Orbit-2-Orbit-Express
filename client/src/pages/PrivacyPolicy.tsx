import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function DataRightsForm() {
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<"access" | "deletion">("access");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiRequest("POST", "/api/privacy-request", { email: email.trim(), type: requestType });
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to submit request. Please email us directly.", variant: "destructive" });
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-6">
        <p className="text-green-800 text-sm font-medium">Request submitted successfully.</p>
        <p className="text-green-700 text-xs mt-1">We will process your {requestType} request and respond within 30 days as required by law.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-6 rounded-lg mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">Exercise Your Data Rights</h3>
      <p className="text-sm text-gray-600 mb-4">Submit a request to access or delete your personal data. We will respond within 30 days.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="flex-1 min-h-[44px]"
        />
        <select
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as "access" | "deletion")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="access">Data Access Request</option>
          <option value="deletion">Data Deletion Request</option>
        </select>
        <Button type="submit" disabled={loading} className="bg-rail-red hover:bg-red-700 text-white min-h-[44px]">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}

export default function PrivacyPolicy() {
  useSEO({
    title: "Privacy Policy - Orbit to Orbit Express",
    description: "Privacy Policy for Orbit to Orbit Express. Learn how we collect, use, and protect your data under GDPR, CCPA, and other privacy regulations.",
    canonical: "/privacy",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Who We Are</h2>
              <p>Orbit to Orbit Express ("O2O Express," "we," "us," or "our") operates the website orbit2orbitexpress.com, providing space cargo logistics tools, launch intelligence, and educational content. This Privacy Policy explains how we collect, use, disclose, and protect your information.</p>
              <p>Contact: <a href="mailto:vlad@orbit2orbitexpress.com" className="text-rail-red underline">vlad@orbit2orbitexpress.com</a></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Information We Collect</h2>
              <p><strong>Information you provide directly:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Inquiry forms:</strong> Name, email address, payload description when you submit an inquiry through our chatbot or contact forms.</li>
                <li><strong>Newsletter signup:</strong> Email address when you subscribe to our newsletter or download lead magnets.</li>
                <li><strong>Yeet submissions (Kids section):</strong> Optional nickname, payload description, and destination choice. No real personal information is required.</li>
                <li><strong>Company suggestions:</strong> Company name and details when you suggest a company for our directory.</li>
                <li><strong>Data rights requests:</strong> Email address when you submit a data access or deletion request.</li>
              </ul>
              <p className="mt-3"><strong>Information collected automatically:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Analytics:</strong> We use Plausible Analytics, a privacy-friendly, cookie-free analytics service. Plausible does not collect personal data, does not use cookies, and is fully GDPR, CCPA, and PECR compliant. No individual visitors are tracked.</li>
                <li><strong>Authentication:</strong> If you create an account via Clerk, we receive your basic profile information (name, email) as provided by your authentication provider.</li>
                <li><strong>Technical data:</strong> Standard server logs may include IP addresses, browser type, and referral URLs, retained for security and operational purposes only.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To respond to your inquiries and provide customer support</li>
                <li>To send newsletters and marketing communications (only with your consent)</li>
                <li>To improve our website, tools, and educational content</li>
                <li>To display community activity in the Kids section (using only voluntary nicknames, no personal data)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Legal Basis for Processing (GDPR)</h2>
              <p>For users in the European Economic Area (EEA), UK, and Switzerland, we process data based on:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Consent:</strong> Newsletter subscriptions, marketing communications, and optional data sharing.</li>
                <li><strong>Legitimate interest:</strong> Improving our services, security, and preventing fraud.</li>
                <li><strong>Contract performance:</strong> Providing the services you requested (inquiries, account features).</li>
                <li><strong>Legal obligation:</strong> Compliance with applicable laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Your Rights</h2>
              <p><strong>Under GDPR (EU/EEA/UK residents):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="mt-3"><strong>Under CCPA/CPRA (California residents):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right to know what personal information is collected and how it is used</li>
                <li>Right to delete personal information</li>
                <li>Right to opt out of the sale or sharing of personal information</li>
                <li>Right to non-discrimination for exercising your rights</li>
                <li>Right to correct inaccurate personal information</li>
                <li>Right to limit use of sensitive personal information</li>
              </ul>
              <p className="mt-3"><strong>We do not sell your personal information.</strong> We do not share personal information for cross-context behavioral advertising.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Children's Privacy (COPPA)</h2>
              <p>
                Our Kids section ("Yeet It To Space") is designed to be enjoyed by users of all ages. We take children's privacy seriously and comply with the Children's Online Privacy Protection Act (COPPA) and equivalent international regulations.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We do not knowingly collect personal information from children under 13 without verifiable parental consent.</li>
                <li>The Kids section does not require any personal information to use. Nicknames are optional and should not contain real names.</li>
                <li>We do not use behavioral advertising or tracking in the Kids section.</li>
                <li>Parents and guardians can request access to or deletion of any data related to their child by contacting us.</li>
              </ul>
              <p className="mt-2">For more details, see our <a href="/kids-privacy" className="text-rail-red underline">Children's Privacy Notice</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Cookies & Tracking</h2>
              <p>
                We use minimal cookies. Our analytics provider (Plausible) is cookie-free. Cookies we may use include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Consent preferences:</strong> Stored in your browser's local storage to remember your privacy choices.</li>
                <li><strong>Authentication cookies:</strong> Set by Clerk if you create an account, necessary for login functionality.</li>
                <li><strong>Announcement dismissal:</strong> Stored in local storage to remember if you've dismissed the announcement bar.</li>
              </ul>
              <p className="mt-2">For more details, see our <a href="/cookies" className="text-rail-red underline">Cookie Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Data Retention</h2>
              <p>We retain your data only as long as necessary for the purposes described:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Inquiry data:</strong> 2 years, then deleted</li>
                <li><strong>Newsletter subscriptions:</strong> Until you unsubscribe</li>
                <li><strong>Yeet submissions:</strong> 1 year, then automatically purged</li>
                <li><strong>Server logs:</strong> 90 days</li>
                <li><strong>Account data:</strong> Until you delete your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your data, including encrypted connections (HTTPS/TLS), secure database hosting, and access controls. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Plausible Analytics:</strong> Privacy-friendly, no personal data collected, EU-hosted</li>
                <li><strong>Clerk:</strong> Authentication provider (if you create an account)</li>
                <li><strong>Neon Database:</strong> Data hosting infrastructure</li>
                <li><strong>Replit:</strong> Application hosting platform</li>
              </ul>
              <p className="mt-2">We do not use Google Analytics, Facebook Pixel, or similar tracking technologies.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">11. International Data Transfers</h2>
              <p>Your data may be transferred to and processed in countries outside your jurisdiction. We ensure appropriate safeguards are in place, including Standard Contractual Clauses where required.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">12. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our website. Your continued use of the site after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">13. Contact Us</h2>
              <p>For any privacy-related questions, concerns, or to exercise your rights:</p>
              <p className="mt-2">
                Email: <a href="mailto:vlad@orbit2orbitexpress.com" className="text-rail-red underline">vlad@orbit2orbitexpress.com</a><br />
                Subject line: "Privacy Request — [Your Request Type]"
              </p>
              <p className="mt-2">We aim to respond to all requests within 30 days.</p>
            </section>

            <DataRightsForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
