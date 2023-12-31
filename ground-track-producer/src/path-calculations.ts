// colors based on open street map by sampling the colors from a map
// no guarantee that these colors are long term stable
const outOfBoundsGray = [224, 223, 223];
const outOfBoundsBrown = [243, 239, 233];
const outOfBoundsGreen = [173, 209, 158];

const smallRoadWhite = [255, 255, 255];
const largeRoadYellow = [248, 250, 191];
const parkwayOrange = [252, 214, 164];
const highwayRed = [230, 145, 161];
const roadColors = [largeRoadYellow];

const isRoad = (data: Uint8ClampedArray, index: number) => {
  const red = data[index * 4];
  const green = data[index * 4 + 1];
  const blue = data[index * 4 + 2];

  for (const roadColor of roadColors) {
    if (
      Math.abs(red - roadColor[0]) < 5 &&
      Math.abs(green - roadColor[1]) < 5 &&
      Math.abs(blue - roadColor[2]) < 5
    ) {
      return true;
    }
  }

  return false;
};

export const findRoad = (data: Uint8ClampedArray, width: number) => {
  let leftIndex: number | null = null;
  let rightIndex: number | null = null;

  for (let cursor = 0; cursor < width; cursor++) {
    if (!leftIndex && isRoad(data, cursor)) {
      leftIndex = cursor;
    }

    if (!rightIndex && isRoad(data, width - cursor)) {
      rightIndex = width - cursor;
    }

    if (width - cursor === 0) {
      break;
    }

    if (leftIndex && rightIndex) {
      break;
    }
  }

  return { leftIndex, rightIndex };
};
