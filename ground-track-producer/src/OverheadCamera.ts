import * as Cesium from 'cesium';

export class OverheadCamera {
  viewer: Cesium.Viewer;
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;

  constructor(viewer: Cesium.Viewer, initialPosition: Cesium.Cartesian3) {
    this.viewer = viewer;
    this.position = initialPosition;
    this.previousPosition = initialPosition;
  }

  update(position: Cesium.Cartesian3) {
    this.previousPosition = this.position;
    this.position = position;
    this.viewer.camera.setView({
      destination: this.position,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0,
      },
    });
  }
}
