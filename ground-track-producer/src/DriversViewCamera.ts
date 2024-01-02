import * as Cesium from 'cesium';
import { toCartographic } from './cesium-helpers';
import { calculateBearing } from './calculations';

// A driver's view camera is a Cesium camera that looks at the road ahead based on the current and previous positions.

const PITCH = -75;

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
    this.viewer.camera.frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.PI_OVER_TWO,
      aspectRatio,
    });

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
        pitch: Cesium.Math.toRadians(PITCH),
        roll: 0.0,
      },
    });
  }
}
