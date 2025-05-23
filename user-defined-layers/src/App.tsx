import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMousePosition } from './useMousePosition.ts';
import type { Child, ReferencePoint } from './model.ts';
import MarkupTable from './MarkupTable.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ModalEditor } from './ModalEditor.tsx';
import { useUpdateReferencePoints } from './useUpdateReferencePoints.ts';

import * as Cesium from 'cesium';
import { ACCESS_TOKEN } from './dontcheckin';
import { useCreateViewer } from './useCreateViewer.ts';
import { useMarkupData } from './useMarkupData.ts';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

function App() {
  const containerId = useRef<string>(createDivName());
  const viewer = useCreateViewer(containerId.current);
  const mousePosition = useMousePosition(viewer);
  const [collapsed, setCollapsed] = useState(false);
  const {
    markupData,
    provisionalMarkupData,
    upsertMarkupData,
    editId,
    setEditId,
  } = useMarkupData();

  const referencePoints = markupData.filter(
    (row) => row.type === 'referencePoint',
  ) as ReferencePoint[];
  useUpdateReferencePoints(referencePoints, viewer);

  const onCloseModal = useCallback(() => {
    setEditId(undefined);
  }, [setEditId]);

  const onOpenModal = useCallback(
    (id: string | undefined) => {
      setEditId(id);
    },
    [setEditId],
  );

  const onResize = useCallback((value: number) => {
    if (value < 6) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    if (!mousePosition) {
      return;
    }

    const { currentId, dragging } = mousePosition;
    if (!currentId) {
      return;
    }

    if (currentId !== editId && dragging) {
      setEditId(currentId);
    }

    if (currentId === editId && dragging) {
      const { latitude, longitude } = mousePosition;
      const newRow = markupData.find((row) => row.id === currentId);
      if (newRow) {
        const newRefPoint = { ...newRow } as ReferencePoint;
        const oldRefPoint = { ...newRow } as ReferencePoint;

        newRefPoint.latitude = latitude ?? 0;
        newRefPoint.longitude = longitude ?? 0;

        const deltaLatitude = Math.abs(
          newRefPoint.latitude - oldRefPoint.latitude,
        );
        const deltaLongitude = Math.abs(
          newRefPoint.longitude - oldRefPoint.longitude,
        );

        if (deltaLatitude < 0.0001 && deltaLongitude < 0.0001) {
          return;
        }

        upsertMarkupData(newRefPoint as Child);
      }
    }
  }, [mousePosition, markupData, editId, upsertMarkupData]);

  const markupTable = viewer ? (
    <MarkupTable
      markupData={markupData}
      provisionalMarkupData={provisionalMarkupData}
      upsertRow={upsertMarkupData}
      collapsed={collapsed}
      onOpenModal={onOpenModal}
      viewer={viewer}
    />
  ) : (
    <div>Loading</div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div>
        <PanelGroup direction="horizontal">
          <Panel
            collapsible={true}
            collapsedSize={5}
            minSize={5}
            maxSize={20}
            onResize={onResize}
          >
            {markupTable}
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <div id={containerId.current} style={{ height: '100vh' }} />
          </Panel>
        </PanelGroup>
      </div>
      <ModalEditor
        markupData={markupData}
        provisionalMarkupData={provisionalMarkupData}
        upsertRow={upsertMarkupData}
        editId={editId}
        onClose={onCloseModal}
      />
    </div>
  );
}

const createDivName = () => {
  return 'cesiumContainer' + Math.floor(Math.random() * 1000);
};

export default App;
