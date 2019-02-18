import {raiseCartesian, raiseCartographic, subtractCartesians, toCartesian} from "./cesium-helpers";

const Cesium = require('cesium/Cesium');

require('cesium/Widgets/widgets.css');
require('./main.css');

import {getToken} from './DoNotCheckin';
import {ModelEntity} from './ModelEntity';
import {PursuitCamera} from './PursuitCamera';
import {DataReader} from './DataReader';
import {DataLocator} from './DataLocator';

import {generateCartographicGroundPath, WayPoint} from './CartographicGroundPath';
import {generateAirPursuitPath} from './AirPursuitPath';
import {VelocityOrientedBillboard} from './VelocityOrientedBillboard';
import {VideoDrapedPolygon} from './VideoDrapedPolygon';
import {VideoFollowCamera} from './VideoFollowCamera';
import {ButtonBar} from './ButtonBar';

const socket = new WebSocket('ws://localhost:8015');
socket.binaryType = 'arraybuffer';

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('Opened connection to web socket server');
});

Cesium.Ion.defaultAccessToken = getToken();

const terrainProvider = Cesium.createWorldTerrain();
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider : terrainProvider
});

const pursuitCamera = new PursuitCamera(viewer);
const videoFollowCamera = new VideoFollowCamera(viewer);


const FPS = 30;

const {canvas, camera, scene} = viewer;

// Listen for messages and render image on PIP canvas
const pipCanvasElement: HTMLCanvasElement = document.getElementById('pip-canvas');
const pipDrawingContext = pipCanvasElement.getContext('2d');

const drawImageOnPIP = (msg: MessageEvent) => {
  console.log('Drawing image from message');
  console.log('msg.data:', msg.data);

  const image = document.createElement('img');

  image.onload = () => {
    pipCanvasElement.width = image.width;
    pipCanvasElement.height = image.height;
    pipDrawingContext.drawImage(image, 0, 0);
  };

  image.src = 'data:image/jpeg;base64,'+ Buffer.from(msg.data).toString('base64');
};

socket.addEventListener('message',  drawImageOnPIP);

//new Cesium.CesiumInspector('inspector', scene);

const videoElement : HTMLVideoElement = document.getElementsByTagName('video')[0];

const state = {
  positionPlaybackPaused: true,
  videoPlaybackPaused: true,
  showPursuit: false,
};

const buttonBar = new ButtonBar();
buttonBar.addToggle<boolean>(
    ['Play Position Data', 'Pause Position Data'],
    [true, false],
    (value)=>{state.positionPlaybackPaused = value; }
    );

buttonBar.addToggle<boolean>(
    ['Pursuit', 'Overhead'],
    [false, true],
    (value)=> {
        if (value) {
            videoFollowCamera.disable();
            pursuitCamera.enable();
        } else {
            pursuitCamera.disable();
        }
    }
);

buttonBar.addToggle<boolean>(
    ['Record', 'Stop'],
    [false, true],
    (value) => {
        if (value) {
            pursuitCamera.startRecording();
        } else {
            pursuitCamera.stopRecording();
            buttonBar.addButton('Download', ()=>{
                pursuitCamera.download();
            })
        }
    }
);

buttonBar.addToggle<boolean>(
    ['Play Video', 'Pause Video'],
    [true, false],
    (value)=> {
        if (value) {
            videoElement.pause();
            state.videoPlaybackPaused = true;
        } else {
            videoElement.play();
            state.videoPlaybackPaused = false;
        }
    }
);

buttonBar.addToggle<boolean>(
    ['Follow Video', 'Overhead'],
    [false, true],
    (value)=> {
        if (value) {
            pursuitCamera.disable();
            videoFollowCamera.enable();
        } else {
            videoFollowCamera.disable();
        }
    }
);

const milkTruck = new ModelEntity(viewer, 'assets/CesiumMilkTruck-kmc.glb');
const pursuitPlane = new ModelEntity(
    viewer,
    'assets/Cesium_Air.glb',
    new Cesium.Cartesian3(1000,1000,1000),
    Cesium.Color.RED,
    64);

const svgArrowLiteral = `
<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 25 L 15 5 L 8 12 M 15 5 L 22 12" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;
const pursuitBillboard = new VelocityOrientedBillboard(
    viewer,
    'data:image/svg+xml,'+encodeURIComponent(svgArrowLiteral),
    Cesium.Color.BLACK);

const waypoints : WayPoint[] = [
    {position:Cesium.Cartographic.fromDegrees(-115.654969, 32.773781)},
    {position:Cesium.Cartographic.fromDegrees(-115.655162, 32.781906)},
    {position:Cesium.Cartographic.fromDegrees(-115.663648, 32.781964)},
    {position:Cesium.Cartographic.fromDegrees(-115.663646, 32.784464)},
    {position:Cesium.Cartographic.fromDegrees(-115.6730646, 32.785064)},
];

const initialCameraCartographic = raiseCartographic(waypoints[0].position, waypoints[0].position.height+900);
camera.flyTo({
    destination : toCartesian(initialCameraCartographic),
});

const initialPursuitPosition = Cesium.Cartesian3.fromDegrees(-115.654960, 32.77377, 400.0);
const pathPromise = generateCartographicGroundPath(terrainProvider, waypoints);

Cesium.when(pathPromise, function(updatedCartographicPositions:Cesium.Cartographic[]) {

  const pursuitCartesianPositions = generateAirPursuitPath(updatedCartographicPositions, initialPursuitPosition, 75, 200,300);

  let pctr = 0;
  setInterval(()=> {
    if (state.positionPlaybackPaused) {
        return;
    }

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
  }, 1000/FPS);

});

const videoDrapedPolygon = new VideoDrapedPolygon(viewer, videoElement);
const dataReader = new DataReader('assets/recordedData.csv');
const dataLoadedPromise = dataReader.load();

Cesium.when(dataLoadedPromise, (rows:any[]) => {
    const dataLocator = new DataLocator(rows, 'elapsedMilliseconds');

    setInterval(()=> {
        if (state.videoPlaybackPaused) {
            return;
        }

        // TODO make new csv and get rid of 6800 offset
        const elapsedMilliseconds = videoElement.currentTime * 1000;
        const closestData = dataLocator.findClosestData(elapsedMilliseconds);
        videoDrapedPolygon.update(closestData);
        videoFollowCamera.update(closestData);
    }, 1000/FPS);
});







