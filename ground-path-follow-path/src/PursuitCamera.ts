import {CylinderEntity} from "./CylinderEntity";
import {VideoRecorder} from './VideoRecorder';

const Cesium = require('cesium/Cesium');

import {
    raiseCartesian,
    raiseCartographic,
    subtractCartesians,
    subtractCartographics,
    terrainCartesianFromScreen,
    toCartesian,
    toCartographic
} from './cesium-helpers';
import {calculateBearing} from './calculations';
import {DataRecorder} from './DataRecorder';

const createMarker = (viewer: Cesium.Viewer, color:Cesium.Color) => {
    return new CylinderEntity(viewer, 10, color, 4, 0);
};

export class PursuitCamera {
    viewer: Cesium.Viewer;
    camera: Cesium.Camera;
    videoRecorder: VideoRecorder;
    recording: boolean;
    recordedData:any;
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;
    topLeftMarker: CylinderEntity;
    topRightMarker: CylinderEntity;
    bottomRightMarker: CylinderEntity;
    bottomLeftMarker: CylinderEntity;
    startMilliseconds: number;

    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.viewer = viewer;
        this.camera = viewer.camera;
        this.enabled = enabled;
        this.videoRecorder = new VideoRecorder(viewer.canvas);
        this.recording = false;
        this.recordedData = [];

        const aspectRatio = viewer.canvas.clientWidth / viewer.canvas.clientHeight;

        this.disabledFrustrum = new Cesium.PerspectiveFrustum({
            fov: Math.PI/4,
            aspectRatio,
        });

        this.enabledFrustrum = new Cesium.PerspectiveFrustum({
            fov: Math.PI/20,
            aspectRatio,
        });

        if (enabled) {
            this.camera.frustum = this.enabledFrustrum;
            this.startMilliseconds = Date.now();
        }

        this.topLeftMarker = createMarker(viewer, Cesium.Color.RED);
        this.topRightMarker = createMarker(viewer, Cesium.Color.GREEN);
        this.bottomRightMarker = createMarker(viewer, Cesium.Color.BLUE);
        this.bottomLeftMarker = createMarker(viewer, Cesium.Color.YELLOW);
    }

    enable() {
        this.enabled = true;
        this.camera.frustum = this.enabledFrustrum;
        this.startMilliseconds = this.startMilliseconds || Date.now();
    }

    disable() {
        this.enabled = false;
        this.camera.frustum = this.disabledFrustrum;
    }

    update(targetCartesian: Cesium.Cartesian3, pursuitCartesian: Cesium.Cartesian3) {
        if (!this.enabled) { return; }

        const targetCartographic = toCartographic(targetCartesian);
        const pursuitCartographic = toCartographic(pursuitCartesian);
        const raisedTargetCartesian = raiseCartesian(targetCartesian, pursuitCartographic.height);

        const fromPursuitToTarget = subtractCartesians(targetCartesian, pursuitCartesian);
        const fromPursuitToRaisedTarget = subtractCartesians(raisedTargetCartesian, pursuitCartesian);

        const bearing = calculateBearing(pursuitCartographic, targetCartographic);
        const pitch = Cesium.Cartesian3.angleBetween(fromPursuitToTarget, fromPursuitToRaisedTarget);

        this.camera.setView({
            destination : pursuitCartesian,
            orientation: {
                heading : bearing,
                pitch : -pitch,
                roll : 0.0,
            }
        });

        const topLeftCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(0,0));
        const topRightCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(this.viewer.canvas.clientWidth,0));
        const bottomRightCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(this.viewer.canvas.clientWidth,this.viewer.canvas.clientHeight));
        const bottomLeftCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(0,this.viewer.canvas.clientHeight));

        this.topLeftMarker.update(topLeftCartesian);
        this.topRightMarker.update(topRightCartesian);
        this.bottomRightMarker.update(bottomRightCartesian);
        this.bottomLeftMarker.update(bottomLeftCartesian);

        const datum = {
            target: targetCartesian,
            camera: pursuitCartesian,
            video: {
                topLeft: topLeftCartesian,
                topRight: topRightCartesian,
                bottomRight: bottomRightCartesian,
                bottomLeft: bottomLeftCartesian,
            }
        };

        const topLeftCartographic = toCartographic(topLeftCartesian);
        const topRightCartographic = toCartographic(topRightCartesian);
        const bottomRightCartographic = toCartographic(bottomRightCartesian);
        const bottomLeftCartographic = toCartographic(bottomLeftCartesian);

        const elapsedMilliseconds = Date.now() - this.startMilliseconds;

        const line =
            `${elapsedMilliseconds},`+
            `${topLeftCartographic.latitude},${topLeftCartographic.longitude},${topLeftCartographic.height},'t',`+
            `${topRightCartographic.latitude},${topRightCartographic.longitude},${topRightCartographic.height},'t',`+
            `${bottomRightCartographic.latitude},${bottomRightCartographic.longitude},${bottomRightCartographic.height},'t',`+
            `${bottomLeftCartographic.latitude},${bottomLeftCartographic.longitude},${bottomLeftCartographic.height},'t',` +
            `${pursuitCartographic.latitude},${pursuitCartographic.longitude},${pursuitCartographic.height}`;

        this.recordedData.push(line);
    }

    startRecording() {
        this.videoRecorder.startRecording();
        this.recording = true;
    }

    stopRecording() {
        this.videoRecorder.stopRecording();
        this.recording = false;
    }

    download() {
        this.videoRecorder.downloadVideo();
        const dataRecorder = new DataRecorder();
        dataRecorder.downloadData('recordedData.csv', this.recordedData.join('\n'));
    }
}