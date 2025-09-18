import "./App.css";

import { useCreateViewer } from "./useCreateViewer.ts";
import { SensorView } from "./SensorView.tsx";
import { useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useFetchAll } from "./useFetchAll.ts";
import { useUpdateCameraPosition } from "./useUpdateCameraPosition.ts";

function App() {
  const containerId = useRef<string>(createDivName());
  const viewer = useCreateViewer(containerId.current);

  const { metadata } = useFetchAll();
  useUpdateCameraPosition(viewer, metadata);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div>
        <PanelGroup direction="horizontal">
          <Panel collapsible={true} collapsedSize={5} minSize={5} maxSize={50}>
            <div>This space is blank</div>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <SensorView canvasParentId={containerId.current} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

const createDivName = () => {
  return "cesiumContainer" + Math.floor(Math.random() * 1000);
};

export default App;
