import * as Cesium from 'cesium';

export class DriversViewCamera {
  viewer: Cesium.Viewer;
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  heading: number;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
    initialHeading: number,
  ) {
    this.viewer = viewer;

    const aspectRatio = viewer.canvas.clientWidth / viewer.canvas.clientHeight;
    const frustrum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.PI_OVER_TWO,
      aspectRatio,
    });
    this.viewer.camera.frustum = frustrum;

    const initialPosition = this.calculatePosition(
      initialLongitude,
      initialLatitude,
    );
    this.position = initialPosition;
    this.previousPosition = initialPosition;
    this.heading = initialHeading;
  }

  calculatePosition(currentLongitude: number, currentLatitude: number) {
    return Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 3);
  }

  update(longitude: number, latitude: number) {
    this.previousPosition = this.position;
    this.position = this.calculatePosition(longitude, latitude);
    this.viewer.camera.setView({
      destination: this.position,
      orientation: {
        heading: this.heading,
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
    });
  }
}
