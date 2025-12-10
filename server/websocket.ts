import { WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";

export type GameType = "mindmaze" | "brainrush" | "crazydraws";

export interface GameRoom {
  roomCode: string;
  gameType: GameType;
  players: Map<string, PlayerInRoom>;
  maxPlayers: number;
  gameState: any;
  createdAt: number;
}

export interface PlayerInRoom {
  id: string;
  username: string;
  socket: WebSocket;
  ready: boolean;
  role?: string;
  score: number;
}

export interface WebSocketMessage {
  type: string;
  roomCode: string;
  playerId: string;
  data: any;
  timestamp?: number;
}

export class GameRoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private wss: WebSocketServer;

  constructor(httpServer: HTTPServer) {
    this.wss = new WebSocketServer({ noServer: true });
  }

  generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(
    gameType: GameType,
    maxPlayers: number
  ): { roomCode: string; room: GameRoom } {
    const roomCode = this.generateRoomCode();
    const room: GameRoom = {
      roomCode,
      gameType,
      players: new Map(),
      maxPlayers,
      gameState: {},
      createdAt: Date.now(),
    };
    this.rooms.set(roomCode, room);
    return { roomCode, room };
  }

  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  addPlayerToRoom(
    roomCode: string,
    playerId: string,
    username: string,
    socket: WebSocket
  ): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    if (room.players.size >= room.maxPlayers) return false;

    const player: PlayerInRoom = {
      id: playerId,
      username,
      socket,
      ready: false,
      score: 0,
    };

    room.players.set(playerId, player);
    this.playerToRoom.set(playerId, roomCode);
    return true;
  }

  removePlayerFromRoom(playerId: string): void {
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (room) {
      room.players.delete(playerId);

      if (room.players.size === 0) {
        this.rooms.delete(roomCode);
      }
    }

    this.playerToRoom.delete(playerId);
  }

  broadcastToRoom(roomCode: string, message: any, excludePlayerId?: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.players.forEach((player) => {
      if (excludePlayerId && player.id === excludePlayerId) return;
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(messageStr);
      }
    });
  }

  getRoomCode(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

  getPlayerCount(roomCode: string): number {
    const room = this.rooms.get(roomCode);
    return room ? room.players.size : 0;
  }

  updateGameState(roomCode: string, state: any): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.gameState = { ...room.gameState, ...state };
    }
  }
}

export function setupWebSocket(httpServer: HTTPServer): GameRoomManager {
  const manager = new GameRoomManager(httpServer);
  return manager;
}
