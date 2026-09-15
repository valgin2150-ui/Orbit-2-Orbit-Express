import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import { Shield, Heart, AlertTriangle, Mail } from "lucide-react";

export default function KidsPrivacy() {
  useSEO({
    title: "Children's Privacy Notice (COPPA) - Orbit to Orbit Express",
    description: "Children's Privacy Notice for Orbit to Orbit Express. Learn how we protect children's privacy in compliance with COPPA, GDPR-K, and other child protection regulations.",
    canonical: "/kids-privacy",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main id="main-content" className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900">Children's Privacy Notice</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-800">
                This notice is specifically about how we handle data in our "Yeet It To Space" kids section. We take children's safety and privacy very seriously and comply with COPPA (Children's Online Privacy Protection Act), GDPR-K (General Data Protection Regulation provisions for children), and other applicable child protection laws.
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3 flex items-center gap-2">
                For Parents & Guardians
              </h2>
              <p>
                We want you to feel confident about your child using our platform. Here's what you need to know:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>No personal information is required.</strong> Your child can use all features of the Kids section without providing any personal information whatsoever.</li>
                <li><strong>Optional nicknames only.</strong> Users may enter a fun nickname for the activity feed and leaderboard. We strongly encourage using made-up names (like "SpaceLord420" or "MoonBoi2025") and never real names.</li>
                <li><strong>No email, no age, no location.</strong> We do not ask children for email addresses, dates of birth, physical addresses, phone numbers, or any other identifying information in the Kids section.</li>
                <li><strong>No photos or voice data.</strong> We do not collect images, videos, or audio from children.</li>
                <li><strong>No advertising.</strong> The Kids section does not contain third-party advertising or behavioral targeting.</li>
                <li><strong>No social features.</strong> Children cannot directly communicate with other users, send messages, or share personal information through the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">What Data Is Collected in the Kids Section</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-200 mt-3">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Data</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Required?</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Purpose</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Personal?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Nickname</td>
                      <td className="border border-gray-200 px-3 py-2">No (optional)</td>
                      <td className="border border-gray-200 px-3 py-2">Display on activity feed / leaderboard</td>
                      <td className="border border-gray-200 px-3 py-2">No (should be fictional)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Payload description</td>
                      <td className="border border-gray-200 px-3 py-2">Yes (to calculate)</td>
                      <td className="border border-gray-200 px-3 py-2">Fun cost calculation</td>
                      <td className="border border-gray-200 px-3 py-2">No</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Destination choice</td>
                      <td className="border border-gray-200 px-3 py-2">Yes (to calculate)</td>
                      <td className="border border-gray-200 px-3 py-2">Fun cost calculation</td>
                      <td className="border border-gray-200 px-3 py-2">No</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Mass/volume values</td>
                      <td className="border border-gray-200 px-3 py-2">Yes (to calculate)</td>
                      <td className="border border-gray-200 px-3 py-2">Fun cost calculation</td>
                      <td className="border border-gray-200 px-3 py-2">No</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-3 py-2">Cargo loader selections</td>
                      <td className="border border-gray-200 px-3 py-2">No (optional game)</td>
                      <td className="border border-gray-200 px-3 py-2">Interactive cargo packing game</td>
                      <td className="border border-gray-200 px-3 py-2">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">Important for Kids</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>Never use your real name as a nickname — make up something fun!</li>
                      <li>Don't type any personal information (like your address, school, or phone number) anywhere on the site.</li>
                      <li>Ask a parent or guardian if you're unsure about anything.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">COPPA Compliance</h2>
              <p>In compliance with the Children's Online Privacy Protection Act (COPPA), we:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not knowingly collect personal information from children under 13</li>
                <li>Do not require personal information to access the Kids section</li>
                <li>Do not use children's data for advertising or marketing purposes</li>
                <li>Do not share children's data with third parties</li>
                <li>Do not condition a child's participation on providing more information than is reasonably necessary</li>
                <li>Provide parents with the ability to review and request deletion of their child's data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">GDPR-K (Children's Data Protection)</h2>
              <p>For children in the EU/EEA/UK, we additionally comply with GDPR provisions for children's data:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>We process children's data lawfully, fairly, and transparently</li>
                <li>We minimize data collection to what is strictly necessary</li>
                <li>Privacy notices in the Kids section use clear, age-appropriate language</li>
                <li>Parents or guardians can exercise data rights on behalf of their children</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Age-Appropriate Design (UK Children's Code)</h2>
              <p>We follow principles from the UK's Age Appropriate Design Code (Children's Code):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Best interests:</strong> The Kids section is designed with children's wellbeing in mind</li>
                <li><strong>Data minimization:</strong> We collect the absolute minimum data needed</li>
                <li><strong>Default settings:</strong> Privacy-protective settings are on by default</li>
                <li><strong>Transparency:</strong> Information is presented in age-appropriate language</li>
                <li><strong>No detrimental use:</strong> Data is never used in ways detrimental to children</li>
                <li><strong>No nudge techniques:</strong> We do not use design techniques that encourage children to share personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Data Retention & Deletion</h2>
              <p>Yeet submissions (nickname, payload, destination) are retained for up to 1 year and then automatically deleted. Parents or guardians can request immediate deletion at any time.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Parental Rights</h2>
              <p>As a parent or guardian, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Review the data we have collected related to your child</li>
                <li>Request deletion of your child's data</li>
                <li>Refuse further collection of your child's data</li>
                <li>Withdraw consent for data processing at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Us
              </h2>
              <p>For any questions about children's privacy, or to exercise parental rights:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                <p className="text-sm">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:vlad@orbit2orbitexpress.com?subject=Children's Privacy Request" className="text-rail-red underline">
                    vlad@orbit2orbitexpress.com
                  </a>
                </p>
                <p className="text-sm mt-1">
                  <strong>Subject line:</strong> "Children's Privacy Request"
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  We aim to respond to all parental requests within 48 hours.
                </p>
              </div>
              <p className="mt-4">
                See also: <Link href="/privacy" className="text-rail-red underline">Privacy Policy</Link> | <Link href="/cookies" className="text-rail-red underline">Cookie Policy</Link> | <Link href="/terms" className="text-rail-red underline">Terms of Service</Link>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
