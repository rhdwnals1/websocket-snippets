import type { WebSocketConnectionState } from "./websocket";

/* ------------------------ 센서 스냅샷 ------------------------ */
export interface SensorSnapshot {
  ts: number;
  temp?: number;
  hum?: number;
  pressure?: number;
}

/* ------------------------ 센서 맵 ------------------------ */
export type SensorMap = Record<string, SensorSnapshot>;

/* ------------------------ 센서 스트림 옵션 ------------------------ */
export interface SensorStreamOptions {
  subscribeExtra?: Record<string, unknown>;
}

/* ------------------------ 센서 스트림 반환값 ------------------------ */
export interface SensorStreamReturn {
  connectionState: WebSocketConnectionState;
  data: SensorMap;
  clear: () => void;
  sendCommand: (deviceId: string, cmd: string, args?: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

/* ------------------------ 센서 명령 요청 ------------------------ */
export interface SensorCommandRequest {
  type: string;
  deviceId: string;
  cmd: string;
  args?: unknown;
}

/* ------------------------ 센서 구독 요청 ------------------------ */
export interface SensorSubscribeRequest {
  type: string;
  topics: string[];
  v?: number;
}
