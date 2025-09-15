import { useState } from "react";
import { useSensorStream } from "../hooks/useSensorStream";

type Props = {
  wsUrl: string;
  token: string | null;
  deviceIds: string[];
};

export default function SensorPanel({ wsUrl, token, deviceIds }: Props) {
  const { connectionState, data, sendCommand } = useSensorStream(
    wsUrl,
    token,
    deviceIds,
    { subscribeExtra: { v: 1 } }
  );
  const [result, setResult] = useState("");

  // 연결 상태를 간단하게 표시
  const getStatusText = () => {
    if (connectionState.isConnected) return "연결됨";
    if (connectionState.isConnecting) return "연결중...";
    return "끊김";
  };

  return (
    <div>
      <div>상태: {getStatusText()}</div>

      {Object.entries(data).map(([id, v]) => (
        <div key={id}>
          <b>{id}</b> · 온도: {v.temp ?? "-"} · 습도: {v.hum ?? "-"} ·{" "}
          {v.ts ? new Date(v.ts).toLocaleTimeString() : "-"}
        </div>
      ))}

      <button
        onClick={() => {
          sendCommand(deviceIds[0], "pump.on", { level: 3 });
          setResult("명령 전송됨");
        }}
      >
        ON
      </button>

      <div>{result}</div>
    </div>
  );
}
