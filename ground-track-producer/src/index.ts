import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import { VelocityOrientedBillboard } from './VelocityOrientedBillboard';

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
});

// Fly the camera to San Francisco at the given longitude, latitude, and height.
let currentDeltaLongitude = 0.00001;
let currentDeltaLatitude = 0.00001;
let currentLongitude = -76.90074;
let currentLatitude = 39.165914;
const cameraPosition = Cesium.Cartesian3.fromDegrees(
  currentLongitude,
  currentLatitude,
  300,
);
const targetPosition = Cesium.Cartesian3.fromDegrees(
  currentLongitude,
  currentLatitude,
  0,
);
const orientation = {
  heading: Cesium.Math.toRadians(13),
  pitch: Cesium.Math.toRadians(-90),
  roll: 0.0,
};

const svgArrowLiteral = `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 25 L 15 5 L 8 12 M 15 5 L 22 12" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;
const arrowBillboard = new VelocityOrientedBillboard(
  viewer,
  'data:image/svg+xml,' + encodeURIComponent(svgArrowLiteral),
  Cesium.Color.RED,
  targetPosition,
  50,
  50,
);

viewer.camera.flyTo({
  destination: cameraPosition,
  orientation,
});

setInterval(() => {
  if (Math.random() > 0.998) {
    currentDeltaLongitude = -currentDeltaLongitude;
  }

  if (Math.random() > 0.998) {
    currentDeltaLatitude = -currentDeltaLatitude;
  }

  currentLatitude += currentDeltaLatitude;
  currentLongitude += currentDeltaLongitude;
  const targetPosition = Cesium.Cartesian3.fromDegrees(
    currentLongitude,
    currentLatitude,
    0,
  );
  arrowBillboard.update(targetPosition);

  const cameraPosition = Cesium.Cartesian3.fromDegrees(
    currentLongitude,
    currentLatitude,
    300,
  );
  viewer.camera.setView({ destination: cameraPosition });
}, 33);

// todo: use map instead of terrain X
// todo: add target at center of map - needs to be at lat lon X
// todo: decrease fov?
// todo: move the target in an arbitrary direction
// todo: update camera along with the target
// todo: move the target but now stay in road
// todo: if needed, process the image to make calculations easier or send it to a server to do the processing
// todo: clean up controls - get rid of the cesium controls
