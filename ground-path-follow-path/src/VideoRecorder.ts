const FPS = 30;

export class VideoRecorder {
    mediaSource:MediaSource;
    mediaRecorder: MediaRecorder;
    recordedBlobs: Blob[];
    sourceBuffer: SourceBuffer;
    stream: MediaStream;
    recording: boolean;

    constructor(canvas:any) {
        this.handleSourceOpen = this.handleSourceOpen.bind(this);
        this.mediaSource = new MediaSource();
        this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen, false);

        this.stream = canvas.captureStream(FPS);
        this.recording = false;
    }

    handleSourceOpen(event:Event) {
        console.log('MediaSource opened');
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source Open. buffer: ', this.sourceBuffer);
    }

    startRecording() {
        const handleDataAvailable = (event:BlobEvent) => {
            if (event.data && event.data.size > 0) {
                this.recordedBlobs.push(event.data);
            }
        };

        const handleStop = (event:Event) => {
            console.log('Recorder stopped: ', event);
            new Blob(this.recordedBlobs, {type: 'video/webm'});
        };

        const handleError = (error : MediaRecorderErrorEvent) => {
            console.log('Recorder error: ', error);
        };

        this.recording = true;
        this.recordedBlobs = [];
        try {
            this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm'});
        } catch (e0) {
            console.log('Unable to create MediaRecorder with options Object: ', e0);
            try {
                this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm,codecs=vp9'});
            } catch (e1) {
                console.log('Unable to create MediaRecorder with options Object: ', e1);
                try {
                    this.mediaRecorder = new MediaRecorder(this.stream, {mimeType:'video/vp8'});
                } catch (e2) {
                    alert('MediaRecorder is not supported by this browser.\n\n' +
                        'Try Firefox 29 or later, or Chrome 47 or later, ' +
                        'with Enable experimental Web Platform features enabled from chrome://flags.');
                    console.error('Exception while creating MediaRecorder:', e2);
                    return;
                }
            }
        }
        console.log('Created MediaRecorder', this.mediaRecorder, 'with options');
        this.mediaRecorder.onstop = handleStop;
        this.mediaRecorder.ondataavailable = handleDataAvailable;
        this.mediaRecorder.onerror = handleError;
        this.mediaRecorder.start(100); // collect 100ms of data
        console.log('MediaRecorder started', this.mediaRecorder);
    }

    stopRecording() {
        this.recording = false;
        this.mediaRecorder.stop();
        console.log('Recorded Blobs: ', this.recordedBlobs);
    }

    downloadVideo() {
        const blob = new Blob(this.recordedBlobs, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}