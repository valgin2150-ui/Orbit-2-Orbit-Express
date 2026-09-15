import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { botProtectionMiddleware } from "./botProtection";
import path from "path";

const app = express();

// Replit deployments run behind one trusted reverse proxy. This makes req.ip
// resolve to the original client address from X-Forwarded-For.
app.set("trust proxy", 1);

// Reject hostile automation before body parsers allocate work.
app.use(botProtectionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Redirect non-www to www
app.use((req, res, next) => {
  const host = req.headers.host || '';
  if (host === 'orbit2orbitexpress.com') {
    return res.redirect(301, `https://www.orbit2orbitexpress.com${req.originalUrl}`);
  }
  next();
});

app.use('/data', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  next();
});

app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  next();
});

app.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const publicRoot = process.env.NODE_ENV === "production" ? "dist/public" : "client/public";
  res.sendFile(path.resolve(process.cwd(), publicRoot, "llms.txt"));
});

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const publicRoot = process.env.NODE_ENV === "production" ? "dist/public" : "client/public";
  res.sendFile(path.resolve(process.cwd(), publicRoot, "robots.txt"));
});

app.get('/orbit2orbitexpress.zip', (req, res) => {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="orbit2orbitexpress.zip"');
  res.sendFile('orbit2orbitexpress.zip', { root: './public' });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
