interface SensorViewProps {
  canvasParentId: string;
}

export function SensorView({ canvasParentId }: SensorViewProps) {
  return (
    <div className="map-view" style={{ position: "relative" }}>
      <div
        id={canvasParentId}
        className="sensor-view-canvas"
        style={{ height: "100vh", width: "100%" }}
      />
    </div>
  );
}
