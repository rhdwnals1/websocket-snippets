# 🔌 WebSocket Playground

React + TypeScript로 구현한 실시간 웹소켓 통신 및 센서 데이터 스트리밍 프로젝트입니다.

## ✨ 주요 기능

- **🌐 웹소켓 연결 관리**: 자동 재연결, 연결 상태 모니터링
- **📡 실시간 센서 데이터**: 온도, 습도, 압력 데이터 스트리밍
- **🔄 안정적인 연결**: 무한 루프 방지, 에러 핸들링
- **📱 실시간 UI**: 연결 상태 및 데이터 실시간 업데이트
- **🧪 테스트 데이터**: 개발용 모의 센서 데이터 생성

## 🏗️ 프로젝트 구조

```
src/
├── model/                  # 📁 타입 모델 관리
│   ├── websocket.ts       # 웹소켓 관련 인터페이스
│   └── sensor.ts          # 센서 관련 인터페이스
├── hooks/                 # 🎣 커스텀 훅
│   ├── useWebSocket.ts    # 웹소켓 연결 관리 훅
│   └── useSensorStream.ts # 센서 데이터 스트림 훅
├── components/            # 🧩 React 컴포넌트
│   └── SensorPanel.tsx    # 센서 패널 UI
└── App.tsx               # 🏠 메인 애플리케이션
```

## 🚀 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 테스트 서버 연결

프로젝트는 기본적으로 `wss://echo.websocket.org`에 연결됩니다.
다른 웹소켓 서버를 테스트하려면 `App.tsx`의 `wsUrl`을 변경하세요.

## 📖 주요 컴포넌트 가이드

### 🔌 useWebSocket 훅

웹소켓 연결을 관리하는 핵심 훅입니다.

```typescript
const ws = useWebSocket({
  url: "wss://your-server.com",
  reconnectInterval: 5000, // 재연결 간격 (ms)
  maxReconnectAttempts: 3, // 최대 재연결 시도 횟수
});

// 연결 상태 확인
console.log(ws.connectionState.isConnected);

// 메시지 전송
ws.sendJSON({ type: "ping", data: "hello" });
```

### 📡 useSensorStream 훅

센서 데이터 스트리밍을 위한 특화된 훅입니다.

```typescript
const { connectionState, data, sendCommand } = useSensorStream(
  "wss://sensor-server.com/ws",
  "jwt-token", // 인증 토큰 (선택사항)
  ["device1", "device2"], // 구독할 디바이스 ID 목록
  { subscribeExtra: { v: 1 } } // 추가 구독 옵션
);

// 센서 데이터 접근
console.log(data.device1.temp); // 온도
console.log(data.device1.hum); // 습도

// 디바이스 명령 전송
sendCommand("device1", "pump.on", { level: 3 });
```

### 🎛️ SensorPanel 컴포넌트

센서 데이터를 시각화하는 UI 컴포넌트입니다.

```typescript
<SensorPanel
  wsUrl="wss://your-server.com/ws"
  token={authToken}
  deviceIds={["sensor1", "sensor2"]}
/>
```

## 🎨 타입 시스템

### 웹소켓 모델 (`model/websocket.ts`)

```typescript
interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: number | null;
}

interface WebSocketHookOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}
```

### 센서 모델 (`model/sensor.ts`)

```typescript
interface SensorSnapshot {
  ts: number; // 타임스탬프
  temp?: number; // 온도
  hum?: number; // 습도
  pressure?: number; // 압력
}

type SensorMap = Record<string, SensorSnapshot>;
```

## 🔧 개발 가이드

### 실제 센서 서버 연결

1. `App.tsx`에서 `wsUrl` 변경
2. 필요시 인증 토큰 설정
3. `useSensorStream.ts`의 테스트 데이터 생성 부분 제거

### 커스터마이징

- **재연결 설정**: `useWebSocket` 옵션 조정
- **데이터 형식**: `model/sensor.ts`의 인터페이스 수정
- **UI 스타일**: `SensorPanel.tsx` 커스터마이징

### 에러 해결

- **Maximum update depth exceeded**: 무한 루프 방지 로직 구현됨
- **연결 실패**: 네트워크 상태 및 서버 URL 확인
- **데이터 수신 안됨**: 구독 메시지 형식 확인

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **WebSocket**: Native WebSocket API
- **State Management**: React Hooks
- **Type System**: TypeScript Interface 기반

## 📝 라이선스

이 프로젝트는 개발 학습용으로 제작되었습니다.

---
