import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertMissionSchema, insertCompanySuggestionSchema, insertYeetSchema, insertMissionIntakeSchema } from "@shared/schema";
import { z } from "zod";
import Parser from "rss-parser";
import { assertEmailSent, getUncachableResendClient } from "./resend";
import { trackPageView, scheduleDailyEmail, getAnalyticsStats, sendDailyAnalyticsEmail } from "./analytics";
import { appendIntakeToSheet } from "./googleSheets";
import { registerDataQARoute } from "./dataQARoute";
import { getMachineAccessReport } from "./botProtection";

// Cache for launch data to reduce API calls
let launchCache: { launches: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional(),
  payload: z.string().trim().max(5000).optional(),
  message: z.string().trim().max(5000).optional(),
  source: z.string().trim().max(100).optional(),
  context: z.string().trim().max(1000).optional(),
});

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Fallback launch data when API is rate limited and cache is empty
// Updated July 2026 — reflects current active launch cadence
const FALLBACK_LAUNCHES = [
  {
    id: 'fallback-1',
    name: 'Starship | Flight 13',
    missionName: 'Starship Flight 13',
    provider: 'SpaceX',
    providerAbbrev: 'SpX',
    vehicle: 'Starship',
    launchSite: 'SpaceX Starbase, TX, USA',
    padName: 'Orbital Launch Mount A',
    dateTime: '2026-07-23T22:45:00Z',
    status: 'Go for Launch',
    statusAbbrev: 'Go',
    missionType: 'Test Flight',
    missionDescription: 'SpaceX Starship Flight 13 integrated test. Super Heavy booster and Ship vehicle targeting full-stack reuse demonstration from Starbase, Boca Chica, Texas.',
    webcastUrl: 'https://www.youtube.com/spacex',
    imageUrl: null,
    probability: 85
  },
  {
    id: 'fallback-2',
    name: 'Falcon 9 Block 5 | Starlink Group 17-51',
    missionName: 'Starlink Group 17-51',
    provider: 'SpaceX',
    providerAbbrev: 'SpX',
    vehicle: 'Falcon 9',
    launchSite: 'Vandenberg SFB, CA, USA',
    padName: 'SLC-4E',
    dateTime: '2026-07-25T14:00:00Z',
    status: 'Go for Launch',
    statusAbbrev: 'Go',
    missionType: 'Communications',
    missionDescription: 'Batch deployment of Starlink V2 Mini satellites to polar orbit for the Starlink broadband mega-constellation.',
    webcastUrl: null,
    imageUrl: null,
    probability: 93
  },
  {
    id: 'fallback-3',
    name: 'Falcon 9 Block 5 | Starlink Group 17-52',
    missionName: 'Starlink Group 17-52',
    provider: 'SpaceX',
    providerAbbrev: 'SpX',
    vehicle: 'Falcon 9',
    launchSite: 'Vandenberg SFB, CA, USA',
    padName: 'SLC-4E',
    dateTime: '2026-07-29T02:00:00Z',
    status: 'Go for Launch',
    statusAbbrev: 'Go',
    missionType: 'Communications',
    missionDescription: 'Batch deployment of Starlink V2 Mini satellites to polar orbit as part of SpaceX\'s ongoing Starlink constellation expansion.',
    webcastUrl: null,
    imageUrl: null,
    probability: 92
  },
  {
    id: 'fallback-4',
    name: 'Falcon 9 Block 5 | NROL-95',
    missionName: 'NROL-95',
    provider: 'SpaceX',
    providerAbbrev: 'SpX',
    vehicle: 'Falcon 9',
    launchSite: 'Cape Canaveral SFS, FL, USA',
    padName: 'SLC-40',
    dateTime: '2026-07-30T06:37:00Z',
    status: 'To Be Confirmed',
    statusAbbrev: 'TBC',
    missionType: 'Government',
    missionDescription: 'National Reconnaissance Office classified payload launched on Falcon 9 for the United States Intelligence Community.',
    webcastUrl: null,
    imageUrl: null,
    probability: 75
  },
  {
    id: 'fallback-5',
    name: 'Electron | LOXSAT 1',
    missionName: 'LOXSAT 1',
    provider: 'Rocket Lab',
    providerAbbrev: 'RL',
    vehicle: 'Electron',
    launchSite: 'Rocket Lab Launch Complex 1, Mahia Peninsula, New Zealand',
    padName: 'LC-1',
    dateTime: '2026-07-31T00:00:00Z',
    status: 'To Be Determined',
    statusAbbrev: 'TBD',
    missionType: 'Technology Demonstration',
    missionDescription: 'NASA-funded payload built by Eta Space to validate eleven cryogenic fluid management technologies in LEO, including zero-loss liquid oxygen storage and automated tank pressure control — foundational building blocks for orbital refueling.',
    webcastUrl: null,
    imageUrl: null,
    probability: null
  },
  {
    id: 'fallback-6',
    name: 'Long March 8A | Unknown Payload',
    missionName: 'Long March 8A Mission',
    provider: 'CASC',
    providerAbbrev: 'CASC',
    vehicle: 'Long March 8A',
    launchSite: 'Wenchang Space Launch Site, People\'s Republic of China',
    padName: 'LC-1',
    dateTime: '2026-08-04T11:00:00Z',
    status: 'To Be Confirmed',
    statusAbbrev: 'TBC',
    missionType: 'Unknown',
    missionDescription: 'Chinese Academy of Launch Vehicle Technology Long March 8A mission from the Wenchang Space Launch Site on Hainan Island.',
    webcastUrl: null,
    imageUrl: null,
    probability: null
  }
];

