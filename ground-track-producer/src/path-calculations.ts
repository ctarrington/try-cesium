// colors based on open street map by sampling the colors from a map
// no guarantee that these colors are long term stable
const outOfBoundsGray = [224, 223, 223];
const outOfBoundsBrown = [243, 239, 233];
const outOfBoundsGreen = [173, 209, 158];
const outOfBoundsPink = [242, 218, 218];
const outOfBoundsColors = [
  outOfBoundsGray,
  outOfBoundsBrown,
  outOfBoundsGreen,
  outOfBoundsPink,
];

const smallRoadWhite = [255, 255, 255];
const largeRoadYellow = [248, 250, 191];
const parkwayOrange = [252, 214, 164];
const highwayRed = [230, 145, 161];
const roadColors = [largeRoadYellow, parkwayOrange, highwayRed];

enum SurfaceType {
  ROAD = 1,
  OUT_OF_BOUNDS,
  UNKNOWN,
}

// returns true if the color is within 5 of any of the specified colors
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

  for (let columnIndex = 0; columnIndex < width; columnIndex++) {
    const surfaceTupe = findSurfaceType(data, width, rowIndex, columnIndex);
    if (!leftIndex && surfaceTupe === SurfaceType.ROAD) {
      leftIndex = columnIndex;
    }

    if (leftIndex && surfaceTupe === SurfaceType.OUT_OF_BOUNDS) {
      rightIndex = columnIndex;
    }

    if (leftIndex && rightIndex) {
      break;
    }
  }

  return { leftIndex, rightIndex };
};
