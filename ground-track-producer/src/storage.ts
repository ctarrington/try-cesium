export const storeImage = (imageData: Blob, tick: string) => {
  fetch(`http://localhost:3001/image/${tick}`, {
    method: 'POST',
    body: imageData,
    headers: { 'Content-Type': 'image/png' },
  })
    .then((response) => {
      console.log('response', response);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const storeMetadata = (metadata: any, tick: string) => {
  fetch(`http://localhost:3001/metadata/${tick}`, {
    method: 'POST',
    body: JSON.stringify(metadata),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      console.log('response', response);
    })
    .catch((error) => {
      console.error(error);
    });
};
