import { useEffect } from "react";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  externalCanonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://www.orbit2orbitexpress.com";
const SITE_NAME = "Orbit to Orbit Express";

export function useSEO({
  title,
  description,
  canonical,
  externalCanonical,
  ogTitle,
  ogDescription,
  ogType = "website",
  keywords,
  jsonLd,
}: SEOConfig) {
  useEffect(() => {
    const fullTitle = (title.includes(SITE_NAME) || title.includes("Orbit2Orbit Express"))
      ? title
      : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    else document.querySelectorAll('meta[name="keywords"]').forEach(el => el.remove());

    setMeta("property", "og:title", ogTitle || fullTitle);
    setMeta("property", "og:description", ogDescription || description);
    setMeta("property", "og:type", ogType);
    if (canonical || externalCanonical) {
      const fullCanonical = externalCanonical || `${BASE_URL}${canonical}`;
      const ogUrl = canonical ? `${BASE_URL}${canonical}` : fullCanonical;
      setMeta("property", "og:url", ogUrl);
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.href = fullCanonical;
    }

    setMeta("name", "twitter:title", ogTitle || fullTitle);
    setMeta("name", "twitter:description", ogDescription || description);

    const existingJsonLd = document.querySelectorAll('script[data-seo-page="true"]');
    existingJsonLd.forEach((el) => el.remove());

    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-page", "true");
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    return () => {
      const pageScripts = document.querySelectorAll('script[data-seo-page="true"]');
      pageScripts.forEach((el) => el.remove());
    };
  }, [title, description, canonical, externalCanonical, ogTitle, ogDescription, ogType, keywords, jsonLd]);
}
