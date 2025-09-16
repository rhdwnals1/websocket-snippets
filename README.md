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

### 환경 설정

`.env` 파일을 생성하고 웹소켓 URL을 설정하세요:

```bash
# .env
VITE_WS_URL=wss://your-websocket-server.com/ws
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 테스트 서버 연결

프로젝트는 환경변수 `VITE_WS_URL`을 사용합니다.
테스트용으로는 `wss://echo.websocket.org`를 사용할 수 있습니다.

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

## 📡 WebSocket 프로토콜 명세

### 🔄 메시지 타입

#### 1. 초기 스냅샷 (HTTP) - 필수

화면을 즉시 채우기 위한 최신 상태 데이터

```http
GET /api/sensors?ids=device-1,device-2
```

```json
{
  "serverTs": 1757917700000,
  "items": [
    {
      "deviceId": "device-1",
      "ts": 1757917600000,
      "payload": { "temp": 23.1, "hum": 58 }
    },
    {
      "deviceId": "device-2",
      "ts": 1757917610000,
      "payload": { "temp": 24.8, "hum": 52 }
    }
  ]
}
```

#### 2. 구독/해지 (WebSocket) - 필수

```json
// 구독
{
  "type": "subscribe",
  "v": 1,
  "topics": ["sensor:device-1", "sensor:device-2"]
}

// 해지
{
  "type": "unsubscribe",
  "v": 1,
  "topics": ["sensor:device-2"]
}

// 서버 응답 (권장)
{
  "type": "subAck",
  "v": 1,
  "topics": ["sensor:device-1", "sensor:device-2"]
}
```

#### 3. 실시간 푸시 (WebSocket) - 필수

```json
// 단일 이벤트
{
  "type": "sensor",
  "v": 1,
  "topic": "sensor:device-1",
  "deviceId": "device-1",
  "ts": 1757917733164,
  "payload": {"temp": 24.3, "hum": 55.1}
}

// 배치 이벤트 (옵션)
{
  "type": "sensorBatch",
  "v": 1,
  "events": [
    {
      "deviceId": "device-1",
      "ts": 1757917733164,
      "payload": {"temp": 24.3, "hum": 55.1}
    },
    {
      "deviceId": "device-2",
      "ts": 1757917734200,
      "payload": {"temp": 25.0, "hum": 54.8}
    }
  ]
}
```

#### 4. 명령 RPC (WebSocket) - 필수

```json
// 클라이언트 → 서버
{
  "type": "cmd",
  "v": 1,
  "id": "req_123",
  "deviceId": "device-1",
  "cmd": "pump.on",
  "args": {"level": 3}
}

// 서버 → 클라이언트 (성공)
{
  "type": "cmdResult",
  "v": 1,
  "id": "req_123",
  "ok": true,
  "result": {"accepted": true, "ts": 1757917734000}
}

// 서버 → 클라이언트 (실패)
{
  "type": "cmdResult",
  "v": 1,
  "id": "req_123",
  "ok": false,
  "errorCode": "DEVICE_BUSY",
  "error": "Pump busy"
}
```

#### 5. 초기 환영 (WebSocket) - 권장

```json
{
  "type": "hello",
  "srvTs": 1757917700000,
  "v": 1
}
```

#### 6. 하트비트 (WebSocket) - 필수

```json
// 클라이언트 → 서버 (20초마다)
{
  "type": "ping",
  "ts": 1757917752869,
  "v": 1
}

// 서버 → 클라이언트 (즉시)
{
  "type": "pong",
  "ts": 1757917752869,
  "srvTs": 1757917752892,
  "v": 1
}
```

### 🔌 WebSocket Close Code

| Code   | 설명                                                |
| ------ | --------------------------------------------------- |
| `1000` | 정상 종료 (normal closure)                          |
| `1008` | 정책 위반 (policy violation; 권한 실패/금지된 토픽) |
| `1011` | 서버 내부 오류 (server error; 재시도 가능)          |
| `1001` | 떠남/유휴 타임아웃 (going away)                     |

### 🎯 프론트엔드 구현 가이드

#### 연결 시 자동 재구독

```typescript
// useSensorStream에서 구현됨
if (ws.connectionState.isConnected) {
  ws.sendJSON({
    type: "subscribe",
    topics: deviceIds.map((id) => `sensor:${id}`),
    v: 1,
  });
}
```

#### 구독 변경 처리

```typescript
// 1. 기존 구독 해지
ws.sendJSON({
  type: "unsubscribe",
  topics: oldDeviceIds.map((id) => `sensor:${id}`),
  v: 1,
});

// 2. 새 구독 등록
ws.sendJSON({
  type: "subscribe",
  topics: newDeviceIds.map((id) => `sensor:${id}`),
  v: 1,
});
```

## 🧪 테스트 체크리스트

### ✅ 프론트엔드 수용 테스트

- [ ] `hello` 수신 후 `subscribe` 재전송 시 정상 `subAck`
- [ ] `sensor` 푸시 수신 → UI 업데이트
- [ ] `cmd` 전송 → `cmdResult`(id 매칭) 수신
- [ ] 20초 ping에 즉시 pong 수신 (3회 연속 실패 시 재연결)
- [ ] 권한 에러 시 error + close(1008) 확인
- [ ] 재연결 후 자동 재구독 & 데이터 재개
- [ ] (옵션) fromTs로 갭 복구 동작

### 📦 백엔드 요구사항

- [ ] WS URL (스테이징/프로덕션)
- [ ] JWT 발급 방법 (로그인 API/테스트 토큰)
- [ ] 메시지 스키마 문서
- [ ] 테스트 스크립트/샘플
- [ ] Close code/에러 코드 표
- [ ] 리플레이 지원 여부 및 보존 기간
- [ ] 레이트리밋/사이즈 제한 수치
- [ ] Origin 허용 도메인 (보안)
- [ ] 토픽 최대 개수/와일드카드 지원 여부

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **WebSocket**: Native WebSocket API
- **State Management**: React Hooks
- **Type System**: TypeScript Interface 기반

## 📝 라이선스

이 프로젝트는 개발 학습용으로 제작되었습니다.

---
