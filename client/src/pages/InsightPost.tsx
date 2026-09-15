import { useParams, Link } from "wouter";
import { ArrowLeft, ExternalLink, Clock, Calendar as CalendarIcon, Rocket, BookOpen, ArrowRight } from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import posts from "@/data/posts.json";

interface PostBlock {
  type: "paragraph" | "heading";
  content: string;
}

interface Post {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  substackUrl: string;
  author: string;
  body: PostBlock[];
}

export default function InsightPost() {
  const params = useParams<{ slug: string }>();
  const post = (posts as Post[]).find((p) => p.slug === params.slug);

  const relatedPosts = post
    ? (posts as Post[]).filter((p) => p.slug !== post.slug).slice(0, 3)
    : [];

  useSEO({
    title: post
      ? `${post.title} - Orbital Economics`
      : "Post Not Found",
    description: post?.summary || "",
    canonical: post ? `/insights/${post.slug}` : "/insights",
    externalCanonical: post?.substackUrl,
    keywords: post
      ? `${post.category.toLowerCase()}, space industry analysis, orbital economics, ${post.title.toLowerCase()}`
      : "",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.summary,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": post.author },
          "publisher": { "@type": "Organization", "name": "Orbit to Orbit Express" },
          "url": `https://www.orbit2orbitexpress.com/insights/${post.slug}`,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.orbit2orbitexpress.com/insights/${post.slug}`,
          },
        }
      : undefined,
  });

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/insights">
            <Button variant="outline">Back to Insights</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 pt-28 pb-16" id="main-content">
        <Link href="/insights" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          All Insights
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#e3000f] bg-red-50 px-2 py-0.5">
                {post.category}
              </span>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-gray-500">{post.subtitle}</p>

            <div className="flex items-center gap-2 mt-5 text-sm text-gray-500">
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-gray-600" />
              </div>
              <span>By <strong className="text-gray-700">{post.author}</strong></span>
            </div>
          </header>

          <div className="border-t border-gray-200 pt-8 space-y-6">
            {post.body.map((block, i) =>
              block.type === "heading" ? (
                <h2
                  key={i}
                  className="text-xl font-semibold text-gray-900 mt-10 mb-3"
                >
                  {block.content}
                </h2>
              ) : (
                <p
                  key={i}
                  className="text-gray-700 leading-relaxed text-[15px]"
                >
                  {block.content}
                </p>
              )
            )}
          </div>

          <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6719]/10 via-orange-50/80 to-white border-2 border-[#FF6719]/25 p-8 sm:p-10 text-center shadow-sm">
            <div className="absolute top-0 left-0 w-56 h-56 bg-[#FF6719]/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#FF6719]/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-4 right-4 opacity-[0.03]">
              <SiSubstack className="w-28 h-28 text-[#FF6719]" />
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6719] to-[#e65100] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#FF6719]/25">
                <SiSubstack className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Want the full deep-dive?
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                This is a summary of the original article. Read the complete analysis with additional data, charts, and commentary on Substack.
              </p>
              <a href={post.substackUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#FF6719] hover:bg-[#FF6719]/90 text-white h-12 px-8 text-sm font-medium shadow-lg shadow-[#FF6719]/25 hover:shadow-xl hover:shadow-[#FF6719]/30 transition-all">
                  <SiSubstack className="w-4 h-4 mr-2" />
                  Read Full Article on Substack
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </a>
              <p className="text-xs text-gray-400 mt-3">Free on Orbital Economics Substack</p>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-gray-200 pt-10">
            <h3 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-6">
              More from Orbital Economics
            </h3>
            <div className="space-y-4">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/insights/${rp.slug}`}>
                  <Card className="bg-gray-50 border-gray-200 hover:border-[#FF6719]/30 hover:shadow-sm transition-all duration-300 cursor-pointer group overflow-hidden">
                    <div className="flex">
                      <div className="w-1 bg-gradient-to-b from-[#FF6719] to-[#e3000f] shrink-0 group-hover:w-1.5 transition-all duration-300" />
                      <CardContent className="p-5 flex items-start gap-4 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#e3000f] font-semibold">
                              {rp.category}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] text-[#FF6719] font-medium">
                              <SiSubstack className="w-2.5 h-2.5" />
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors leading-snug">
                            {rp.title}
                          </h4>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {rp.readTime}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF6719] group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 border-t border-gray-200 pt-10">
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
                </CardContent>
              </Card>
            </Link>
            <Link href="/launches">
              <Card className="bg-gray-50 border-gray-200 hover:border-[#e3000f]/50 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#e3000f]/10 flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5 text-[#e3000f]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#e3000f] transition-colors">Launch Calendar</h4>
                    <p className="text-xs text-gray-500">Track upcoming launches in real time</p>
                  </div>
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
