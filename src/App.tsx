import SensorPanel from "./components/SensorPanel";

function App() {
  const wsUrl = import.meta.env.VITE_WS_URL || "wss://echo.websocket.org";
  const deviceIds = ["device1", "device2"];

  return (
    <div>
      <h1>센서 모니터링</h1>
      <SensorPanel wsUrl={wsUrl} token={null} deviceIds={deviceIds} />
    </div>
  );
}

export default App;
