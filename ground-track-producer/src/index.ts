import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { PathCalculator } from './PathCalculator';
import { DriversViewCamera } from './DriversViewCamera';

// Overall logic for the ground track producer.
// A driver's view camera is updated with the current position and builds a view of the road ahead.
// A path calculator uses the view of the road ahead to calculate the next position.
// This module is responsible for the cesium setup and the animation loop

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const FPS = 20;

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

let currentLongitude = -76.90074;
let currentLatitude = 39.165914;

const pathCalculator = new PathCalculator(
  viewer,
  currentLongitude,
  currentLatitude,
  50,
);

// start with an initial heading of zero degrees
const driversViewCamera = new DriversViewCamera(
  viewer,
  pathCalculator.getPosition(),
  Cesium.Math.toRadians(0),
);

setInterval(() => {
  pathCalculator.update();
  const position = pathCalculator.getPosition();
  driversViewCamera.update(position);
}, 1000 / FPS);

// todo: clean up, verify and tweak the constants
// todo: source maps
// todo: maybe drive on the right side of the road???
// todo: stop and spin if there is no road ahead
// todo: refactor to a set of folders - producer, server, consumer
