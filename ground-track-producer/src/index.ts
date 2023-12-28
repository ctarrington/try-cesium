import {
  Ion,
  Viewer,
  createWorldTerrainAsync,
  createOsmBuildingsAsync,
  Cartesian3,
  Math,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import '../src/css/main.css';
import { ACCESS_TOKEN } from './dontcheckin';
import * as Cesium from 'cesium';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Ion.defaultAccessToken = ACCESS_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  baseLayerPicker: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.OpenStreetMapImageryProvider({
      url: 'https://tile.openstreetmap.org/',
    }),
  ),
});

// Fly the camera to San Francisco at the given longitude, latitude, and height.
const destination = Cartesian3.fromDegrees(-122.4175, 37.655, 300);
const orientation = {
  heading: Math.toRadians(17),
  pitch: Math.toRadians(-90),
  roll: 0.0,
};

viewer.camera.flyTo({
  destination,
  orientation,
});

// todo: use map instead of terrain X
// todo: add target marker
// todo: move the target but stay in road
