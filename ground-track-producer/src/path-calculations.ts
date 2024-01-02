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

export const findRoad = (
  data: Uint8ClampedArray,
  width: number,
  rowIndex: number,
) => {
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
