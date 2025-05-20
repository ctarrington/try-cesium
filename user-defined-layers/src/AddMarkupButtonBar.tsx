import { useCallback } from 'react';
import type { Child } from './model.ts';

interface AddMarkupButtonBarProps {
  upsertRow: (row: Child) => void;
}

export function AddMarkupButtonBar({ upsertRow }: AddMarkupButtonBarProps) {
  const createFolder = useCallback(() => {
    const newRow = {
      id: `${Math.random()}`,
      name: 'Name...',
      type: 'folder',
      description: 'Description...',
    };
    upsertRow(newRow);
  }, [upsertRow]);

  const createReferencePoint = useCallback(() => {
    const newRow = {
      id: `${Math.random()}`,
      name: 'Name...',
      type: 'referencePoint',
      description: 'Description...',
      latitude: 0,
      longitude: 0,
    };
    upsertRow(newRow);
  }, [upsertRow]);
  return (
    <div>
      <button type="button" onClick={createFolder}>
        +F
      </button>
      <button type="button" onClick={createReferencePoint}>
        +P
      </button>
    </div>
  );
}
