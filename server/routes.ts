import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeSite } from "./scan";
import { insertScanSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/scan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const parsed = insertScanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    try {
      const results = await analyzeSite(parsed.data.url);
      const scan = await storage.createScan(req.user!.id, parsed.data, results);
      res.json(scan);
    } catch (error) {
      res.status(400).json({ error: "Invalid URL or analysis failed" });
    }
  });

  app.get("/api/scans", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const scans = await storage.getUserScans(req.user!.id);
    res.json(scans);
  });

  app.get("/api/scans/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const scan = await storage.getScan(Number(req.params.id));
    if (!scan || scan.userId !== req.user!.id) {
      return res.sendStatus(404);
    }

    res.json(scan);
  });

  app.get("/api/scans/url/:url", async (req, res) => {
    const url = decodeURIComponent(req.params.url);
    const scan = await storage.getLatestScanByUrl(url);

    if (!scan) {
      return res.sendStatus(404);
    }

    res.json(scan);
  });

  const httpServer = createServer(app);
  return httpServer;
}