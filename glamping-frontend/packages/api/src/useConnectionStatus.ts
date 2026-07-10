import { useState, useEffect, useCallback } from "react";

interface ConnectionStatusOptions {
  checkInterval?: number;
  endpoint?: string;
}

export function useConnectionStatus(options: ConnectionStatusOptions = {}) {
  const { checkInterval = 30000, endpoint = "/health" } = options;
  const [isConnected, setIsConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = useCallback(async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "HEAD", signal: AbortSignal.timeout(5000) });
      setIsConnected(response.ok);
    } catch { setIsConnected(false); }
    setLastChecked(new Date());
  }, [endpoint]);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, checkInterval);
    return () => clearInterval(interval);
  }, [checkConnection, checkInterval]);

  return { isConnected, lastChecked, checkConnection };
}
