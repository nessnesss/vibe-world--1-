import { createServer as createHttpServer } from "http";
import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { createServer as createExpressServer } from "./index";
import { setupWebSocket } from "./websocket";

export async function createProductionServer() {
  const app = createExpressServer();
  const httpServer = createHttpServer(app);
  const manager = setupWebSocket(httpServer);

  // Store manager on app for route access if needed
  (app as any).gameManager = manager;

  // WebSocket upgrade handler
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    const pathname = request.url;

    if (pathname?.startsWith("/ws")) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws, request: any) => {
    const playerId = randomUUID();
    let currentRoomCode: string | undefined;

    ws.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "join-room") {
          const { roomCode, username } = message;
          const room = manager.getRoom(roomCode);

          if (
            room &&
            manager.addPlayerToRoom(roomCode, playerId, username, ws)
          ) {
            currentRoomCode = roomCode;
            manager.broadcastToRoom(roomCode, {
              type: "player-joined",
              playerCount: manager.getPlayerCount(roomCode),
              players: Array.from(room.players.values()).map((p) => ({
                id: p.id,
                username: p.username,
              })),
            });

            ws.send(
              JSON.stringify({
                type: "join-success",
                playerId,
                roomCode,
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "join-error",
                message: "Cannot join room",
              })
            );
          }
        } else if (message.type === "game-message") {
          if (currentRoomCode) {
            manager.broadcastToRoom(currentRoomCode, message);
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (currentRoomCode) {
        const room = manager.getRoom(currentRoomCode);
        manager.removePlayerFromRoom(playerId);

        if (room && room.players.size > 0) {
          manager.broadcastToRoom(currentRoomCode, {
            type: "player-left",
            playerCount: manager.getPlayerCount(currentRoomCode),
          });
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return { app, httpServer, manager, wss };
}
