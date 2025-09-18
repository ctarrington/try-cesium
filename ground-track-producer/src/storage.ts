export const storeImage = (imageData: Blob, tick: number) => {
  fetch(`http://localhost:3001/store_image/${tick}`, {
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

export const storeMetadata = (metadata: any, tick: number) => {
  fetch(`http://localhost:3001/store_metadata/${tick}`, {
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
