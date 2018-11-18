
const Cesium = require('cesium/Cesium');

require('cesium/Widgets/widgets.css');
require('./main.css');

import {ModelEntity} from './ModelEntity';
import {generateCartographicGroundPath} from './CartographicGroundPath';

var terrainProvider = Cesium.createWorldTerrain();
var viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider : terrainProvider
});

const FPS = 33;

const scene = viewer.scene;
const camera = viewer.camera;

//new Cesium.CesiumInspector('inspector', scene);

console.log('yo');

const url = 'assets/CesiumMilkTruck-kmc.glb';

const milkTruck = new ModelEntity(viewer, url);

const waypoints = [
  {position: Cesium.Cartographic.fromDegrees(-87.620293, 41.867386), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-87.613071, 41.848496), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-87.626931, 41.847508), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-87.630465, 41.867419), speed: 27},
  {position: Cesium.Cartographic.fromDegrees(-87.620293, 41.867386), speed: 27},
];  // Chicago near the aquarium
const pathPromise = generateCartographicGroundPath(terrainProvider, waypoints);

Cesium.when(pathPromise, function(updatedCartographicPositions:Cesium.Cartographic[]) {
  let pctr = 0;
  setInterval(()=> {
    const cartographic = updatedCartographicPositions[pctr];
    const cartesian = Cesium.Cartographic.toCartesian(cartographic);

    console.log('cartographic: '+cartographic+' cartesian: '+cartesian);
    milkTruck.update(cartesian);
    pctr++;
    if (pctr >= updatedCartographicPositions.length) {
      pctr = 0;
      viewer.zoomTo(viewer.entities);
    }
  }, 200);

});







