import { Ion, Viewer, createWorldTerrainAsync, createOsmBuildingsAsync, Cartesian3, Math } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import {ACCESS_TOKEN} from "./dontcheckin";

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = ACCESS_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  terrainProvider: await createWorldTerrainAsync()
});

// Add Cesium OSM Buildings, a global 3D buildings layer.
viewer.scene.primitives.add(await createOsmBuildingsAsync());   

// Fly the camera to San Francisco at the given longitude, latitude, and height.
viewer.camera.flyTo({
  destination : Cartesian3.fromDegrees(-122.4175, 37.655, 400),
  orientation : {
    heading : Math.toRadians(0.0),
    pitch : Math.toRadians(-15.0),
  }
});
