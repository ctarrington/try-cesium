import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { VelocityOrientedBillboard } from './VelocityOrientedBillboard';
import { OverheadCamera } from './OverheadCamera';
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
const cameraPosition = Cesium.Cartesian3.fromDegrees(
  currentLongitude,
  currentLatitude,
  100,
);
const targetPosition = Cesium.Cartesian3.fromDegrees(
  currentLongitude,
  currentLatitude,
  0,
);

const svgCircleLiteral = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="13" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;
const circleBillboard = new VelocityOrientedBillboard(
  viewer,
  'data:image/svg+xml,' + encodeURIComponent(svgCircleLiteral),
  Cesium.Color.RED,
  targetPosition,
  200,
  200,
);

const driversViewCamera = new DriversViewCamera(
  viewer,
  currentLongitude,
  currentLatitude,
  Cesium.Math.toRadians(0),
);
const pathCalculator = new PathCalculator(
  viewer.scene,
  currentLongitude,
  currentLatitude,
);

setInterval(() => {
  pathCalculator.update();
  currentLongitude = pathCalculator.getLongitude();
  currentLatitude = pathCalculator.getLatitude();
  const targetPosition = Cesium.Cartesian3.fromDegrees(
    currentLongitude,
    currentLatitude,
    0,
  );
  circleBillboard.update(targetPosition);

  driversViewCamera.update(currentLongitude, currentLatitude);
}, 33);

// todo: move the camera based on the current heading
// todo: adjust the angle of the camera and fov until it is usable
// todo: clean up
// todo: move the target but now stay in road
// todo: if needed, process the image to make calculations easier or send it to a server to do the processing
// todo: clean up controls - get rid of the cesium controls
