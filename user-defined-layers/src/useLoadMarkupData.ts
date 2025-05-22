import type { Child } from './model.ts';
import { useCallback, useEffect, useState } from 'react';

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

export const useLoadMarkupData = () => {
  const [rowData, setRowData] = useState<Child[]>(
    getInitialData(LOCAL_ROW_DATA_KEY, defaultRowData),
  );
  const [newRowData, setNewRowData] = useState<Child[]>(
    getInitialData(LOCAL_NEW_ROW_DATA_KEY, []),
  );
  const [editId, setEditId] = useState<string | undefined>(undefined);

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

  return { rowData, newRowData, upsertRow, editId, setEditId };
};

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
