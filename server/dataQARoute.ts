import type { Express } from "express";
import { runDataQA } from "./dataQA";

export function registerDataQARoute(app: Express): void {
  // The report remains a 200 response when checks fail so it can be reviewed
  // directly in a browser; the CLI exits non-zero for deployment gates.
  app.get(["/api/admin/data-qa", "/api/data-qa"], async (_req, res) => {
    try {
      const report = await runDataQA();
      res.json(report);
    } catch (error) {
      console.error("Launcher data QA error:", error);
      res.status(500).json({ error: "Unable to run launcher data quality checks" });
    }
  });
}