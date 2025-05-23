import type { Child, ReferencePoint } from './model.ts';
import { useCallback } from 'react';

function findChildById(
  markupData: Child[],
  provisionalMarkupData: Child[],
  id: string,
): Child | null {
  const matchExistingIndex = markupData.findIndex((row) => row.id === id);
  const matchProvisionalIndex = provisionalMarkupData.findIndex(
    (row) => row.id === id,
  );

  if (matchExistingIndex === -1 && matchProvisionalIndex === -1) {
    return null;
  }

  if (matchExistingIndex !== -1) {
    return markupData[matchExistingIndex];
  }

  if (matchProvisionalIndex !== -1) {
    return provisionalMarkupData[matchProvisionalIndex];
  }

  return null;
}

interface ModalEditorProps {
  markupData: Child[];
  provisionalMarkupData: Child[];
  upsertRow: (newRow: Child) => void;
  editId?: string;
  onClose: () => void;
}
export function ModalEditor({
  markupData,
  provisionalMarkupData,
  upsertRow,
  editId,
  onClose,
}: ModalEditorProps) {
  const updateField = useCallback(
    (field: string, value: string) => {
      const newRow = findChildById(markupData, provisionalMarkupData, editId!);
      if (!newRow) {
        return;
      }

      const newChild = { ...newRow } as Child;
      const key = field as keyof Child;

      newChild[key] = value;
      upsertRow(newChild);
    },
    [editId, markupData, provisionalMarkupData, upsertRow],
  );

  const updateRefPointField = useCallback(
    (field: string, value: string) => {
      const newRow = findChildById(markupData, provisionalMarkupData, editId!);
      if (!newRow) {
        return;
      }

      const newRefPoint = { ...newRow } as ReferencePoint;
      const key = field as keyof ReferencePoint;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      newRefPoint[key] = ['longitude', 'latitude'].includes(key)
        ? parseFloat(value)
        : value;
      upsertRow(newRefPoint);
    },
    [editId, markupData, provisionalMarkupData, upsertRow],
  );

  const createChildFields = useCallback(
    ({ name, description }: Child) => {
      return (
        <>
          <label>Name</label>
          <input
            type={'text'}
            value={name}
            onChange={(e) => {
              updateField('name', e.target.value);
            }}
          />
          <label>Description</label>
          <input
            type={'text'}
            value={description}
            onChange={(e) => {
              updateField('description', e.target.value);
            }}
          />
        </>
      );
    },
    [updateField],
  );

  const createReferencePointFields = useCallback(
    (child: Child) => {
      if (child.type !== 'referencePoint') {
        return null;
      }

      const { latitude, longitude } = child as ReferencePoint;
      return (
        <>
          <label>Longitude</label>
          <input
            type={'number'}
            value={longitude}
            onChange={(e) => {
              updateRefPointField('longitude', e.target.value);
            }}
          />
          <label>Latitude</label>
          <input
            type={'number'}
            value={latitude}
            onChange={(e) => {
              updateRefPointField('latitude', e.target.value);
            }}
          />
        </>
      );
    },
    [updateRefPointField],
  );

  if (!editId) {
    return null;
  }

  const editRow = findChildById(markupData, provisionalMarkupData, editId);
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
      {createChildFields(editRow)}
      {createReferencePointFields(editRow)}
      <div></div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
