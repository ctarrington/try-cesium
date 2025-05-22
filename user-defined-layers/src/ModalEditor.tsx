import type { Child, ReferencePoint } from './model.ts';
import { useCallback } from 'react';

function findRowById(
  rowData: Child[],
  newRowData: Child[],
  id: string,
): ReferencePoint | null {
  const matchExistingIndex = rowData.findIndex((row) => row.id === id);
  const matchNewIndex = newRowData.findIndex((row) => row.id === id);

  if (matchExistingIndex === -1 && matchNewIndex === -1) {
    return null;
  }

  if (matchExistingIndex !== -1) {
    const existingRow = rowData[matchExistingIndex];
    if (existingRow.type !== 'referencePoint') {
      return null;
    }
    return rowData[matchExistingIndex] as ReferencePoint;
  }

  if (matchNewIndex !== -1) {
    const newRow = newRowData[matchNewIndex];
    if (newRow.type !== 'referencePoint') {
      return null;
    }
    return newRowData[matchNewIndex] as ReferencePoint;
  }

  return null;
}

interface ModalEditorProps {
  rowData: Child[];
  newRowData: Child[];
  upsertRow: (newRow: Child) => void;
  editId?: string;
  onClose: () => void;
}
export function ModalEditor({
  rowData,
  newRowData,
  upsertRow,
  editId,
  onClose,
}: ModalEditorProps) {
  const updateField = useCallback(
    (field: string, value: string) => {
      const newRow = findRowById(rowData, newRowData, editId!);
      if (!newRow) {
        return;
      }

      const newRefPoint = { ...newRow } as ReferencePoint;
      const key = field as keyof ReferencePoint;

      const adjustedValue = ['longitude', 'latitude'].includes(key)
        ? parseFloat(value)
        : value;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      newRefPoint[key] = adjustedValue;
      upsertRow(newRefPoint);
    },
    [editId, rowData, newRowData, upsertRow],
  );

  if (!editId) {
    return null;
  }

  const editRow = findRowById(rowData, newRowData, editId);
  if (!editRow) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 5,
        right: 5,
        padding: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr 3fr',
        gap: '4px',
      }}
    >
      <label>Name</label>
      <input
        type={'text'}
        value={editRow.name}
        onChange={(e) => {
          updateField('name', e.target.value);
        }}
      />
      <label>Description</label>
      <input
        type={'text'}
        value={editRow.description}
        onChange={(e) => {
          updateField('description', e.target.value);
        }}
      />
      <label>Longitude</label>
      <input
        type={'number'}
        value={editRow.longitude}
        onChange={(e) => {
          updateField('longitude', e.target.value);
        }}
      />
      <label>Latitude</label>
      <input
        type={'number'}
        value={editRow.latitude}
        onChange={(e) => {
          updateField('latitude', e.target.value);
        }}
      />
      <div></div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
