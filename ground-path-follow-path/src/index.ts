import {raiseCartesian, subtractCartesians} from "./cesium-helpers";

const Cesium = require('cesium/Cesium');

require('cesium/Widgets/widgets.css');
require('./main.css');

import {ModelEntity} from './ModelEntity';
import {PursuitCamera} from './PursuitCamera';

import {generateCartographicGroundPath} from './CartographicGroundPath';
import {generateAirPursuitPath} from './AirPursuitPath';
import {VelocityOrientedBillboard} from "./VelocityOrientedBillboard";

const terrainProvider = Cesium.createWorldTerrain();
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider : terrainProvider
});

const FPS = 33;

const {canvas, camera, scene} = viewer;

//new Cesium.CesiumInspector('inspector', scene);


const milkTruck = new ModelEntity(viewer, 'assets/CesiumMilkTruck-kmc.glb');
const pursuitPlane = new ModelEntity(viewer, 'assets/Cesium_Air.glb', new Cesium.Cartesian3(1000,1000,1000), Cesium.Color.RED, 64);

const svgLiteral = `
<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 25 L 15 5 L 8 12 M 15 5 L 22 12" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;
const pursuitBillboard = new VelocityOrientedBillboard(
    viewer,
    'data:image/svg+xml,'+encodeURIComponent(svgLiteral),
    Cesium.Color.BLACK);


const waypoints = [
    {position:Cesium.Cartographic.fromDegrees(-115.654969, 32.773781), speed: 27},
    {position:Cesium.Cartographic.fromDegrees(-115.663605, 32.773777), speed: 27},
    {position:Cesium.Cartographic.fromDegrees(-115.663647, 32.782038), speed: 27},
    {position:Cesium.Cartographic.fromDegrees(-115.680752, 32.782039), speed: 27},
];

camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(-115.654969, 32.773781, 1200.0)
});

const initialPursuitPosition = Cesium.Cartesian3.fromDegrees(-115.654969, 32.77377, 400.0);

const pathPromise = generateCartographicGroundPath(terrainProvider, waypoints);

Cesium.when(pathPromise, function(updatedCartographicPositions:Cesium.Cartographic[]) {

  const pursuitCartesianPositions = generateAirPursuitPath(updatedCartographicPositions, initialPursuitPosition, 40, 200,300);
  const pursuitCamera = new PursuitCamera(viewer);

  let pctr = 0;
  setInterval(()=> {
    const cartographic = updatedCartographicPositions[pctr];
    const cartesian = Cesium.Cartographic.toCartesian(cartographic);

    milkTruck.update(cartesian);
    pursuitPlane.update(pursuitCartesianPositions[pctr]);
    pursuitCamera.update(cartesian, pursuitCartesianPositions[pctr]);
    pursuitBillboard.update(raiseCartesian(pursuitCartesianPositions[pctr], 0));

    pctr++;
    if (pctr >= updatedCartographicPositions.length-1) {
      pctr = 0;
    }
  }, 33);

  let pursuitEnabled = false;
  setInterval(()=>{
      if (!pursuitEnabled) {
          pursuitCamera.enable();
          pursuitEnabled = true;
      } else {
          pursuitCamera.disable();
          pursuitEnabled = false;
      }
  }, 5000);

});







