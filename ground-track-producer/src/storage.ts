export const storeImage = (imageData: Blob) => {
  fetch('http://localhost:3001/store_image', {
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
