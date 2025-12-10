import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Create basic Express app - safe for vite dev server
export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Game API routes (stub for development)
  app.post("/api/room/create", (req, res) => {
    const { gameType } = req.body;
    // Generate a simple room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ roomCode });
  });

  app.get("/api/room/:roomCode", (req, res) => {
    res.json({
      roomCode: req.params.roomCode,
      gameType: "mindmaze",
      playerCount: 0,
      maxPlayers: 4,
      isFull: false,
    });
  });

  return app;
}
