import * as Cesium from 'cesium';

// a pursuit view camera follows the target from the pursuit aircraft's perspective.
// See: https://community.cesium.com/t/viewer-camera-lookat-method-change-camera-heading-and-camera-pitch/8800/2

export class PursuitViewCamera {
  viewer: Cesium.Viewer;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;

    const aspectRatio = viewer.canvas.clientWidth / viewer.canvas.clientHeight;
    this.viewer.camera.frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.PI / 100,
      aspectRatio,
    });
  }

  update(cameraPosition: Cesium.Cartesian3, targetPosition: Cesium.Cartesian3) {
    const camera = this.viewer.camera;
    let direction = Cesium.Cartesian3.subtract(
      targetPosition,
      cameraPosition,
      new Cesium.Cartesian3(),
    );
    direction = Cesium.Cartesian3.normalize(direction, direction);
    camera.direction = direction;

    // get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
    let approxUp = Cesium.Cartesian3.normalize(
      cameraPosition,
      new Cesium.Cartesian3(),
    );

    // cross direction with approxUp to get a right normal
    let right = Cesium.Cartesian3.cross(
      direction,
      approxUp,
      new Cesium.Cartesian3(),
    );
    right = Cesium.Cartesian3.normalize(right, right);
    camera.right = right;

    // cross right with view dir to get an orthonormal up
    let up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
    up = Cesium.Cartesian3.normalize(up, up);
    camera.up = up;
    camera.position = cameraPosition;
  }
}
