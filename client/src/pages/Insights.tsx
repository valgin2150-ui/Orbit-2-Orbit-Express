import { Link } from "wouter";
import { ArrowRight, ExternalLink, Rocket, Calendar, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import posts from "@/data/posts.json";

const SUBSTACK_URL = "https://open.substack.com/pub/orbitaleconomics";

function isNew(dateStr: string) {
  const postDate = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export default function Insights() {
  useSEO({
    title: "Space Industry Insights & Orbital Economics - Launch Cost Analysis",
    description: "Expert analysis of space launch economics, orbital mechanics, and commercial space industry trends. Deep dives into launch costs, provider comparisons, mission planning strategies, space investment trends, and defense space market analysis from Orbital Economics.",
    canonical: "/insights",
    keywords: "space industry analysis, launch cost analysis, orbital economics, space market trends, satellite launch costs 2026, commercial space industry insights, space launch provider comparison, CubeSat launch guide, space investment, orbital economics newsletter, defense space market, commercial space market size, space economy 2026, venture capital space industry, space SPAC, satellite constellation economics, launch market pricing, space infrastructure investment, NewSpace funding, space industry revenue",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Space Industry Insights - Orbital Economics",
      "description": "Expert analysis and canonical summaries covering space launch economics, orbital mechanics, and commercial space industry trends.",
      "url": "https://www.orbit2orbitexpress.com/insights",
      "publisher": { "@type": "Organization", "name": "Orbit to Orbit Express" },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": posts.length,
        "itemListElement": posts.map((a, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Article",
            "headline": a.title,
            "description": a.summary,
            "datePublished": a.date,
            "url": `https://www.orbit2orbitexpress.com/insights/${a.slug}`,
            "author": { "@type": "Organization", "name": "Orbital Economics" },
          }
        }))
      }
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-16" id="main-content">
        <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6719]/8 via-orange-50 to-white border border-[#FF6719]/20 p-8 sm:p-10 shadow-sm">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6719]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#e3000f]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-4 right-4 opacity-[0.04]">
            <SiSubstack className="w-32 h-32 sm:w-48 sm:h-48 text-[#FF6719]" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6719] to-[#e65100] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6719]/25">
                <SiSubstack className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#FF6719] uppercase tracking-widest font-mono font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  Orbital Economics
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono mt-0.5">
                  Space Industry Analysis
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Insights & Orbital Economics
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
              Expert analysis of launch costs, orbital mechanics, and commercial space industry trends. 
              Canonical summaries from our <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="text-[#FF6719] hover:underline inline-flex items-center gap-1 font-medium">Orbital Economics <SiSubstack className="w-3.5 h-3.5 inline" /></a> newsletter.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white h-10 px-5 text-sm font-medium shadow-md shadow-[#FF6719]/20">
                  <SiSubstack className="w-4 h-4 mr-2" />
                  Subscribe Free
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </a>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{posts.length} articles published</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {posts.map((article) => (
            <Card key={article.slug} className="group bg-white border-gray-200 hover:border-[#FF6719]/40 hover:shadow-md hover:shadow-[#FF6719]/5 transition-all duration-300 overflow-hidden">
              <div className="flex">
                <div className="w-1.5 bg-gradient-to-b from-[#FF6719] via-[#FF6719]/70 to-[#e3000f] shrink-0 group-hover:w-2 transition-all duration-300" />
                <CardContent className="p-6 flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#e3000f] bg-red-50 px-2.5 py-1 rounded-sm font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {article.readTime}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-[10px] text-white bg-[#FF6719] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      <SiSubstack className="w-3 h-3" />
                      Substack
                    </span>
                  </div>

                  <Link href={`/insights/${article.slug}`}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 leading-snug hover:text-[#e3000f] transition-colors cursor-pointer flex items-start gap-2">
                      {article.title}
                      {isNew(article.date) && (
                        <span className="inline-flex items-center shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#e3000f] text-white animate-pulse mt-1 rounded-sm">
                          <Sparkles className="w-3 h-3 mr-0.5" />
                          NEW
                        </span>
                      )}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {article.summary}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <Link
                      href={`/insights/${article.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-[#e3000f] transition-colors"
                    >
                      Read summary
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a 
                      href={article.substackUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#FF6719] hover:text-[#FF6719]/80 transition-colors"
                    >
                      <SiSubstack className="w-3.5 h-3.5" />
                      Full article on Substack
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white h-12 px-8 text-sm font-medium">
              <SiSubstack className="w-4 h-4 mr-2" />
              Subscribe to Orbital Economics
            </Button>
          </a>
          <p className="text-xs text-gray-400 mt-2">Free newsletter on space launch economics</p>
        </div>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">Report Library</h2>
          <div className="space-y-3 mb-10">
            {[
              {
                title: "2026 Orbital Market Entry Report — Q2/Q3 Update (v5)",
                date: "May 2026",
                description: "SpaceX IPO mechanics, New Glenn grounding, Neutron slip, Stoke Space pipeline, FY27 NASA budget implications, and orbital compute developments.",
                file: "/2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf",
                filename: "2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf",
                badge: "Latest",
              },
              {
                title: "2026 Orbital Market Entry Report — Q1 Baseline",
                date: "February 2026",
                description: "Full baseline covering launch market sizing ($24–32B), provider analysis, pricing benchmarks, and cost-optimization strategies.",
                file: "/2026-Orbital-Market-Entry-Report-Q1-v1.pdf",
                filename: "2026-Orbital-Market-Entry-Report-Q1-v1.pdf",
                badge: "Archive",
              },
            ].map((report) => (
              <div key={report.file} className="border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{report.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 font-mono ${report.badge === "Latest" ? "bg-[#e3000f] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {report.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{report.date} · {report.description}</p>
                </div>
                <a
                  href={report.file}
                  download={report.filename}
                  className="flex items-center gap-2 text-xs font-medium text-gray-700 border border-gray-300 px-3 py-2 hover:border-gray-900 hover:text-gray-900 transition-colors shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 pt-10">
          <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">Related Tools</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/">
              <Card className="bg-gray-50 border-gray-200 hover:border-[#e3000f]/50 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e3000f]/10 flex items-center justify-center shrink-0">
                    <Rocket className="w-5 h-5 text-[#e3000f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors">Orbital Planner</h4>
                    <p className="text-xs text-gray-500">Model your mission costs with real provider data</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/launches">
              <Card className="bg-gray-50 border-gray-200 hover:border-[#e3000f]/50 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e3000f]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#e3000f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors">Launch Calendar</h4>
                    <p className="text-xs text-gray-500">Track upcoming launches in real time</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
