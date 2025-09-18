import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { RoadFollowingPathCalculator } from './RoadFollowingPathCalculator';
import { DriversViewCamera } from './DriversViewCamera';
import { VelocityOrientedBillboard } from './VelocityOrientedBillboard';
import { dropBreadcrumb, raiseCartesian } from './cesium-helpers';
import { AirPursuitPathCalculator } from './AirPursuitPathCalculator';
import { PursuitViewCamera } from './PursuitViewCamera';
import { ModelEntity } from './ModelEntity';
import { storeImage, storeMetadata } from './storage';

// Overall logic for the ground track producer.
// A driver's view camera is updated with the current position and builds a view of the road ahead.
// A path calculator uses the view of the road ahead to calculate the next position.
// The overhead view slowly follows the current position of the vehicle. It also shows the air pursuit path.

// This module is responsible for the cesium setup and the animation loop

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const FPS = 5;
const overheadAltitude = 5000;
const pursuitAltitude = 1000;

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

const pursuitViewer = new Cesium.Viewer('pursuitViewContainer', {
  baseLayerPicker: false,
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

// Maple Lawn, MD
// let currentLongitude = -76.90074;
// let currentLatitude = 39.165914;

// Liberty Township, Missouri
//let currentLongitude = -92.410859;
//let currentLatitude = 37.783029;

// Havover, MD
let currentLongitude = -76.736939;
let currentLatitude = 39.212812;

const roadFollowingPathCalculator = new RoadFollowingPathCalculator(
  driversViewer,
  currentLongitude,
  currentLatitude,
);

const initialAirPursuitPosition = Cesium.Cartesian3.fromDegrees(
  currentLongitude + 0.01,
  currentLatitude + 0.001,
  pursuitAltitude,
);
const airPursuitPathCalculator = new AirPursuitPathCalculator(
  initialAirPursuitPosition,
  20,
  1000,
  1500,
);

// start with an initial heading of zero degrees
const driversViewCamera = new DriversViewCamera(
  driversViewer,
  roadFollowingPathCalculator.getPosition(),
  Cesium.Math.toRadians(0),
);

const pursuitViewCamera = new PursuitViewCamera(pursuitViewer);

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

const vehicle2 = new VelocityOrientedBillboard(
  driversViewer,
  roadFollowingPathCalculator.getPosition(),
  50,
  50,
  Cesium.Color.RED,
);

const milkTruck = new ModelEntity(
  pursuitViewer,
  'assets/CesiumMilkTruck-kmc.glb',
);

const aircraft = new VelocityOrientedBillboard(
  overheadViewer,
  airPursuitPathCalculator.getPosition(),
  50,
  50,
  Cesium.Color.BLUE,
);

let tick = 0;
setInterval(() => {
  roadFollowingPathCalculator.update();
  const floatingPosition = roadFollowingPathCalculator.getPosition();
  const position = raiseCartesian(floatingPosition, 0);

  airPursuitPathCalculator.update(position);
  driversViewCamera.update(floatingPosition);
  vehicle.update(position);
  vehicle2.update(position);
  milkTruck.update(position);
  aircraft.update(airPursuitPathCalculator.getPosition());

  const metadata = pursuitViewCamera.update(
    airPursuitPathCalculator.getPosition(),
    position,
  );

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
      dropBreadcrumb(overheadViewer, position, Cesium.Color.WHITE);
      dropBreadcrumb(
        overheadViewer,
        raiseCartesian(airPursuitPathCalculator.getPosition(), 0),
        Cesium.Color.BLUE,
      );
    }
  }

  if (tick % 2 === 0) {
    pursuitViewer.render();
    pursuitViewer.canvas.toBlob((blob) => {
      storeImage(blob, tick);
    });

    storeMetadata(metadata, tick);
  }

  tick += 1;
}, 1000 / FPS);

// todo: add a sensor overlay view
// todo: add a drape view

// todo: add more states: waiting, moving, lost
// todo: figure out speed
// todo: take the middle road from a list of roads
// todo: reverse the path when stuck
// todo: enter a new starting position
// todo: stabilize the path
// todo: download waypoints
// todo: host on github pages
// todo: move to anthem and refactor to a set of folders - producer, server, consumer
