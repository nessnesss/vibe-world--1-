import { useEffect, useRef, useCallback, useState } from "react";
import { WebSocketMessage } from "@/types/game";

interface UseGameWebSocketProps {
  roomCode: string;
  playerId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export function useGameWebSocket({
  roomCode,
  playerId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseGameWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Determine WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log("Attempting to connect to WebSocket at:", wsUrl);

    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    let connectionTimeout: NodeJS.Timeout;
    let isConnecting = true;

    // Set a timeout for connection attempts
    connectionTimeout = setTimeout(() => {
      if (isConnecting && ws.readyState !== WebSocket.OPEN) {
        console.warn("WebSocket connection timeout after 5 seconds");
        const errorMsg =
          "Connection timeout. WebSocket server may not be available.";
        setConnectionError(errorMsg);
        if (onError) onError(errorMsg);
        ws.close();
      }
    }, 5000);

    ws.onopen = () => {
      isConnecting = false;
      clearTimeout(connectionTimeout);
      console.log("WebSocket connected");
      setIsConnected(true);
      setConnectionError(null);
      if (onConnect) onConnect();

      // Attempt to join room
      ws.send(
        JSON.stringify({
          type: "join-room",
          roomCode,
          playerId,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log("Received message:", message);

        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      isConnecting = false;
      clearTimeout(connectionTimeout);
      console.error("WebSocket error:", error);
      const errorMsg = "WebSocket connection error";
      setConnectionError(errorMsg);
      if (onError) onError(errorMsg);
    };

    ws.onclose = () => {
      isConnecting = false;
      clearTimeout(connectionTimeout);
      console.log("WebSocket disconnected");
      setIsConnected(false);
      if (onDisconnect) onDisconnect();
    };

    wsRef.current = ws;

    return () => {
      isConnecting = false;
      clearTimeout(connectionTimeout);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomCode, playerId, onMessage, onConnect, onDisconnect, onError]);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, "roomCode" | "playerId" | "timestamp">) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          ...message,
          roomCode,
          playerId,
          timestamp: Date.now(),
        })
      );
    } else {
      console.warn("WebSocket is not connected");
    }
  }, [roomCode, playerId]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    ws: wsRef.current,
  };
}
