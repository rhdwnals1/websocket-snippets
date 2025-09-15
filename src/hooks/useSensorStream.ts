import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "./useWebSocket";
import type { SensorMap, SensorStreamOptions } from "../model/sensor";

export function useSensorStream(
  baseWsUrl: string, // 예: "wss://your.domain.com/ws"
  token: string | null, // JWT (쿼리스트링 ?token=... 로 붙일 예정)
  deviceIds: string[], // 구독 대상 디바이스 IDs
  opts: SensorStreamOptions = {}
) {
  const { subscribeExtra } = opts;

  // 최종 접속 URL 구성
  const url = useMemo(() => {
    if (!token) return baseWsUrl;
    const u = new URL(baseWsUrl);
    u.searchParams.set("token", token);
    return u.toString();
  }, [baseWsUrl, token]);

  const [data, setData] = useState<SensorMap>({});

  const ws = useWebSocket({
    url: url,
    maxReconnectAttempts: 3, // 3번만 재시도 (-1은 무한재시도)
    reconnectInterval: 2000, // 2초마다 재시도
    // TODO: 추가 옵션
    // onMessage: (e) => {                      // ✅ 실데이터 수신 처리
    //   let payload: any = e.data;
    //   if (payload instanceof ArrayBuffer) return; // 필요시 바이너리 파싱
    //   try { payload = JSON.parse(String(payload)); } catch {}

    //   // 백엔드가 아래 형태로 준다고 가정:
    //   // { type:"sensor", deviceId:"...", ts:..., payload:{ temp:..., hum:... } }
    //   if (payload?.type === "sensor" && payload.deviceId) {
    //     setData(prev => ({
    //       ...prev,
    //       [payload.deviceId]: { ts: payload.ts ?? Date.now(), ...(payload.payload ?? {}) }
    //     }));
    //   }
    // },
  });

  // 연결 상태가 변경될 때 구독 메시지 전송
  useEffect(() => {
    if (ws.connectionState.isConnected) {
      ws.sendJSON({
        type: "subscribe",
        topics: deviceIds.map((id) => `sensor:${id}`),
        ...(subscribeExtra ?? {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws.connectionState.isConnected]);

  // 웹소켓 자동 연결
  useEffect(() => {
    if (url) {
      // 1초 후에 연결 시도 (컴포넌트 마운트 후)
      const timer = setTimeout(() => {
        ws.connect();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테스트용 센서 데이터 생성 (웹소켓 연결과 무관하게 생성)
  // TODO: 실데이터 연결 시 삭제 필요
  useEffect(() => {
    const interval = setInterval(() => {
      // 테스트용 센서 데이터를 직접 data에 업데이트
      setData((prev) => {
        const newData = { ...prev };
        deviceIds.forEach((deviceId) => {
          newData[deviceId] = {
            ts: Date.now(),
            temp: Math.round((Math.random() * 30 + 10) * 10) / 10, // 10-40도
            hum: Math.round((Math.random() * 50 + 30) * 10) / 10, // 30-80%
            pressure: Math.round((Math.random() * 200 + 900) * 10) / 10, // 900-1100hPa
          };
        });
        return newData;
      });
    }, 20000); // 20초마다 데이터 생성

    return () => {
      clearInterval(interval);
    };
  }, [deviceIds]);

  return {
    connectionState: {
      isConnected: ws.connectionState.isConnected,
      isConnecting: ws.connectionState.isConnecting,
      error: ws.connectionState.error,
      lastConnected: ws.connectionState.lastConnected,
    },
    data, // 가공된 최신 센서 맵
    clear: () => setData({}),
    sendCommand: (deviceId: string, cmd: string, args?: unknown) => {
      // 서버가 cmd를 처리해서 결과를 별도 메시지로 push한다고 가정
      ws.sendJSON({ type: "cmd", deviceId, cmd, args });
    },
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
  };
}
