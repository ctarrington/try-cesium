import * as Cesium from 'cesium';
import { raiseCartesian, terrainCartesianFromScreen } from './cesium-helpers';
import { Cartesian2 } from 'cesium';

// colors based on open street map by sampling the colors from a map
// no guarantee that these colors are long term stable
const outOfBoundsGray = [224, 223, 223];
const outOfBoundsBrown = [243, 239, 233];
const outOfBoundsGreen = [173, 209, 158];

const smallRoadWhite = [255, 255, 255];
const largeRoadYellow = [248, 250, 191];
const parkwayOrange = [252, 214, 164];
const highwayRed = [230, 145, 161];

const lookAheadDistance = 180;
const sampleHeight = 5;

export class PathCalculator {
  altitude: number;
  currentPosition: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  viewer: Cesium.Viewer;
  scene: Cesium.Scene;
  ctx2D: CanvasRenderingContext2D;
  stearingOffset: number;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
    altitude: number,
  ) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.altitude = altitude;
    this.stearingOffset = 0;

    this.currentPosition = Cesium.Cartesian3.fromDegrees(
      initialLongitude,
      initialLatitude,
      altitude,
    );
    this.previousPosition = this.currentPosition;

    const top = this.scene.canvas.height - lookAheadDistance - sampleHeight / 2;
    const canvas2D = document.createElement('canvas');
    canvas2D.style.position = 'absolute';
    canvas2D.style.top = '' + top + 'px';
    canvas2D.style.left = '0px';
    canvas2D.style.border = '1px solid black';
    canvas2D.style.marginTop = '30px';

    canvas2D.width = this.scene.canvas.width;
    canvas2D.height = sampleHeight;
    this.ctx2D = canvas2D.getContext('2d');
    document.body.appendChild(canvas2D);
  }

  getPosition() {
    return this.currentPosition;
  }

  update() {
    const canvas = this.scene.canvas;
    const width = canvas.width;
    const height = canvas.height;

    const centerX = width / 2;
    const sampleY = height - lookAheadDistance - sampleHeight / 2;

    const removePostRender = this.scene.postRender.addEventListener(() => {
      removePostRender();
      const image = new Image(width, height);

      image.src = this.scene.canvas.toDataURL('image/jpeg', 0.2);

      setTimeout(() => {
        this.ctx2D.drawImage(
          image,
          0,
          sampleY,
          width,
          sampleHeight,
          0,
          0,
          width,
          sampleHeight,
        );
      }, 0);
    });

    const newGroundPosition = terrainCartesianFromScreen(
      this.viewer,
      new Cartesian2(centerX + this.stearingOffset, height - lookAheadDistance),
    );

    if (newGroundPosition) {
      const newPosition = raiseCartesian(newGroundPosition, this.altitude);
      this.previousPosition = this.currentPosition;
      this.currentPosition = newPosition;
    }
  }
}
