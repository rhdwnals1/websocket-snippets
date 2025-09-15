/* ------------------------ 웹소켓 메시지 ------------------------ */
export interface WebSocketMessage {
  id: string;
  type: "message" | "system" | "error";
  content: string;
  timestamp: number;
  sender?: string;
}

/* ------------------------ 웹소켓 연결 상태 ------------------------ */
export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: number | null;
}

/* ------------------------ 웹소켓 훅 옵션 ------------------------ */
export interface WebSocketHookOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/* ------------------------ 웹소켓 훅 반환값 ------------------------ */
export interface WebSocketHookReturn {
  connectionState: WebSocketConnectionState;
  connect: () => void;
  disconnect: () => void;
  sendJSON: (data: Record<string, unknown>) => void;
}
