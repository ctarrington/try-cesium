import { useCallback } from 'react';

import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddLocationIcon from '@mui/icons-material/AddLocation';

import type { Child } from './model.ts';

interface AddMarkupButtonBarProps {
  upsertRow: (row: Child) => void;
}

export function AddMarkupButtonBar({ upsertRow }: AddMarkupButtonBarProps) {
  const createFolder = useCallback(() => {
    const newRow = {
      id: `${Date.now()}`,
      name: 'Name...',
      type: 'folder',
      description: 'Description...',
    };
    upsertRow(newRow);
  }, [upsertRow]);

  const createReferencePoint = useCallback(() => {
    const newRow = {
      id: `${Date.now()}`,
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
        <CreateNewFolderIcon />
      </button>
      <button type="button" onClick={createReferencePoint}>
        <AddLocationIcon />
      </button>
    </div>
  );
}