// Cache for Payload news feed
let newsCache: { articles: any[]; timestamp: number } | null = null;
const NEWS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache for SpaceNews feed
let spaceNewsCache: { articles: any[]; timestamp: number } | null = null;
const SPACENEWS_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// Cache for Substack / Orbital Economics feed
let substackCache: { articles: any[]; timestamp: number } | null = null;
const SUBSTACK_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Cache for stock quotes
let stockCache: { quotes: any[]; timestamp: number } | null = null;
const STOCK_CACHE_DURATION = 60 * 1000; // 1 minute (stocks update frequently)

// Space-related stock symbols
const SPACE_STOCKS = [
  { symbol: "RKLB", name: "Rocket Lab" },
  { symbol: "LUNR", name: "Intuitive Machines" },
  { symbol: "ASTS", name: "AST SpaceMobile" },
  { symbol: "PL", name: "Planet Labs" },
  { symbol: "SPCE", name: "Virgin Galactic" },
  { symbol: "RDW", name: "Redwire" },
  { symbol: "BKSY", name: "BlackSky" },
  { symbol: "VSAT", name: "Viasat" },
  { symbol: "IRDM", name: "Iridium" },
  { symbol: "SATL", name: "Satellogic" },
];

const rssParser = new Parser();

// Extract first image from HTML content
function extractImageFromContent(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

// Transform raw API data to our format
function transformLaunchData(rawLaunches: any[]): any[] {
  return rawLaunches.map((launch: any) => ({
    id: launch.id,
    name: launch.name,
    missionName: launch.mission?.name || launch.name,
    provider: launch.launch_service_provider?.name || 'Unknown',
    providerAbbrev: launch.launch_service_provider?.abbrev || 'UNK',
    vehicle: launch.rocket?.configuration?.name || 'Unknown',
    launchSite: launch.pad?.location?.name || 'Unknown',
    padName: launch.pad?.name || '',
    dateTime: launch.net,
    status: launch.status?.name || 'Unknown',
    statusAbbrev: launch.status?.abbrev || 'UNK',
    missionType: launch.mission?.type || 'Unknown',
    missionDescription: launch.mission?.description || '',
    webcastUrl: launch.vidURLs?.[0]?.url || null,
    imageUrl: launch.image || launch.rocket?.configuration?.image_url,
    probability: launch.probability
  }));
}

const payloadSchema = z.object({
  payloadType: z.string(),
  mass: z.number().min(0),
  volume: z.number().min(0),
  orbit: z.string(),
  region: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin diagnostics endpoint for reviewing canonical launcher data quality.
  registerDataQARoute(app);

  // API endpoint to calculate logistics
  app.post("/api/calculate", async (req, res) => {
    try {
      // Validate payload
      const payload = payloadSchema.parse(req.body);
      
      // Calculate logistics
      const results = await storage.calculateLogistics(payload);
      
      // Return results
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid payload data", details: error.errors });
      } else {
        console.error("Error calculating logistics:", error);
        res.status(500).json({ error: "An error occurred while calculating logistics" });
      }
    }
  });

  // API endpoint to get all rockets
  app.get("/api/rockets", async (req, res) => {
    try {
      const rockets = await storage.getAllRockets();
      res.json(rockets);
    } catch (error) {
      console.error("Error retrieving rockets:", error);
      res.status(500).json({ error: "An error occurred while retrieving rockets" });
    }
  });

  // API endpoint to get all orbits
  app.get("/api/orbits", async (req, res) => {
    try {
      const orbits = await storage.getAllOrbits();
      res.json(orbits);
    } catch (error) {
      console.error("Error retrieving orbits:", error);
      res.status(500).json({ error: "An error occurred while retrieving orbits" });
    }
  });

  // API endpoint to save mission
  app.post("/api/missions", async (req, res) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      const savedMission = await storage.saveMission(missionData);
      res.status(201).json(savedMission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid mission data", details: error.errors });
      } else {
        console.error("Error saving mission:", error);
        res.status(500).json({ error: "An error occurred while saving the mission" });
      }
    }
  });

  // API endpoint to get mission by ID
  app.get("/api/missions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid mission ID" });
      }
      
      const mission = await storage.getMission(id);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      
      res.json(mission);
    } catch (error) {
      console.error("Error retrieving mission:", error);
      res.status(500).json({ error: "An error occurred while retrieving the mission" });
    }
  });

  // API endpoint to get upcoming space launches from Launch Library 2 API
  app.get("/api/launches", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const days = parseInt(req.query.days as string) || 30;
      
      // Calculate date range
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const startISO = startDate.toISOString().split('T')[0];
      const endISO = endDate.toISOString().split('T')[0];
      
      // Check cache first - return transformed cached data
      if (launchCache && (Date.now() - launchCache.timestamp) < CACHE_DURATION) {
        // Filter cached launches to only include those within the date range
        const filteredLaunches = launchCache.launches.filter(launch => {
          const launchDate = new Date(launch.dateTime);
          return launchDate >= startDate && launchDate <= endDate;
        });
        return res.json({ 
          launches: filteredLaunches.slice(0, limit), 
          cached: true,
          lastUpdated: new Date(launchCache.timestamp).toISOString(),
          dateRange: { start: startISO, end: endISO }
        });
      }

      // Fetch from Launch Library 2 API with date range filter
      const response = await fetch(
        `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${Math.min(limit, 200)}&mode=detailed&net__gte=${startISO}&net__lte=${endISO}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Orbit2OrbitExpress/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Launch Library API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the data before caching
      const transformedLaunches = transformLaunchData(data.results || []);
      
      // Cache the transformed data
      launchCache = { launches: transformedLaunches, timestamp: Date.now() };

      res.json({ 
        launches: transformedLaunches.slice(0, limit), 
        cached: false,
        lastUpdated: new Date().toISOString(),
        dateRange: { start: startISO, end: endISO }
      });
    } catch (error) {
      console.error("Error fetching launches:", error);
      
      // Return cached transformed data if available, even if stale
      if (launchCache) {
        const limit = parseInt(req.query.limit as string) || 30;
        return res.json({ 
          launches: launchCache.launches.slice(0, limit),
          cached: true,
          stale: true,
          lastUpdated: new Date(launchCache.timestamp).toISOString()
        });
      }
      
      // Return fallback data when no cache available
      const limit = parseInt(req.query.limit as string) || 30;
      console.log("Using fallback launch data due to API unavailability");
      res.json({ 
        launches: FALLBACK_LAUNCHES.slice(0, limit),
        fallback: true,
        message: "Live data temporarily unavailable - showing sample launches",
        lastUpdated: new Date().toISOString()
      });
    }
  });

  // API endpoint to get Payload Space news feed
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Check cache first
      if (newsCache && (Date.now() - newsCache.timestamp) < NEWS_CACHE_DURATION) {
        return res.json({ 
          articles: newsCache.articles.slice(0, limit), 
          cached: true,
          lastUpdated: new Date(newsCache.timestamp).toISOString()
        });
      }

      // Fetch from Payload Space RSS feed
      const feed = await rssParser.parseURL('https://payloadspace.com/feed/');
      
      const articles = (feed.items || []).map((item: any) => ({
        id: item.guid || item.link,
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate,
        description: item.contentSnippet || item.content?.substring(0, 200) || '',
        creator: item.creator || item['dc:creator'] || 'Payload',
        categories: item.categories || [],
        imageUrl: extractImageFromContent(item.content || item['content:encoded'] || '')
      }));
      
      // Cache the articles
      newsCache = { articles, timestamp: Date.now() };

      res.json({ 
        articles: articles.slice(0, limit), 
        cached: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      
      // Return cached data if available
      if (newsCache) {
        const limit = parseInt(req.query.limit as string) || 10;
        return res.json({ 
          articles: newsCache.articles.slice(0, limit),
          cached: true,
          stale: true,
          lastUpdated: new Date(newsCache.timestamp).toISOString()
        });
      }
      
      res.status(500).json({ error: "Failed to fetch news data" });
    }
  });

  // API endpoint to save a yeet (kids experience)
  app.post("/api/yeets", async (req, res) => {
    try {
      const yeet = insertYeetSchema.parse(req.body);
      const savedYeet = await storage.saveYeet(yeet);
      res.status(201).json(savedYeet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid yeet data", details: error.errors });
      } else {
        res.status(500).json({ error: "An error occurred while saving the yeet" });
      }
    }
  });

  // API endpoint to get recent yeets
  app.get("/api/yeets", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const yeets = await storage.getRecentYeets(limit);
      res.json({ yeets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch yeets" });
    }
  });

  // API endpoint to get top yeets of the day (leaderboard)
  app.get("/api/yeets/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topYeets = await storage.getTopYeetsToday(limit);
      res.json({ topYeets });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // API endpoint to submit a company suggestion
  app.post("/api/company-suggestions", async (req, res) => {
    try {
      const suggestion = insertCompanySuggestionSchema.parse(req.body);
      const savedSuggestion = await storage.saveCompanySuggestion(suggestion);

      try {
        const { client, fromEmail } = await getUncachableResendClient();
        const result = await client.emails.send({
          from: fromEmail,
          to: "vlad@orbit2orbitexpress.com",
          replyTo: suggestion.submitterEmail,
          subject: `Company Suggestion — ${suggestion.name}`,
          html: `
            <h2>New Company Suggestion</h2>
            <p><strong>Company:</strong> ${escapeHtml(suggestion.name)}</p>
            <p><strong>Country:</strong> ${escapeHtml(suggestion.country)}</p>
            <p><strong>Headquarters:</strong> ${escapeHtml(suggestion.headquartersCity)}</p>
            <p><strong>Company type:</strong> ${escapeHtml(suggestion.companyType)}</p>
            <p><strong>Segments:</strong> ${suggestion.segments.map(escapeHtml).join(", ")}</p>
            <p><strong>Website:</strong> ${escapeHtml(suggestion.website)}</p>
            ${suggestion.linkedin ? `<p><strong>LinkedIn:</strong> ${escapeHtml(suggestion.linkedin)}</p>` : ""}
            <p><strong>Description:</strong> ${escapeHtml(suggestion.description)}</p>
            <p><strong>Active products:</strong> ${escapeHtml(suggestion.activeProducts || "Not provided")}</p>
            <hr />
            <p><strong>Submitted by:</strong> ${escapeHtml(suggestion.submitterName || "Not provided")} (${escapeHtml(suggestion.submitterEmail)})</p>
          `,
        });
        assertEmailSent(result);
      } catch (emailError) {
        console.error("[COMPANY SUGGESTION] Email notification failed:", emailError);
        return res.status(502).json({
          error: "Suggestion saved, but operator notification failed. Please email vlad@orbit2orbitexpress.com directly.",
          id: savedSuggestion.id,
        });
      }

      res.status(201).json(savedSuggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid suggestion data", details: error.errors });
      } else {
        res.status(500).json({ error: "An error occurred while saving the suggestion" });
      }
    }
  });

  // API endpoint to get SpaceNews feed
  app.get("/api/spacenews", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Check cache first
      if (spaceNewsCache && (Date.now() - spaceNewsCache.timestamp) < SPACENEWS_CACHE_DURATION) {
        return res.json({ 
          articles: spaceNewsCache.articles.slice(0, limit), 
          cached: true,
          lastUpdated: new Date(spaceNewsCache.timestamp).toISOString()
        });
      }

      // Fetch from SpaceNews RSS feed
      const feed = await rssParser.parseURL('https://spacenews.com/feed/');
      
      const articles = (feed.items || []).map((item: any) => ({
        id: item.guid || item.link,
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate,
        description: item.contentSnippet?.substring(0, 150) || item.content?.substring(0, 150) || '',
        creator: item.creator || item['dc:creator'] || 'SpaceNews',
        categories: item.categories || [],
        imageUrl: extractImageFromContent(item.content || item['content:encoded'] || '')
      }));
      
      // Cache the articles
      spaceNewsCache = { articles, timestamp: Date.now() };

      res.json({ 
        articles: articles.slice(0, limit), 
        cached: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching SpaceNews:", error);
      
      // Return cached data if available
      if (spaceNewsCache) {
        const limit = parseInt(req.query.limit as string) || 10;
        return res.json({ 
          articles: spaceNewsCache.articles.slice(0, limit),
          cached: true,
          stale: true,
          lastUpdated: new Date(spaceNewsCache.timestamp).toISOString()
        });
      }
      
      res.status(500).json({ error: "Failed to fetch SpaceNews data" });
    }
  });

  // API endpoint to get stock quotes from Finnhub
  app.get("/api/stocks", async (req, res) => {
    try {
      const apiKey = process.env.FINNHUB_API_KEY;
      
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Stock data not configured",
          fallback: true,
          quotes: SPACE_STOCKS.map(s => ({
            symbol: s.symbol,
            name: s.name,
            price: 0,
            change: 0,
            changePercent: 0
          }))
        });
      }

      // Check cache first
      if (stockCache && (Date.now() - stockCache.timestamp) < STOCK_CACHE_DURATION) {
        return res.json({ 
          quotes: stockCache.quotes, 
          cached: true,
          lastUpdated: new Date(stockCache.timestamp).toISOString()
        });
      }

      // Fetch quotes for all space stocks in parallel
      const quotePromises = SPACE_STOCKS.map(async (stock) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error(`Finnhub API returned ${response.status}`);
          }
          
          const data = await response.json();
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: data.c || 0, // Current price
            change: data.d || 0, // Change
            changePercent: data.dp || 0 // Change percent
          };
        } catch (err) {
          console.error(`Error fetching ${stock.symbol}:`, err);
          return {
            symbol: stock.symbol,
            name: stock.name,
            price: 0,
            change: 0,
            changePercent: 0
          };
        }
      });

      const quotes = await Promise.all(quotePromises);
      
      // Filter out failed quotes (price = 0)
      const validQuotes = quotes.filter(q => q.price > 0);
      
      // Cache the quotes
      if (validQuotes.length > 0) {
        stockCache = { quotes: validQuotes, timestamp: Date.now() };
      }

      res.json({ 
        quotes: validQuotes.length > 0 ? validQuotes : quotes,
        cached: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching stock quotes:", error);
      
      // Return cached data if available
      if (stockCache) {
        return res.json({ 
          quotes: stockCache.quotes,
          cached: true,
          stale: true,
          lastUpdated: new Date(stockCache.timestamp).toISOString()
        });
      }
      
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  app.post("/api/inquiry", async (req, res) => {
    try {
      const parsed = contactSchema.pick({ name: true, email: true, phone: true, payload: true }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Valid name and email are required", details: parsed.error.flatten() });
      }
      const { name, email, phone, payload } = parsed.data;
      console.log(`[INQUIRY] Name: ${name}, Email: ${email}, Payload: ${payload || 'N/A'}`);
      const { client, fromEmail } = await getUncachableResendClient();
      const result = await client.emails.send({
        from: fromEmail,
        to: "vlad@orbit2orbitexpress.com",
        replyTo: email,
        subject: `New Inquiry — ${name}`,
        html: `
          <h2>New Inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <p><strong>Payload / Message:</strong> ${escapeHtml(payload || "Not provided")}</p>
          <hr />
          <p style="color:#888;font-size:12px;">Sent via orbit2orbitexpress.com</p>
        `,
      });
      const emailId = assertEmailSent(result);
      console.log(`[INQUIRY] Email sent, id: ${emailId}`);
      res.json({ success: true, message: "Inquiry received" });
    } catch (error) {
      console.error("Inquiry error:", error);
      res.status(502).json({ error: "We could not deliver your inquiry. Please email vlad@orbit2orbitexpress.com directly." });
    }
  });

  app.post("/api/privacy-request", async (req, res) => {
    try {
      const parsed = z.object({
        email: z.string().trim().email().max(254),
        type: z.enum(["access", "deletion"]),
      }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "A valid email and request type are required", details: parsed.error.flatten() });
      }
      const { email, type } = parsed.data;
      console.log(`[PRIVACY REQUEST] Type: ${type}, Email: ${email}, Date: ${new Date().toISOString()}`);

      const { client, fromEmail } = await getUncachableResendClient();
      const result = await client.emails.send({
        from: fromEmail,
        to: "vlad@orbit2orbitexpress.com",
        replyTo: email,
        subject: `Privacy Request — ${type}`,
        html: `
          <h2>Privacy Request</h2>
          <p><strong>Request type:</strong> ${escapeHtml(type)}</p>
          <p><strong>Requester email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Received:</strong> ${new Date().toISOString()}</p>
        `,
      });
      assertEmailSent(result);
      res.json({ success: true, message: `Your ${type} request has been received. We will respond within 30 days.` });
    } catch (error) {
      console.error("Privacy request error:", error);
      res.status(502).json({ error: "We could not deliver your privacy request. Please email vlad@orbit2orbitexpress.com directly." });
    }
  });

  // sitemap.xml and robots.txt are served as static files from client/public

  app.post("/api/download-report", async (req, res) => {
    try {
      const parsed = z.object({ email: z.string().trim().email().max(254) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "A valid email is required", details: parsed.error.flatten() });
      }
      const { email } = parsed.data;
      const { client, fromEmail } = await getUncachableResendClient();
      const result = await client.emails.send({
        from: fromEmail,
        to: "vlad@orbit2orbitexpress.com",
        subject: "Report Download: 2026 Orbital Market Entry Report — Q2/Q3 Update",
        html: `
          <h2>New Report Download</h2>
          <p><strong>Report:</strong> 2026 Orbital Market Entry Report — Q2/Q3 Update (v5)</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Source:</strong> orbit2orbitexpress.com</p>
        `,
      });
      assertEmailSent(result);

      console.log(`[REPORT DOWNLOAD] Email: ${email}, Time: ${new Date().toISOString()}`);
      res.json({ success: true, downloadUrl: "/2026-Orbital-Market-Entry-Report-Q2Q3-v5.pdf" });
    } catch (error) {
      console.error("Report download error:", error);
      res.status(502).json({ error: "We could not deliver your report request. Please email vlad@orbit2orbitexpress.com directly." });
    }
  });

  app.post("/api/lead-capture", async (req, res) => {
    try {
      const parsed = contactSchema.pick({ name: true, email: true, phone: true, message: true, source: true, context: true }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Valid name and email are required", details: parsed.error.flatten() });
      }
      const { name, email, phone, message, source, context } = parsed.data;

      console.log(`[LEAD CAPTURE] Name: ${name}, Email: ${email}, Source: ${source || 'unknown'}, Context: ${context || 'N/A'}, Message: ${message || 'N/A'}`);

      const { client, fromEmail } = await getUncachableResendClient();
      const result = await client.emails.send({
        from: fromEmail,
        to: "vlad@orbit2orbitexpress.com",
        replyTo: email,
        subject: `New Lead: ${name} — ${source || 'Website'}`,
        html: `
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
          <p><strong>Source:</strong> ${escapeHtml(source || "Website")}</p>
          ${context ? `<p><strong>Context:</strong> ${escapeHtml(context)}</p>` : ''}
          ${message ? `<p><strong>Message:</strong> ${escapeHtml(message)}</p>` : ''}
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      });
      assertEmailSent(result);

      res.json({ success: true, message: "Thank you! We'll be in touch." });
    } catch (error) {
      console.error("Lead capture error:", error);
      res.status(502).json({ error: "We could not deliver your request. Please email vlad@orbit2orbitexpress.com directly." });
    }
  });

  app.post("/api/track", (req, res) => {
    const { path, referrer } = req.body;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Path required" });
    }
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const result = trackPageView({ path, referrer: referrer || "", ip, userAgent });
    res.json(result);
  });

  app.get("/api/analytics", (_req, res) => {
    res.json(getAnalyticsStats());
  });

  app.get("/api/analytics/machine-access", (_req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(getMachineAccessReport());
  });

  app.post("/api/analytics/send-now", async (_req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "Not found" });
    }
    try {
      await sendDailyAnalyticsEmail();
      res.json({ success: true, message: "Analytics email sent" });
    } catch (err) {
      res.status(500).json({ error: "Failed to send analytics email" });
    }
  });

  app.post("/api/mission-intake", async (req, res) => {
    try {
      const parsed = insertMissionIntakeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid intake data", details: parsed.error.flatten() });
      }
      const intake = parsed.data;

      // Save to in-memory storage
      const saved = await storage.saveMissionIntake(intake);

      // Send Resend notification
      try {
        const { client, fromEmail } = await getUncachableResendClient();
        const challengesList = intake.challenges.length > 0
          ? intake.challenges.map(c => `• ${c}`).join("\n")
          : "None specified";
        const list = (items: string[]) => items.length > 0 ? items.map(item => `• ${item}`).join("\n") : "None specified";
        const massNote = intake.payloadMass ? ` — ${intake.payloadMass}kg` : "";
        const result = await client.emails.send({
          from: fromEmail,
          to: "vlad@orbit2orbitexpress.com",
          replyTo: intake.email,
          subject: `New O2O Mission Brief — ${intake.organization || "Independent"} — ${intake.payloadType}`,
          text: `CONTACT
Name: ${intake.name}
EMAIL: ${intake.email}
PHONE: ${intake.phone}
Organization: ${intake.organization || "Not provided"}
Website: ${intake.website || "Not provided"}

MISSION OBJECTIVE
What they are trying to accomplish:
${intake.missionObjective || "Not provided"}

Mission success:
${intake.missionSuccess || "Not provided"}

PAYLOAD
Type: ${intake.payloadType}${massNote}
Dimensions: ${intake.payloadDimensions || "Not provided"}
Configuration / form factor: ${intake.formFactor || "Not provided"}
Maturity: ${intake.missionMaturity || "Not provided"}
Spacecraft / bus: ${intake.spacecraftStatus || "Not provided"}

DESTINATION / ORBIT
Destination: ${intake.destination}
Desired altitude: ${intake.desiredAltitude || "Not provided"}
Desired inclination: ${intake.desiredInclination || "Not provided"}

TIMING
General target: ${intake.timeline}
Earliest flight date: ${intake.earliestFlightDate || "Not provided"}
Latest useful date: ${intake.latestFlightDate || "Not provided"}
Flexibility: ${intake.timingFlexible || "Not provided"}

TECHNICAL REQUIREMENTS
${list(intake.technicalRequirements)}

REGULATORY / SPECIAL HANDLING
Special handling:
${list(intake.specialHandling)}

Regulatory status:
${list(intake.regulatoryStatus)}

FUNDING
${intake.budgetRange || "Prefer to discuss / not provided"}

CURRENT CHALLENGES
${challengesList}

BIGGEST QUESTION
${intake.biggestQuestion || "Not provided"}

ADDITIONAL NOTES
${intake.additionalContext || "None provided"}

---
Submitted via orbit2orbitexpress.com Mission Intake`,
        });
        assertEmailSent(result);
      } catch (emailErr) {
        console.error("[MISSION INTAKE] Email notification failed:", emailErr);
        return res.status(502).json({
          error: "Your brief was saved, but the email notification failed. Please email vlad@orbit2orbitexpress.com directly.",
          id: saved.id,
        });
      }

      // Append to Google Sheets CRM (non-blocking — failure doesn't affect user response)
      appendIntakeToSheet({ ...intake, id: saved.id }).catch((err) =>
        console.error("[SHEETS] Failed to log intake:", err)
      );

      res.json({ success: true, id: saved.id });
    } catch (error) {
      console.error("Mission intake error:", error);
      res.status(500).json({ error: "Failed to process mission intake" });
    }
  });

  // API endpoint to get Orbital Economics / Substack feed
  app.get("/api/substack-feed", async (req, res) => {
    try {
      const now = Date.now();
      if (substackCache && now - substackCache.timestamp < SUBSTACK_CACHE_DURATION) {
        return res.json({ articles: substackCache.articles, cached: true });
      }
      const feed = await rssParser.parseURL("https://orbitaleconomics.substack.com/feed");
      const articles = (feed.items || []).slice(0, 12).map((item: any) => ({
        title: item.title || "",
        url: item.link || "",
        date: item.isoDate || item.pubDate || "",
        summary: (item.contentSnippet || item["content:encodedSnippet"] || "").substring(0, 300),
        categories: item.categories || [],
      }));
      substackCache = { articles, timestamp: now };
      res.json({ articles, cached: false });
    } catch (err) {
      console.error("Substack feed error:", err);
      if (substackCache) {
        return res.json({ articles: substackCache.articles, cached: true, stale: true });
      }
      res.status(500).json({ error: "Failed to fetch Substack feed" });
    }
  });

  app.post("/api/campaign-lead", async (req, res) => {
    const parsed = z.object({
      email: z.string().trim().email().max(254),
      launchWindow: z.string().trim().max(200).optional(),
      campaignSummary: z.string().trim().max(1000).optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "A valid email is required", details: parsed.error.flatten() });
    }
    const { email, launchWindow, campaignSummary } = parsed.data;
    try {
      const { client, fromEmail } = await getUncachableResendClient();
      const result = await client.emails.send({
        from: fromEmail,
        to: "vlad@orbit2orbitexpress.com",
        replyTo: email,
        subject: `Campaign Lead — ${email}`,
        html: `<p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Launch Window:</strong> ${escapeHtml(launchWindow || "Not specified")}</p><p><strong>Campaign:</strong> ${escapeHtml(campaignSummary || "N/A")}</p>`,
      });
      assertEmailSent(result);
      res.json({ ok: true });
    } catch (err) {
      console.error("[LEAD] Failed to send campaign lead email:", err);
      res.status(500).json({ error: "Failed to send" });
    }
  });

  app.get("/api/download/source", (req, res) => {
    const zipPath = path.resolve("./public/orbit2orbitexpress.zip");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="orbit2orbitexpress.zip"');
    res.sendFile(zipPath);
  });

  scheduleDailyEmail();

  const httpServer = createServer(app);
  return httpServer;
}
