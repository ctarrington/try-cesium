import {CylinderEntity} from "./CylinderEntity";
import {VideoRecorder} from './VideoRecorder';

const Cesium = require('cesium/Cesium');

import {
    clamp,
    raiseCartesian,
    raiseCartographic,
    subtractCartesians,
    subtractCartographics,
    terrainCartesianFromScreen,
    toCartesian,
    toCartographic,
    toDegrees
} from './cesium-helpers';
import {calculateBearing} from './calculations';
import {DataRecorder} from './DataRecorder';

const createMarker = (viewer: Cesium.Viewer, color:Cesium.Color) => {
    return new CylinderEntity(viewer, 10, color, 4, 0);
};

const ENABLED_FOV = Math.PI/20;
const DISABLED_FOV = Math.PI/4;

export class PursuitCamera {
    viewer: Cesium.Viewer;
    camera: Cesium.Camera;
    videoRecorder: VideoRecorder;
    recording: boolean;
    recordedData:string[];
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;
    topLeftMarker: CylinderEntity;
    topRightMarker: CylinderEntity;
    bottomRightMarker: CylinderEntity;
    bottomLeftMarker: CylinderEntity;
    startMilliseconds: number;
    deltaRoll: number;
    roll:number;

    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.viewer = viewer;
        this.camera = viewer.camera;
        this.enabled = enabled;
        this.videoRecorder = new VideoRecorder(viewer.canvas);
        this.recording = false;
        this.recordedData = [];
        this.deltaRoll = 0;
        this.roll = 0;

        const aspectRatio = viewer.canvas.clientWidth / viewer.canvas.clientHeight;

        this.disabledFrustrum = new Cesium.PerspectiveFrustum({
            fov: DISABLED_FOV,
            aspectRatio,
        });

        this.enabledFrustrum = new Cesium.PerspectiveFrustum({
            fov: ENABLED_FOV,
            aspectRatio,
        });

        if (enabled) {
            this.camera.frustum = this.enabledFrustrum;
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

        const epsilon = Math.PI/200;
        const chance = Math.random();
        if (chance < 0.1 || this.deltaRoll > 3*epsilon) {
            this.deltaRoll -= epsilon;
        } else if (chance > 0.9 || this.deltaRoll < -3*epsilon) {
            this.deltaRoll += epsilon;
        }

        this.roll += this.deltaRoll;
        this.roll = clamp(-Math.PI/4, Math.PI/4, this.roll);

        this.camera.setView({
            destination : pursuitCartesian,
            orientation: {
                heading : bearing,
                pitch : -pitch,
                roll: this.roll,
            }
        });

        const topLeftCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(0,0));
        const topRightCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(this.viewer.canvas.clientWidth,0));
        const bottomRightCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(this.viewer.canvas.clientWidth,this.viewer.canvas.clientHeight));
        const bottomLeftCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(0,this.viewer.canvas.clientHeight));

        topLeftCartesian && this.topLeftMarker.update(topLeftCartesian);
        topRightCartesian && this.topRightMarker.update(topRightCartesian);
        bottomRightCartesian && this.bottomRightMarker.update(bottomRightCartesian);
        bottomLeftCartesian && this.bottomLeftMarker.update(bottomLeftCartesian);

        if (!this.recording) { return; }

        const topLeftIntersection = topLeftCartesian ? 't' : 'f';
        const topRightIntersection = topRightCartesian ? 't' : 'f';
        const bottomRightIntersection = bottomRightCartesian ? 't' : 'f';
        const bottomLeftIntersection = bottomLeftCartesian ? 't' : 'f';

        const defaultCartographic = Cesium.Cartographic.fromDegrees(0, 0, 0);
        const topLeftCartographic = topLeftCartesian ? toCartographic(topLeftCartesian) : defaultCartographic;
        const topRightCartographic = topRightCartesian ? toCartographic(topRightCartesian) : defaultCartographic;
        const bottomRightCartographic = bottomRightCartesian ? toCartographic(bottomRightCartesian) : defaultCartographic;
        const bottomLeftCartographic = bottomLeftCartesian ? toCartographic(bottomLeftCartesian) : defaultCartographic;

        const elapsedMilliseconds = Date.now() - this.startMilliseconds;

        const line =
            `${elapsedMilliseconds},`+
            `${toDegrees(topLeftCartographic.latitude)},    ${toDegrees(topLeftCartographic.longitude)},${topLeftCartographic.height},${topLeftIntersection},`+
            `${toDegrees(topRightCartographic.latitude)},   ${toDegrees(topRightCartographic.longitude)},${topRightCartographic.height},${topRightIntersection},`+
            `${toDegrees(bottomRightCartographic.latitude)},${toDegrees(bottomRightCartographic.longitude)},${bottomRightCartographic.height},${bottomRightIntersection},`+
            `${toDegrees(bottomLeftCartographic.latitude)}, ${toDegrees(bottomLeftCartographic.longitude)},${bottomLeftCartographic.height},${bottomLeftIntersection},` +
            `${toDegrees(pursuitCartographic.latitude)},    ${toDegrees(pursuitCartographic.longitude)},${pursuitCartographic.height}`;

        this.recordedData.push(line);
    }

    startRecording() {
        this.videoRecorder.startRecording();
        this.recording = true;
        this.startMilliseconds = Date.now();
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