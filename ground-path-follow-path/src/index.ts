
const Cesium = require('cesium/Cesium');

require('cesium/Widgets/widgets.css');
require('./main.css');

import {ModelEntity} from './ModelEntity';

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


viewer.zoomTo(viewer.entities);

let ctr = 0;
let direction = 1;
let offset = 0;
const step = 0.00001;

const positions : Cesium.Cartographic[] = [];
for (let pctr=0; pctr<2000;pctr++) {
  ctr++;

  if (ctr > 50) {
    direction = -direction;
    ctr = 0;
  }
  offset += direction*step;
  const position = Cesium.Cartographic.fromDegrees(-79+offset, 44);
  positions.push(position);
}

var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
Cesium.when(promise, function(updatedCartographicPositions:Cesium.Cartographic[]) {
  let pctr = 0;
  setInterval(()=> {
    const cartographic = updatedCartographicPositions[pctr];
    const cartesian = Cesium.Cartographic.toCartesian(cartographic);
    milkTruck.update(cartesian);
    pctr++;
    if (pctr >= positions.length) {
      pctr = 0;
    }
  }, 200);

});







