import * as Cesium from 'cesium';
import { raiseCartesian, terrainCartesianFromScreen } from './cesium-helpers';
import { Cartesian2 } from 'cesium';
import { clamp } from './calculations';

// A road following path calculator uses the view of the road ahead to calculate the next position.
// It copies the pixels from the cesium canvas to a 2D canvas and then scans the 2D canvas for the road.

// The following parameters were determined by trial and error.
// They are in pixels
const lookAheadDistance = 290;
const sampleHeight = 120;
const maxOffset = 5;

export class RoadFollowingPathCalculator {
  currentPosition: Cesium.Cartesian3;
  viewer: Cesium.Viewer;
  ctx2D: CanvasRenderingContext2D;
  steeringGoal: number;
  readyToMove: boolean;
  lastUpdateTime: number;

  constructor(
    viewer: Cesium.Viewer,
    initialLongitude: number,
    initialLatitude: number,
  ) {
    this.viewer = viewer;
    this.steeringGoal = this.viewer.scene.canvas.width / 2;
    this.readyToMove = false;
    this.lastUpdateTime = Date.now();

    this.currentPosition = Cesium.Cartesian3.fromDegrees(
      initialLongitude,
      initialLatitude,
      0,
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

  getReadyToMove() {
    return this.readyToMove;
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
              steeringGoal = rightIndex;
              this.readyToMove = true;
              this.ctx2D.fillRect(leftIndex, rowIndex, 1, 1);
              this.ctx2D.fillRect(rightIndex, rowIndex, 1, 1);
            }
          }
          this.steeringGoal = steeringGoal - 7;
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
        this.currentPosition = newGroundPosition;
        this.lastUpdateTime = Date.now();
      }
    }
  }
}

// Utility functions for finding the road in a map image

// colors based on open street map by sampling the colors from a map
// no guarantee that these colors are long term stable
const outOfBoundsGray = [224, 223, 223];
const outOfBoundsBrown = [243, 239, 233];
const outOfBoundsGreen = [173, 209, 158];
const outOfBoundsYellow = [238, 240, 213];
const outOfBoundsYellow2 = [255, 255, 229];
const outOfBoundsPink = [242, 218, 218];
const outOfBoundsPink2 = [255, 214, 210];
const outOfBoundsColors = [
  outOfBoundsGray,
  outOfBoundsBrown,
  outOfBoundsGreen,
  outOfBoundsYellow,
  outOfBoundsYellow2,
  outOfBoundsPink,
  outOfBoundsPink2,
];

// const smallRoadWhite = [255, 255, 255];
const largeRoadYellow = [248, 250, 191];
const parkwayOrange = [252, 214, 164];
const parkwayOrange2 = [249, 178, 156];
const highwayRed = [230, 145, 161];
const roadColors = [largeRoadYellow, parkwayOrange, parkwayOrange2, highwayRed];

enum SurfaceType {
  ROAD = 1,
  OUT_OF_BOUNDS,
  UNKNOWN,
}

// returns true if the color is close to any of the specified colors
const includesColorMatch = (
  colors: number[][],
  data: Uint8ClampedArray,
  width: number,
  rowIndex: number,
  columnIndex: number,
): boolean => {
  const startIndex = rowIndex * width * 4 + columnIndex * 4;
  const red = data[startIndex];
  const green = data[startIndex + 1];
  const blue = data[startIndex + 2];

  for (const color of colors) {
    if (
      Math.abs(red - color[0]) < 5 &&
      Math.abs(green - color[1]) < 5 &&
      Math.abs(blue - color[2]) < 5
    ) {
      return true;
    }
  }
};

const findSurfaceType = (
  data: Uint8ClampedArray,
  width: number,
  rowIndex: number,
  columnIndex: number,
): SurfaceType => {
  if (includesColorMatch(roadColors, data, width, rowIndex, columnIndex)) {
    return SurfaceType.ROAD;
  }

  if (
    includesColorMatch(outOfBoundsColors, data, width, rowIndex, columnIndex)
  ) {
    return SurfaceType.OUT_OF_BOUNDS;
  }

  return SurfaceType.UNKNOWN;
};

const findRoad = (data: Uint8ClampedArray, width: number, rowIndex: number) => {
  let leftIndex: number | null = null;
  let rightIndex: number | null = null;

  for (let columnIndex = width - 1; columnIndex > 0; columnIndex--) {
    const surfaceType = findSurfaceType(data, width, rowIndex, columnIndex);
    if (!rightIndex && surfaceType === SurfaceType.ROAD) {
      rightIndex = columnIndex;
    }

    if (rightIndex && surfaceType === SurfaceType.OUT_OF_BOUNDS) {
      leftIndex = columnIndex;
    }

    if (leftIndex && rightIndex) {
      break;
    }
  }

  return { leftIndex, rightIndex };
};
