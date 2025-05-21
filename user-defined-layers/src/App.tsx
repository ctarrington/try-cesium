import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMousePosition } from './useMousePosition.ts';
import type { Child, ReferencePoint } from './model.ts';
import MarkupTable from './MarkupTable.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ModalEditor } from './ModalEditor.tsx';
import { useUpdateReferencePoints } from './useUpdateReferencePoints.ts';

import { Viewer } from 'cesium';
import * as Cesium from 'cesium';
import { ACCESS_TOKEN } from './dontcheckin';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const options = {
  homeButton: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  animation: false,
  infoBox: false,
  geocoder: false,
  scene3DOnly: true,
};

const defaultRowData: Child[] = [
  {
    id: '1',
    name: 'North America',
    type: 'folder',
    description: 'A few markers in North America',
  },
  {
    id: '2',
    name: 'Miami',
    latitude: 25.7617,
    longitude: -80.1918,
    parentId: '1',
    type: 'referencePoint',
    description: '',
  },
  {
    id: '3',
    name: 'South America',
    type: 'folder',
    description: 'A few markers in South America',
  },
  {
    id: '4',
    name: 'Buenos Aires',
    latitude: -34.6037,
    longitude: -58.3816,
    parentId: '3',
    type: 'referencePoint',
    description: 'Buenos Aires is the capital of Argentina',
  },
  {
    id: '5',
    name: 'Sao Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    parentId: '3',
    type: 'referencePoint',
    description: 'Sao Paulo is a large city in Brazil',
  },
];

const LOCAL_ROW_DATA_KEY = 'rowData';
const LOCAL_NEW_ROW_DATA_KEY = 'newRowData';

function getInitialData(key: string, defaultRowData: Child[]) {
  const existingData = JSON.parse(localStorage.getItem(key) ?? '[]');
  return existingData.length > 0 ? existingData : defaultRowData;
}

function validField(key: string, row: Child) {
  const value = row[key as keyof Child];
  if (!value || value.length === 0) {
    return false;
  }

  return !(value.toLowerCase().startsWith(key) && value.endsWith('...'));
}

function validRow(row: Child) {
  if (!row.id || row.id.length === 0) {
    return false;
  }

  if (!validField('name', row) || !validField('description', row)) {
    return false;
  }

  if (row.type === 'car') {
    return validField('make', row) && validField('model', row);
  }

  return true;
}

function App() {
  const containerId = useRef<string>(createDivName());
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const mousePosition = useMousePosition(viewer);
  const [rowData, setRowData] = useState<Child[]>(
    getInitialData(LOCAL_ROW_DATA_KEY, defaultRowData),
  );
  const [newRowData, setNewRowData] = useState<Child[]>(
    getInitialData(LOCAL_NEW_ROW_DATA_KEY, []),
  );
  const [collapsed, setCollapsed] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const referencePoints = rowData.filter(
    (row) => row.type === 'referencePoint',
  ) as ReferencePoint[];
  useUpdateReferencePoints(referencePoints, viewer);

  useEffect(() => {
    setTimeout(() => {
      if (!viewer) {
        const newViewer = new Viewer(containerId.current, options);
        setViewer(newViewer);
      }
    }, 100);
  }, []);

  // edit or create
  const upsertRow = useCallback(
    (newRow: Child) => {
      const matchExistingIndex = rowData.findIndex(
        (row) => row.id === newRow.id,
      );
      const matchNewIndex = newRowData.findIndex((row) => row.id === newRow.id);

      if (matchNewIndex !== -1) {
        if (validRow(newRow)) {
          // The new row is valid
          setRowData([...rowData, newRow]);
          const modifiedNewRowData = newRowData.filter(
            (row) => row.id !== newRow.id,
          );
          setNewRowData(modifiedNewRowData);
        } else {
          // The new row needs to be updated
          const modifiedNewRowData = [...newRowData];
          modifiedNewRowData[matchNewIndex] = newRow;
          setNewRowData(modifiedNewRowData);
        }
      } else if (matchExistingIndex !== -1) {
        const modifiedRowData = [...rowData];
        modifiedRowData[matchExistingIndex] = newRow;
        setRowData(modifiedRowData);
      } else {
        // new row
        setNewRowData([...newRowData, newRow]);
        setEditId(newRow.id);
      }
    },
    [rowData, newRowData],
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_ROW_DATA_KEY, JSON.stringify(rowData));
  }, [rowData]);

  useEffect(() => {
    localStorage.setItem(LOCAL_NEW_ROW_DATA_KEY, JSON.stringify(newRowData));
  }, [newRowData]);

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
      const newRow = rowData.find((row) => row.id === currentId);
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

        upsertRow(newRefPoint as Child);
      }
    }
  }, [mousePosition, editId]);

  const markupTable = viewer ? (
    <MarkupTable
      rowData={rowData}
      newRowData={newRowData}
      upsertRow={upsertRow}
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
            maxSize={50}
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
        rowData={rowData}
        newRowData={newRowData}
        upsertRow={upsertRow}
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
