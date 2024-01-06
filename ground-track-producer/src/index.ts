import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { RoadFollowingPathCalculator } from './RoadFollowingPathCalculator';
import { DriversViewCamera } from './DriversViewCamera';
import { VelocityOrientedBillboard } from './VelocityOrientedBillboard';
import { dropBreadcrumb } from './cesium-helpers';
import { AirPursuitPathCalculator } from './AirPursuitPathCalculator';

// Overall logic for the ground track producer.
// A driver's view camera is updated with the current position and builds a view of the road ahead.
// A path calculator uses the view of the road ahead to calculate the next position.
// This module is responsible for the cesium setup and the animation loop

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const FPS = 10;
const overheadAltitude = 5000;
const pursuitAltitude = 1000;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const baseLayer = new Cesium.ImageryLayer(
  new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
  }),
  {},
);

const driversViewer = new Cesium.Viewer('driversViewContainer', {
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

const roadFollowingPathCalculator = new RoadFollowingPathCalculator(
  driversViewer,
  currentLongitude,
  currentLatitude,
  50,
);

const initialAirPursuitPosition = Cesium.Cartesian3.fromDegrees(
  -76.9,
  39.15,
  pursuitAltitude,
);
const airPursuitPathCalculator = new AirPursuitPathCalculator(
  initialAirPursuitPosition,
  20,
  1000,
  1500,
  roadFollowingPathCalculator.getPosition(),
);

// start with an initial heading of zero degrees
const driversViewCamera = new DriversViewCamera(
  driversViewer,
  roadFollowingPathCalculator.getPosition(),
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
  roadFollowingPathCalculator.getPosition(),
);

const aircraft = new VelocityOrientedBillboard(
  overheadViewer,
  airPursuitPathCalculator.getPosition(),
  25,
  25,
  Cesium.Color.BLUE,
);

let tick = 0;
setInterval(() => {
  roadFollowingPathCalculator.update();
  const position = roadFollowingPathCalculator.getPosition();

  airPursuitPathCalculator.update(position);
  driversViewCamera.update(position);
  vehicle.update(position);
  aircraft.update(airPursuitPathCalculator.getPosition());

  if (tick % 111 === 0) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    currentLongitude = Cesium.Math.toDegrees(cartographic.longitude);
    currentLatitude = Cesium.Math.toDegrees(cartographic.latitude);

    if (roadFollowingPathCalculator.getReadyToMove()) {
      overheadViewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          currentLongitude,
          currentLatitude,
          overheadAltitude,
        ),
      });
      dropBreadcrumb(overheadViewer, position, Cesium.Color.RED);
      dropBreadcrumb(
        overheadViewer,
        airPursuitPathCalculator.getPosition(),
        Cesium.Color.BLUE,
      );
    }
  }
}, 1000 / FPS);

// todo: add a pursuit view, camera and path calculator
// todo: add entity for car

// todo: add more states: waiting, moving, lost
// todo: figure out speed
// todo: take the middle road from a list of roads
// todo: reverse the path when stuck
// todo: enter a new starting position
// todo: stabilize the path
// todo: download waypoints
// todo: host on github pages
// todo: move to anthem and refactor to a set of folders - producer, server, consumer
