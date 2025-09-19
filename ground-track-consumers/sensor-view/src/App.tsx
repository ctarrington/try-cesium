import "./App.css";

import { useCreateViewer } from "./useCreateViewer.ts";
import { SensorView } from "./SensorView.tsx";
import { useRef } from "react";
import { useFetchAll } from "./useFetchAll.ts";
import { useUpdateCameraPosition } from "./useUpdateCameraPosition.ts";
import { VideoCanvas } from "./VideoCanvas.tsx";

function App() {
  const cesiumContainerId = useRef<string>(createDivName("cesiumContainer"));
  const videoCanvasId = useRef<string>(createDivName("videoCanvas"));
  const viewer = useCreateViewer(cesiumContainerId.current);

  const { metadata, imageBlob } = useFetchAll();
  useUpdateCameraPosition(viewer, metadata);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SensorView canvasParentId={cesiumContainerId.current} />
      <VideoCanvas
        videoCanvasId={videoCanvasId.current}
        imageBlob={imageBlob}
        metadata={metadata}
        viewer={viewer}
      />
    </div>
  );
}

const createDivName = (baseName: string) => {
  return baseName + Math.floor(Math.random() * 1000);
};

export default App;
