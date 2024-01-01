import * as Cesium from 'cesium';
import { raiseCartesian, terrainCartesianFromScreen } from './cesium-helpers';
import { Cartesian2 } from 'cesium';
import { findRoad } from './path-calculations';
import { clamp } from './calculations';

// A path calculator uses the view of the road ahead to calculate the next position.
// It copies the pixels from the cesium canvas to a 2D canvas and then scans the 2D canvas for the road.

// The following parameters were determined by trial and error.
// They are in pixels
const lookAheadDistance = 250;
const sampleHeight = 120;
const maxOffset = 4;

export class PathCalculator {
  altitude: number;
  currentPosition: Cesium.Cartesian3;
  viewer: Cesium.Viewer;
  ctx2D: CanvasRenderingContext2D;
  steeringGoal: number;
  readyToMove: boolean;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
    altitude: number,
  ) {
    this.viewer = viewer;
    this.altitude = altitude;
    this.steeringGoal = this.viewer.scene.canvas.width / 2;
    this.readyToMove = false;

    this.currentPosition = Cesium.Cartesian3.fromDegrees(
      initialLongitude,
      initialLatitude,
      altitude,
    );

    // Create a 2D canvas to sample the road ahead. Position it over the cesium canvas.
    const top =
      this.viewer.scene.canvas.height - lookAheadDistance - sampleHeight / 2;
    const canvas2D = document.createElement('canvas');
    canvas2D.style.position = 'absolute';
    canvas2D.style.top = '' + top + 'px';
    canvas2D.style.left = '0px';
    canvas2D.style.borderTop = '1px solid black';
    canvas2D.style.borderBottom = '1px solid black';
    canvas2D.width = this.viewer.scene.canvas.width;
    canvas2D.height = sampleHeight;
    this.ctx2D = canvas2D.getContext('2d', { willReadFrequently: true });
    document.body.appendChild(canvas2D);
  }

  getPosition() {
    return this.currentPosition;
  }

  update() {
    const canvas = this.viewer.scene.canvas;
    const width = canvas.width;
    const height = canvas.height;

    const centerX = width / 2;
    const sampleY = height - lookAheadDistance - sampleHeight / 2;

    const removePostRender = this.viewer.scene.postRender.addEventListener(
      () => {
        removePostRender();

        const image = new Image(width, height);
        image.src = this.viewer.scene.canvas.toDataURL('image/jpeg', 1.0);

        // The image source is not available immediately, so we need to wait for it to load
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

          let steeringGoal = this.steeringGoal;
          this.readyToMove = false;

          // Scan the 2D canvas from bottom to top, looking for the edges of the road.
          // Take the last edge found, which is the edge of the road furthest away from the current position.
          for (let rowIndex = sampleHeight - 1; rowIndex >= 0; rowIndex--) {
            const { leftIndex, rightIndex } = findRoad(data, width, rowIndex);
            if (rightIndex && leftIndex) {
              steeringGoal = leftIndex;
              this.readyToMove = true;
              this.ctx2D.fillRect(leftIndex, rowIndex, 1, 1);
              this.ctx2D.fillRect(rightIndex, rowIndex, 1, 1);
            }
          }
          this.steeringGoal = steeringGoal;
        }, 0);
      },
    );

    // Calculate the offset from the center of the road.
    let offset = clamp(-maxOffset, maxOffset, this.steeringGoal - centerX);

    if (this.readyToMove) {
      const newGroundPosition = terrainCartesianFromScreen(
        this.viewer,
        new Cartesian2(centerX + offset, height - lookAheadDistance),
      );

      if (newGroundPosition) {
        this.currentPosition = raiseCartesian(newGroundPosition, this.altitude);
      }
    }
  }
}
