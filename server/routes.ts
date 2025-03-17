import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check endpoint
  app.get('/health', (_, res) => res.json({ status: 'ok' }));

  const httpServer = createServer(app);
  return httpServer;
}