import {
    addCartesians,
    cartesianMidpoint, multiplyByScalar,
    normalize,
    raiseCartographic,
    subtractCartesians,
    toCartesian,
    toCartographic
} from "./cesium-helpers";

import {calculateBearing} from './calculations';

import {VideoData} from './VideoData';

const Cesium = require('cesium/Cesium');

const ENABLED_FOV = Math.PI/20;
const DISABLED_FOV = Math.PI/4;
const TAN_ENABLED_FOV = Math.tan(ENABLED_FOV);

export class VideoFollowCamera {
    viewer: Cesium.Viewer;
    camera: Cesium.Camera;
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;

    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.viewer = viewer;
        this.camera = viewer.camera;

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
    }

    enable() {
        this.enabled = true;
        this.camera.frustum = this.enabledFrustrum;
    }

    disable() {
        this.enabled = false;
        this.camera.frustum = this.disabledFrustrum;
    }

    update(videoData: VideoData) {
        if (!this.enabled) {
            return;
        }

        const topLeftCartesian = toCartesian(videoData.topLeft);
        const topRightCartesian = toCartesian(videoData.topRight);
        const bottomRightCartesian = toCartesian(videoData.bottomRight);
        const bottomLeftCartesian = toCartesian(videoData.bottomLeft);

        const videoCenterCartesian = cartesianMidpoint(topLeftCartesian, bottomRightCartesian);
        const target = toCartographic(videoCenterCartesian);
        const raisedTarget = raiseCartographic(target, videoData.camera.height);

        const cameraCartesian = toCartesian(videoData.camera);
        const targetCartesian = toCartesian(target);
        const raisedTargetCartesian = toCartesian(raisedTarget);

        const fromCameraToTarget = subtractCartesians(targetCartesian, cameraCartesian);
        const fromCameraToRaisedTarget = subtractCartesians(raisedTargetCartesian, cameraCartesian);

        const heading = calculateBearing(videoData.camera, target);
        const pitch = Cesium.Cartesian3.angleBetween(fromCameraToTarget, fromCameraToRaisedTarget);

        const leftMiddle = cartesianMidpoint(topLeftCartesian, bottomLeftCartesian);
        const rightMiddle = cartesianMidpoint(topRightCartesian, bottomRightCartesian);
        const desiredWidth = 1.5 * Cesium.Cartesian3.distance(leftMiddle, rightMiddle)

        const desiredCameraDistance = desiredWidth/TAN_ENABLED_FOV;
        const directionFromTargetToCamera = normalize(subtractCartesians(cameraCartesian, targetCartesian));

        const adjustedCameraPosition = addCartesians(targetCartesian, multiplyByScalar(directionFromTargetToCamera, desiredCameraDistance));

        this.viewer.camera.setView({
            destination: adjustedCameraPosition,
            orientation: {
                heading,
                pitch: -pitch,
                roll: 0,
            },
        });
    }
}