import {
    addCartesians,
    cartesianMidpoint,
    cross,
    multiplyByScalar,
    normalize,
    raiseCartographic,
    subtractCartesians, terrainCartesianFromScreen,
    toCartesian,
    toCartographic
} from "./cesium-helpers";

import {calculateBearing} from './calculations';

import {VideoData} from './VideoData';

const Cesium = require('cesium/Cesium');

const ENABLED_FOV = Math.PI/20;
const DISABLED_FOV = Math.PI/4;
const TAN_ENABLED_FOV = Math.tan(ENABLED_FOV);
const DELTA_ROLL = Math.PI/50;

export class VideoFollowCamera {
    viewer: Cesium.Viewer;
    camera: Cesium.Camera;
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;
    roll: number;

    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.viewer = viewer;
        this.camera = viewer.camera;
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
    }

    enable() {
        this.enabled = true;
        this.camera.frustum = this.enabledFrustrum;
    }

    disable() {
        this.enabled = false;
        this.camera.frustum = this.disabledFrustrum;
    }

    calculateDeltaRoll(target: Cesium.Cartesian3, videoTopLeftToTopRight:Cesium.Cartesian3) {
        const screenTopLeftCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(0,0));
        const screenTopRightCartesian = terrainCartesianFromScreen(this.viewer, new Cesium.Cartesian2(this.viewer.canvas.clientWidth,0));

        if (!screenTopLeftCartesian || !screenTopRightCartesian) {
            return 0;
        }

        const screenTopLeftToTopRight = subtractCartesians(screenTopRightCartesian, screenTopLeftCartesian);

        const productOfMagnitudes = Cesium.Cartesian3.magnitude(videoTopLeftToTopRight) * Cesium.Cartesian3.magnitude(screenTopLeftToTopRight);
        const cosOfAngle = Cesium.Cartesian3.dot(screenTopLeftToTopRight, videoTopLeftToTopRight) / productOfMagnitudes;
        const angle = Math.acos(cosOfAngle);
        const deltaRoll = angle/2;

        // sign of delta roll is negative if the cross product is extruding out of the screen
        const crossProduct = cross(videoTopLeftToTopRight, screenTopLeftToTopRight);
        const popOutCenter = addCartesians(target, crossProduct);
        const height = toCartographic(popOutCenter).height;

        console.log('deltaRoll: '+deltaRoll+', height: '+height+', crossProduct: '+crossProduct);

        return (height > 0) ? -deltaRoll : deltaRoll;
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

        const videoTopLeftToTopRight = subtractCartesians(topRightCartesian, topLeftCartesian);

        this.roll += this.calculateDeltaRoll(videoCenterCartesian, videoTopLeftToTopRight);
        console.log('this.roll: '+this.roll);


        this.viewer.camera.setView({
            destination: adjustedCameraPosition,
            orientation: {
                heading,
                pitch: -pitch,
                roll:-this.roll,
            },
        });
    }
}