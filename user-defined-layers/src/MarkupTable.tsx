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
  type ValueSetterFunc,
  type ValueSetterParams,
} from 'ag-grid-community';

import { AdvancedFilterModule, TreeDataModule } from 'ag-grid-enterprise';

import { useCallback } from 'react';

import type { Child, ReferencePoint } from './model.ts';
import { AddMarkupButtonBar } from './AddMarkupButtonBar.tsx';
import { FlightTakeoff } from '@mui/icons-material';
import { Cartesian3, Viewer } from 'cesium';

// Register all Community features
ModuleRegistry.registerModules([
  AdvancedFilterModule,
  AllCommunityModule,
  RowDragModule,
  TreeDataModule,
]);

// see https://www.ag-grid.com/javascript-data-grid/tree-data-self-referential/

interface CarTableProps {
  rowData: Child[];
  newRowData: Child[];
  upsertRow: (row: Child) => void;
  collapsed: boolean;
  onOpenModal: (id: string | undefined) => void;
  viewer: Viewer | null;
}

function getAncestors(rowData: Child[], id: string): string[] {
  const match = rowData.find((row) => row.id === id);
  if (!match) {
    return [];
  } else if (!match.parentId) {
    return [id];
  } else {
    return [id, ...getAncestors(rowData, match.parentId)];
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
  rowData,
  newRowData,
  upsertRow,
  collapsed,
  onOpenModal,
  viewer,
}: CarTableProps) {
  // see https://www.ag-grid.com/react-data-grid/value-setters/
  const childValueSetter: ValueSetterFunc<Child> = useCallback(
    (params: ValueSetterParams<Child>) => {
      const { data: newRow, colDef, newValue } = params;
      if (!colDef.field) {
        return false;
      }

      const newRefPoint = { ...newRow } as Child;
      const key = colDef.field as keyof Child;

      newRefPoint[key] = newValue as string;
      upsertRow(newRefPoint as Child);

      return true;
    },
    [upsertRow],
  );

  const groupValueGetter: ValueGetterFunc<Child> = useCallback(
    (params: ValueGetterParams<Child>) => {
      if (params.data?.type === 'folder') {
        return '\u002B';
      }
      return '\u23FA';
    },
    [],
  );

  const onRowDragEnd = useCallback(
    (event: RowDragEvent) => {
      const { overNode, node } = event;

      const newParentId = calculateNewParentId(overNode);

      // The new parent cannot have the node as an ancestor
      const ancestorIds: string[] = getAncestors(rowData, newParentId);
      if (ancestorIds.includes(node.data.id)) {
        return false;
      }

      const newRowData = { ...node.data };
      newRowData.parentId = newParentId;
      upsertRow(newRowData);
    },
    [rowData, upsertRow],
  );

  const onFlyTo = useCallback(
    (latitude: number, longitude: number) => {
      if (!viewer) {
        return;
      }
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, 9000),
        duration: 4,
      });
    },
    [viewer],
  );

  // Column Definitions: Defines the columns to be displayed.
  const actionsRenderer = useCallback(
    (params: IRowNode<Child>) => {
      if (params.data?.type !== 'referencePoint') {
        return null;
      }

      const referencePoint = params.data as ReferencePoint;

      return (
        <>
          <button
            style={{ background: 'white' }}
            type="button"
            onClick={() => onOpenModal(referencePoint.id)}
          >
            <EditIcon />
          </button>
          <button
            style={{ background: 'white' }}
            type="button"
            onClick={() =>
              onFlyTo(referencePoint.latitude, referencePoint.longitude)
            }
          >
            <FlightTakeoff />
          </button>
        </>
      );
    },
    [onOpenModal],
  );

  const colDefs: ColDef[] = [
    {
      field: 'name',
      filter: true,
      editable: true,
      valueSetter: childValueSetter,
    },
    {
      field: 'description',
      filter: true,
      editable: true,
      valueSetter: childValueSetter,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
    },
    {
      field: 'actions',
      cellRenderer: actionsRenderer,
    },
  ];

  const grid = collapsed ? undefined : (
    <AgGridReact
      treeData={true}
      rowData={rowData}
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
      pinnedTopRowData={newRowData}
      getRowStyle={getRowStyle}
      enableAdvancedFilter={true}
      excludeChildrenWhenTreeDataFiltering={true}
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
