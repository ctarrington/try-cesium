import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { PathCalculator } from './PathCalculator';
import { DriversViewCamera } from './DriversViewCamera';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const baseLayer = new Cesium.ImageryLayer(
  new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  }),
  {},
);

const viewer = new Cesium.Viewer('cesiumContainer', {
  baseLayerPicker: false,
  baseLayer,
  sceneModePicker: false,
  skyBox: false,
  animation: false,
  timeline: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  navigationHelpButton: false,
  shouldAnimate: false,
  targetFrameRate: 10,
});

// Fly the camera to San Francisco at the given longitude, latitude, and height.
let currentLongitude = -76.90074;
let currentLatitude = 39.165914;

const pathCalculator = new PathCalculator(
  viewer,
  currentLongitude,
  currentLatitude,
  10,
);

const driversViewCamera = new DriversViewCamera(
  viewer,
  pathCalculator.getPosition(),
  Cesium.Math.toRadians(0),
);

// let things settle down before we start updating the path and camera
setTimeout(() => {
  const startTime = Date.now();
  setInterval(() => {
    if (Date.now() - startTime > 1000 * 4) {
      pathCalculator.update();
    }
    const position = pathCalculator.getPosition();
    driversViewCamera.update(position);
  }, 1000 / 10);
}, 3000);

// todo: adjust the angle of the camera and fov until it is usable
// todo: clean up
// todo: move the target but now stay in road
// todo: if needed, process the image to make calculations easier or send it to a server to do the processing
// todo: clean up controls - get rid of the cesium controls
