import * as Cesium from 'cesium';

// colors based on open street map by sampling the colors from a map
// no guarantee that these colors are long term stable
const outOfBoundsGray = [224, 223, 223];
const outOfBoundsBrown = [243, 239, 233];
const outOfBoundsGreen = [173, 209, 158];

const smallRoadWhite = [255, 255, 255];
const largeRoadYellow = [248, 250, 191];
const parkwayOrange = [252, 214, 164];
const highwayRed = [230, 145, 161];

export class PathCalculator {
  currentLongitude: number;
  currentLatitude: number;
  previousLongitude: number;
  previousLatitude: number;
  scene: Cesium.Scene;
  radius: number;
  ctx2D: CanvasRenderingContext2D;

  constructor(
    scene: Cesium.Scene,
    initialLongitude: number,
    initialLatitude: number,
  ) {
    this.scene = scene;
    this.currentLongitude = initialLongitude;
    this.currentLatitude = initialLatitude;
    this.previousLongitude = initialLongitude;
    this.previousLatitude = initialLatitude;

    this.radius = 100;
    const canvas2D = document.createElement('canvas');
    canvas2D.style.position = 'absolute';
    canvas2D.style.top = '0px';
    canvas2D.style.left = '0px';
    canvas2D.style.zIndex = '100';
    canvas2D.style.border = '1px solid black';

    canvas2D.width = this.radius * 2;
    canvas2D.height = this.radius * 2;
    this.ctx2D = canvas2D.getContext('2d');
    document.body.appendChild(canvas2D);
  }

  getLongitude() {
    return this.currentLongitude;
  }

  getLatitude() {
    return this.currentLatitude;
  }

  update() {
    const canvas = this.scene.canvas;
    const width = canvas.width;
    const height = canvas.height;

    const radius = this.radius;
    const centerX = width / 2;
    const centerY = height / 2;
    const topLeftX = centerX - radius;
    const topLeftY = centerY - radius;

    const removePostRender = this.scene.postRender.addEventListener(() => {
      removePostRender();
      const image = new Image(width, height);

      image.src = this.scene.canvas.toDataURL('image/jpeg', 0.2);

      this.ctx2D.drawImage(
        image,
        topLeftX,
        topLeftY,
        2 * radius,
        2 * radius,
        0,
        0,
        2 * radius,
        2 * radius,
      );
    });

    this.previousLongitude = this.currentLongitude;
    this.previousLatitude = this.currentLatitude;
    this.currentLongitude += 0.000001;
    this.currentLatitude += 0.000001;
  }
}
