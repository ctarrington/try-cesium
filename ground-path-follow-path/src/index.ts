
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

setInterval(()=> {
    ctr++;

    if (ctr > 50) {
        direction = -direction;
        ctr = 0;
    }
    offset += direction*step;
    const position = Cesium.Cartesian3.fromDegrees(-79+offset, 44, 300);
    milkTruck.update(position);
}, 200);







