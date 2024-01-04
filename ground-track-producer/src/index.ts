import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { PathCalculator } from './PathCalculator';
import { DriversViewCamera } from './DriversViewCamera';
import { VelocityOrientedBillboard } from './VelocityOrientedBillboard';

// Overall logic for the ground track producer.
// A driver's view camera is updated with the current position and builds a view of the road ahead.
// A path calculator uses the view of the road ahead to calculate the next position.
// This module is responsible for the cesium setup and the animation loop

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const FPS = 20;
const overheadAltitude = 3000;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const baseLayer = new Cesium.ImageryLayer(
  new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  }),
  {},
);

const viewer = new Cesium.Viewer('driversViewContainer', {
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

const overheadViewer = new Cesium.Viewer('overheadViewContainer', {});
// Sanner Road, Columbia, MD
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

const overheadCamera = overheadViewer.scene.camera;
overheadCamera.setView({
  destination: Cesium.Cartesian3.fromDegrees(
    currentLongitude,
    currentLatitude,
    overheadAltitude,
  ),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-90),
    roll: 0.0,
  },
});

const vehicle = new VelocityOrientedBillboard(
  overheadViewer,
  pathCalculator.getPosition(),
);

let tick = 0;
setInterval(() => {
  pathCalculator.update();
  const position = pathCalculator.getPosition();
  driversViewCamera.update(position);
  vehicle.update(position);
  if (tick % 111 === 0) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    currentLongitude = Cesium.Math.toDegrees(cartographic.longitude);
    currentLatitude = Cesium.Math.toDegrees(cartographic.latitude);
    overheadViewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        currentLongitude,
        currentLatitude,
        overheadAltitude,
      ),
    });
  }
}, 1000 / FPS);

// todo: add an overhead view with a wide field of view and billboards for the path
// todo: source maps
// todo: stop and spin if there is no road ahead
// todo: take the middle road from a list of roads
// todo: enter a new starting position
// todo: download waypoints
// todo: host on github pages
// todo: move to anthem and refactor to a set of folders - producer, server, consumer
