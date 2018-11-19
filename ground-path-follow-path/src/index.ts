
const Cesium = require('cesium/Cesium');

require('cesium/Widgets/widgets.css');
require('./main.css');

import {ModelEntity} from './ModelEntity';
import {generateCartographicGroundPath} from './CartographicGroundPath';
import {generateAirPursuitPath} from './AirPursuitPath';

var terrainProvider = Cesium.createWorldTerrain();
var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider : terrainProvider
});

const FPS = 33;

const scene = viewer.scene;
const camera = viewer.camera;

camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(-86.2891374, 40.3293046, 900.0)
});

//new Cesium.CesiumInspector('inspector', scene);


const milkTruck = new ModelEntity(viewer, 'assets/CesiumMilkTruck-kmc.glb');
const pursuitPlane = new ModelEntity(viewer, 'assets/Cesium_Air.glb', new Cesium.Cartesian3(1000,1000,1000), Cesium.Color.RED, 64);


const waypoints = [
  {position: Cesium.Cartographic.fromDegrees(-86.2891374, 40.3293046), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-86.295118, 40.356107), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-86.295118, 40.356107), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-86.295118, 40.336107), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-86.2891374, 40.336107), speed: 27},
];  // Chicago near the aquarium

// const initialPursuitPosition = Cesium.Cartesian3.fromDegrees(-86.2891374, 40.3293046, 400); // over
// const initialPursuitPosition = Cesium.Cartesian3.fromDegrees(-86.2891374, 40.335, 200);  // ahead
const initialPursuitPosition = Cesium.Cartesian3.fromDegrees(-86.2891374, 40.325, 400);  // behind

const pathPromise = generateCartographicGroundPath(terrainProvider, waypoints);

Cesium.when(pathPromise, function(updatedCartographicPositions:Cesium.Cartographic[]) {

  console.log('about to generate air path');
  const pursuitCartesianPositions = generateAirPursuitPath(updatedCartographicPositions, initialPursuitPosition, 60, 300,400);

  let pctr = 0;
  setInterval(()=> {
    const cartographic = updatedCartographicPositions[pctr];
    const cartesian = Cesium.Cartographic.toCartesian(cartographic);

    milkTruck.update(cartesian);
    pursuitPlane.update(pursuitCartesianPositions[pctr]);

    pctr++;
    if (pctr >= updatedCartographicPositions.length) {
      pctr = 0;
    }
  }, 33);

});







