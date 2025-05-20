import './App.css';

import { AgGridReact } from 'ag-grid-react';

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
import type { Child } from './model.ts';

// Register all Community features
ModuleRegistry.registerModules([
  AdvancedFilterModule,
  AllCommunityModule,
  RowDragModule,
  TreeDataModule,
]);

// see https://www.ag-grid.com/javascript-data-grid/tree-data-self-referential/

interface CarTableProps {
  rowData: Child[]; // existing row data
  newRowData: Child[]; // new rows that need to be finished
  upsertRow: (row: Child) => void;
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

function MarkupTable({ rowData, newRowData, upsertRow }: CarTableProps) {
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
      return params.data?.type ?? 'what';
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

  // Column Definitions: Defines the columns to be displayed.
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
  ];

  return (
    <>
      <div>
        <div style={{ height: 400 }}>
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
            pinnedBottomRowData={newRowData}
            getRowStyle={getRowStyle}
            enableAdvancedFilter={true}
          />
        </div>
      </div>
    </>
  );
}

export default MarkupTable;
