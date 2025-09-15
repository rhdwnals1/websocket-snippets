import { useEffect, useRef, useState } from "react";
import type {
  WebSocketConnectionState,
  WebSocketHookOptions,
} from "../model/websocket";

export const useWebSocket = (options: WebSocketHookOptions) => {
  const { url, reconnectInterval = 5000, maxReconnectAttempts = 3 } = options;

  const [connectionState, setConnectionState] =
    useState<WebSocketConnectionState>({
      isConnected: false,
      isConnecting: false,
      error: null,
      lastConnected: null,
    });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
          lastConnected: Date.now(),
        });
        reconnectAttemptsRef.current = 0;
      };

      // TODO: 추가 옵션
      // ws.onMessage = (ev) => {
      //   onMessage?.(ev);
      // }

      ws.onclose = () => {
        setConnectionState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = () => {
        setConnectionState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "웹소켓 연결 오류",
        }));
      };
    } catch {
      setConnectionState((prev) => ({
        ...prev,
        isConnecting: false,
        error: "웹소켓 생성 실패",
      }));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts;
  };

  const sendJSON = (data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connectionState,
    connect,
    disconnect,
    sendJSON,
  };
};
