import './App.css';

import { useRef } from 'react';

import { useCreateViewer } from './useCreateViewer.ts';
import { useMousePosition } from './useMousePosition.ts';

function App() {
  const containerId = useRef<string>(createDivName());
  const viewer = useCreateViewer(containerId.current);
  const mousePosition = useMousePosition(viewer);

  console.log('Mouse Position:', mousePosition);

  /*
  useEffect(() => {
    if (!viewer) {
      return;
    }

    const handler = new ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction((evt: ScreenSpaceEventHandler.MotionEvent) => {
      console.log('evt', evt);
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }, [viewer]);
*/

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div id={containerId.current} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

const createDivName = () => {
  return 'cesiumContainer' + Math.floor(Math.random() * 1000);
};

export default App;
