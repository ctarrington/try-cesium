import type { Child } from './model.ts';
import { useCallback, useEffect, useState } from 'react';

const defaultMarkupData: Child[] = [
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

const LOCAL_MARKUP_DATA_KEY = 'markupData';
const LOCAL_PROVISIONAL_MARKUP_DATA_KEY = 'provisionalMarkupData';

// Markup data that has been fully entered
export const useMarkupData = () => {
  const [markupData, setMarkupData] = useState<Child[]>(
    getInitialData(LOCAL_MARKUP_DATA_KEY, defaultMarkupData),
  );

  // Markup data that is still being entered
  const [provisionalMarkupData, setProvisionalMarkupData] = useState<Child[]>(
    getInitialData(LOCAL_PROVISIONAL_MARKUP_DATA_KEY, []),
  );

  // The id of the row being edited
  const [editId, setEditId] = useState<string | undefined>(undefined);

  // edit or create provisional or valid markup data
  const upsertMarkupData = useCallback(
    (modifiedData: Child) => {
      const matchExistingIndex = markupData.findIndex(
        (data) => data.id === modifiedData.id,
      );
      const matchProvisionalIndex = provisionalMarkupData.findIndex(
        (data) => data.id === modifiedData.id,
      );

      if (matchProvisionalIndex !== -1) {
        if (isValid(modifiedData)) {
          // The provisional data is valid, so move it from the provisional data to the markup data
          setMarkupData([...markupData, modifiedData]);
          const modifiedProvisionalMarkupData = provisionalMarkupData.filter(
            (data) => data.id !== modifiedData.id,
          );
          setProvisionalMarkupData(modifiedProvisionalMarkupData);
        } else {
          // The provisional data needs to be updated
          const modifiedProvisionalMarkupData = [...provisionalMarkupData];
          modifiedProvisionalMarkupData[matchProvisionalIndex] = modifiedData;
          setProvisionalMarkupData(modifiedProvisionalMarkupData);
        }
      } else if (matchExistingIndex !== -1) {
        // The existing data needs to be updated
        const modifiedMarkupData = [...markupData];
        modifiedMarkupData[matchExistingIndex] = modifiedData;
        setMarkupData(modifiedMarkupData);
      } else {
        // newly entered data is provisional
        setProvisionalMarkupData([...provisionalMarkupData, modifiedData]);
        setEditId(modifiedData.id);
      }
    },
    [markupData, provisionalMarkupData],
  );

  useEffect(() => {
    localStorage.setItem(LOCAL_MARKUP_DATA_KEY, JSON.stringify(markupData));
  }, [markupData]);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_PROVISIONAL_MARKUP_DATA_KEY,
      JSON.stringify(provisionalMarkupData),
    );
  }, [provisionalMarkupData]);

  return {
    markupData: markupData,
    provisionalMarkupData: provisionalMarkupData,
    upsertMarkupData: upsertMarkupData,
    editId,
    setEditId,
  };
};

function getInitialData(key: string, defaultData: Child[]) {
  const existingData = JSON.parse(localStorage.getItem(key) ?? '[]');
  return existingData.length > 0 ? existingData : defaultData;
}

function isFieldValid(key: string, row: Child) {
  const value = row[key as keyof Child];
  if (!value || value.length === 0) {
    return false;
  }

  return !(value.toLowerCase().startsWith(key) && value.endsWith('...'));
}

function isValid(data: Child) {
  if (!data.id || data.id.length === 0) {
    return false;
  }

  if (!isFieldValid('name', data) || !isFieldValid('description', data)) {
    return false;
  }

  if (data.type === 'car') {
    return isFieldValid('make', data) && isFieldValid('model', data);
  }

  return true;
}
