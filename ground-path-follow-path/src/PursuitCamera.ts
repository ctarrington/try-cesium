import {CylinderEntity} from "./CylinderEntity";

const Cesium = require('cesium/Cesium');

const createMarker = (viewer: Cesium.Viewer, color:Cesium.Color) => {
    return new CylinderEntity(viewer, 10, color, 4, 0);
}

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
    viewer: Cesium.Viewer;
    camera: Cesium.Camera;
    enabled: boolean;
    disabledFrustrum: Cesium.PerspectiveFrustum;
    enabledFrustrum: Cesium.PerspectiveFrustum;
    topLeftMarker: CylinderEntity;
    topRightMarker: CylinderEntity;
    bottomRightMarker: CylinderEntity;
    bottomLeftMarker: CylinderEntity;



    constructor(viewer: Cesium.Viewer, enabled:boolean = false) {
        this.viewer = viewer;
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

        this.topLeftMarker = createMarker(viewer, Cesium.Color.RED);
        this.topRightMarker = createMarker(viewer, Cesium.Color.GREEN);
        this.bottomRightMarker = createMarker(viewer, Cesium.Color.BLUE);
        this.bottomLeftMarker = createMarker(viewer, Cesium.Color.YELLOW);

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

        this.topLeftMarker.update(this.camera.pickEllipsoid(new Cesium.Cartesian2(0,0)));
        this.topRightMarker.update(this.camera.pickEllipsoid(new Cesium.Cartesian2(this.viewer.canvas.clientWidth,0)));
        this.bottomRightMarker.update(this.camera.pickEllipsoid(new Cesium.Cartesian2(this.viewer.canvas.clientWidth,this.viewer.canvas.clientHeight)));
        this.bottomLeftMarker.update(this.camera.pickEllipsoid(new Cesium.Cartesian2(0,this.viewer.canvas.clientHeight)));


    }

}