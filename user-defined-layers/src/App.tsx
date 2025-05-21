import './App.css';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCreateViewer } from './useCreateViewer.ts';
import { useMousePosition } from './useMousePosition.ts';
import type { Child, ReferencePoint } from './model.ts';
import MarkupTable from './MarkupTable.tsx';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ModalEditor } from './ModalEditor.tsx';
import { useUpdateReferencePoints } from './useUpdateReferencePoints.ts';

const defaultRowData: Child[] = [
  {
    id: '1',
    name: 'Blue Things',
    type: 'folder',
    description: 'Blue things are cool',
  },
  {
    id: '2',
    name: 'blue 2',
    latitude: 0,
    longitude: 0,
    parentId: '1',
    type: 'referencePoint',
    description: 'a small blue thing',
  },
  {
    id: '3',
    name: 'Red Things',
    type: 'folder',
    description: 'Red things are cool',
  },
  {
    id: '4',
    name: 'red 4',
    latitude: 0,
    longitude: 0,
    parentId: '3',
    type: 'referencePoint',
    description: 'a small red thing',
  },
];

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
  const viewer = useCreateViewer(containerId.current);
  const mousePosition = useMousePosition(viewer);
  const [rowData, setRowData] = useState<Child[]>(defaultRowData);
  const [newRowData, setNewRowData] = useState<Child[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const referencePoints = rowData.filter(
    (row) => row.type === 'referencePoint',
  ) as ReferencePoint[];
  useUpdateReferencePoints(referencePoints, viewer);

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

  /*
  console.log(
    'Mouse Position:',
    mousePosition?.latitude?.toFixed(1),
    mousePosition?.dragging,
    mousePosition?.currentId,
  );
*/

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
        newRefPoint.latitude = latitude ?? 0;
        newRefPoint.longitude = longitude ?? 0;
        upsertRow(newRefPoint as Child);
      }
    }
  }, [mousePosition, editId]);

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
            <MarkupTable
              rowData={rowData}
              newRowData={newRowData}
              upsertRow={upsertRow}
              collapsed={collapsed}
              onOpenModal={onOpenModal}
            />
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
