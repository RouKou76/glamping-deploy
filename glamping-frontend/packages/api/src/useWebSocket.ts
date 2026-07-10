import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "";

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, onConnect, onDisconnect, autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    try {
      const socket = io(WS_URL || undefined, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        onConnect?.();
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        onDisconnect?.();
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });

      socket.onAny((event: string, data: unknown) => {
        onMessage?.({ type: event, payload: data, timestamp: new Date().toISOString() });
      });

      socket.connect();
    } catch {
      console.error("Failed to create Socket.IO connection");
    }
  }, [onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, payload: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, { payload, timestamp: new Date().toISOString() });
    }
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => { disconnect(); };
  }, [autoConnect, connect, disconnect]);

  return { isConnected, connect, disconnect, send };
}
