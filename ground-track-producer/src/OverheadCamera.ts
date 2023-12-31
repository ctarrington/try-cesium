import * as Cesium from 'cesium';

export class OverheadCamera {
  viewer: Cesium.Viewer;
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
  ) {
    this.viewer = viewer;
    const initialPosition = this.calculatePosition(
      initialLongitude,
      initialLatitude,
    );
    this.position = initialPosition;
    this.previousPosition = initialPosition;
  }

  calculatePosition(currentLongitude: number, currentLatitude: number) {
    return Cesium.Cartesian3.fromDegrees(
      currentLongitude,
      currentLatitude,
      100,
    );
  }

  update(longitude: number, latitude: number) {
    this.previousPosition = this.position;
    this.position = this.calculatePosition(longitude, latitude);
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
