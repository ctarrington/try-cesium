const socket = new WebSocket('ws://localhost:8015');
socket.binaryType = 'blob';

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('Opened connection to web socket server');
});

const processImage = msg => {
    // console.log('ip msg', msg);

    const imageSrc = URL.createObjectURL(msg.data);
    postMessage(imageSrc);
};

socket.addEventListener('message',  processImage);
