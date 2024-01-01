import * as Cesium from 'cesium';
import { raiseCartesian, terrainCartesianFromScreen } from './cesium-helpers';
import { Cartesian2 } from 'cesium';
import { findRoad } from './path-calculations';

const lookAheadDistance = 250;
const sampleHeight = 1;

export class PathCalculator {
  altitude: number;
  currentPosition: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  viewer: Cesium.Viewer;
  scene: Cesium.Scene;
  ctx2D: CanvasRenderingContext2D;
  stearingGoal: number;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
    altitude: number,
  ) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.altitude = altitude;
    this.stearingGoal = this.scene.canvas.width / 2;

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
    this.ctx2D = canvas2D.getContext('2d', { willReadFrequently: true });
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

      image.src = this.scene.canvas.toDataURL('image/jpeg', 1.0);

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

        const data = this.ctx2D.getImageData(0, 0, width, sampleHeight).data;
        const { leftIndex, rightIndex } = findRoad(data, width);
        if (rightIndex && leftIndex) {
          this.stearingGoal = (rightIndex + leftIndex) / 2;
          this.ctx2D.fillRect(leftIndex, 0, 5, sampleHeight);
          this.ctx2D.fillRect(rightIndex, 0, 5, sampleHeight);
        }
      }, 0);
    });

    let offset = this.stearingGoal - centerX;
    if (offset > 0) {
      offset = 2;
    } else if (offset < 0) {
      offset = -2;
    }

    const newGroundPosition = terrainCartesianFromScreen(
      this.viewer,
      new Cartesian2(centerX + offset, height - lookAheadDistance),
    );

    if (newGroundPosition) {
      const newPosition = raiseCartesian(newGroundPosition, this.altitude);
      this.previousPosition = this.currentPosition;
      this.currentPosition = newPosition;
    }
  }
}
