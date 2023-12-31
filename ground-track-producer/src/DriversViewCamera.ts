import * as Cesium from 'cesium';
import { toCartographic } from './cesium-helpers';
import { calculateBearing } from './calculations';

export class DriversViewCamera {
  viewer: Cesium.Viewer;
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  heading: number;

  constructor(
    viewer: Cesium.Viewer,
    initialPosition: Cesium.Cartesian3,
    initialHeading: number,
  ) {
    this.viewer = viewer;

    const aspectRatio = viewer.canvas.clientWidth / viewer.canvas.clientHeight;
    const frustrum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.PI_OVER_TWO,
      aspectRatio,
    });
    this.viewer.camera.frustum = frustrum;

    this.position = initialPosition;
    this.previousPosition = initialPosition;
    this.heading = initialHeading;
  }

  update(destination: Cesium.Cartesian3) {
    this.previousPosition = this.position;
    this.position = destination;

    this.heading = calculateBearing(
      toCartographic(this.previousPosition),
      toCartographic(this.position),
    );
    this.viewer.camera.setView({
      destination,
      orientation: {
        heading: this.heading,
        pitch: Cesium.Math.toRadians(-65),
        roll: 0.0,
      },
    });
  }
}
