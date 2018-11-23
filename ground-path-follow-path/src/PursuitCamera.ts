const Cesium = require('cesium/Cesium');

import {
    raiseCartesian,
    raiseCartographic,
    subtractCartesians,
    subtractCartographics,
    toCartesian,
    toCartographic
} from './cesium-helpers';
import {calculateBearing} from "./calculations";

export class PursuitCamera {
    camera: Cesium.Camera;
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;

    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.camera = viewer.camera;
        this.enabled = enabled;

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
    }

}