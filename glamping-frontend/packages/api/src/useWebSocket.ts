import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "";
const RECONNECT_DEBOUNCE_MS = 500;

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
  auth?: Record<string, unknown>;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, onConnect, onDisconnect, autoConnect = true, auth } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const prevAuthRef = useRef<string>("");
  const lastConnectRef = useRef<number>(0);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  onMessageRef.current = onMessage;
  onConnectRef.current = onConnect;
  onDisconnectRef.current = onDisconnect;

  const doConnect = useCallback(() => {
    const authKey = JSON.stringify(auth || {});
    if (socketRef.current?.connected && prevAuthRef.current === authKey) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    prevAuthRef.current = authKey;
    lastConnectRef.current = Date.now();
    try {
      const socket = io(WS_URL || undefined, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: auth || {},
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
        onConnectRef.current?.();
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        onDisconnectRef.current?.();
      });

      socket.on("connect_error", () => {
        setIsConnected(false);
      });

      socket.onAny((event: string, data: unknown) => {
        onMessageRef.current?.({ type: event, payload: data, timestamp: new Date().toISOString() });
      });

      socket.connect();
    } catch {
      console.error("Failed to create Socket.IO connection");
    }
  }, [auth]);

  const connect = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastConnectRef.current;
    if (elapsed < RECONNECT_DEBOUNCE_MS) {
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
      connectTimerRef.current = setTimeout(doConnect, RECONNECT_DEBOUNCE_MS - elapsed);
      return;
    }
    doConnect();
  }, [doConnect]);

  const disconnect = useCallback(() => {
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
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
