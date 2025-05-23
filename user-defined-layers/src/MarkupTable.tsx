import './App.css';

import { AgGridReact } from 'ag-grid-react';

import EditIcon from '@mui/icons-material/Edit';

import {
  AllCommunityModule,
  type ColDef,
  type IRowNode,
  ModuleRegistry,
  type RowClassParams,
  type RowDragEvent,
  RowDragModule,
  type ValueGetterFunc,
  type ValueGetterParams,
} from 'ag-grid-community';

import { TreeDataModule } from 'ag-grid-enterprise';

import { useCallback } from 'react';

import type { Child, ReferencePoint } from './model.ts';
import { AddMarkupButtonBar } from './AddMarkupButtonBar.tsx';
import { FlightTakeoff } from '@mui/icons-material';
import { Cartesian3, Viewer } from 'cesium';

// Register all Community features
ModuleRegistry.registerModules([
  AllCommunityModule,
  RowDragModule,
  TreeDataModule,
]);

// see https://www.ag-grid.com/javascript-data-grid/tree-data-self-referential/

interface MarkupTableProps {
  markupData: Child[];
  provisionalMarkupData: Child[];
  upsertRow: (row: Child) => void;
  collapsed: boolean;
  onOpenModal: (id: string | undefined) => void;
  viewer: Viewer | null;
}

function getAncestors(markupData: Child[], id: string): string[] {
  const match = markupData.find((row) => row.id === id);
  if (!match) {
    return [];
  } else if (!match.parentId) {
    return [id];
  } else {
    return [id, ...getAncestors(markupData, match.parentId)];
  }
}

function calculateNewParentId(overNode: IRowNode | undefined) {
  if (!overNode) {
    return undefined;
  }

  return isFolder(overNode) ? overNode.data.id : overNode.data.parentId;
}

const isFolder = (params: IRowNode<Child>) => {
  return params?.data?.type === 'folder';
};

const getRowStyle = (params: RowClassParams) => {
  return params.node.rowPinned ? { fontWeight: 'bold' } : undefined;
};

function MarkupTable({
  markupData,
  provisionalMarkupData,
  upsertRow,
  collapsed,
  onOpenModal,
  viewer,
}: MarkupTableProps) {
  const groupValueGetter: ValueGetterFunc<Child> = useCallback(
    (params: ValueGetterParams<Child>) => {
      return params.data?.name;
    },
    [],
  );

  const onRowDragEnd = useCallback(
    (event: RowDragEvent) => {
      const { overNode, node } = event;

      const newParentId = calculateNewParentId(overNode);

      // The new parent cannot have the node as an ancestor
      const ancestorIds: string[] = getAncestors(markupData, newParentId);
      if (ancestorIds.includes(node.data.id)) {
        return false;
      }

      const provisionalMarkupData = { ...node.data };
      provisionalMarkupData.parentId = newParentId;
      upsertRow(provisionalMarkupData);
    },
    [markupData, upsertRow],
  );

  const onFlyTo = useCallback(
    (latitude: number, longitude: number) => {
      if (!viewer) {
        return;
      }
      viewer.scene.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, 9000),
        duration: 6,
      });
    },
    [viewer],
  );

  const createEditButton = useCallback(
    (child: Child) => {
      return (
        <button
          style={{ background: 'white' }}
          type="button"
          onClick={() => onOpenModal(child.id)}
        >
          <EditIcon />
        </button>
      );
    },
    [onOpenModal],
  );

  const createFlyToButton = useCallback(
    (child: Child) => {
      if (child.type === 'folder') {
        return null;
      }

      const { latitude, longitude } = child as ReferencePoint;

      return (
        <button
          style={{ background: 'white' }}
          type="button"
          onClick={() => onFlyTo(latitude, longitude)}
        >
          <FlightTakeoff />
        </button>
      );
    },
    [onFlyTo],
  );

  // render the action buttons
  const actionsRenderer = useCallback(
    ({ data: child }: IRowNode<Child>) => {
      if (!child) {
        return null;
      }

      return (
        <>
          {createEditButton(child)}
          {createFlyToButton(child)}
        </>
      );
    },
    [createEditButton, createFlyToButton],
  );

  const colDefs: ColDef[] = [
    {
      field: 'actions',
      cellRenderer: actionsRenderer,
      sortable: false,
    },
  ];

  const grid = collapsed ? undefined : (
    <AgGridReact
      treeData={true}
      rowData={markupData}
      columnDefs={colDefs}
      groupDefaultExpanded={-1}
      autoGroupColumnDef={{
        rowDrag: true,
        headerName: '',
        editable: false,
        cellRendererParams: { suppressCount: true },
        valueGetter: groupValueGetter,
      }}
      getRowId={(params) => params.data.id}
      treeDataParentIdField="parentId"
      onRowDragEnd={onRowDragEnd}
      pinnedTopRowData={provisionalMarkupData}
      getRowStyle={getRowStyle}
    />
  );

  return (
    <>
      <div>
        <div
          style={{
            height: '100vh',
          }}
        >
          <AddMarkupButtonBar upsertRow={upsertRow} />
          {grid}
        </div>
      </div>
    </>
  );
}

export default MarkupTable;
