import './App.css';

import { useRef } from 'react';

import { useCreateViewer } from './useCreateViewer.ts';

function App() {
  const viewerRef = useRef<HTMLDivElement>(null);
  useCreateViewer(viewerRef);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default App;
