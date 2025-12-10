import path from "path";
import { createProductionServer } from "./production";
import express from "express";

async function start() {
  const { httpServer } = await createProductionServer();
  const port = process.env.PORT || 3000;

  // In production, serve the built SPA files
  const __dirname = import.meta.dirname;
  const distPath = path.join(__dirname, "../spa");

  // Note: Express middleware is already set up in createExpressServer()
  // Just need to serve static files and handle catch-all for React Router
  const app = httpServer as any;

  app.use(express.static(distPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req: any, res: any) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    res.sendFile(path.join(distPath, "index.html"));
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Multi-Game Server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
    console.log(`🎮 WebSocket: ws://localhost:${port}/ws`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    httpServer.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("🛑 Received SIGINT, shutting down gracefully");
    httpServer.close(() => {
      process.exit(0);
    });
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
