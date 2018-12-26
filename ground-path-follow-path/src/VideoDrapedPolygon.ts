import {toCartesian} from './cesium-helpers';
import {CylinderEntity} from './CylinderEntity';

const Cesium = require('cesium/Cesium');

export class VideoDrapedPolygon {
    cornerCartesiansArray: Cesium.Cartesian3[];
    stRotation: number;
    topLeftMarker: CylinderEntity;
    topRightMarker: CylinderEntity;


    constructor(viewer:Cesium.Viewer, videoElement : HTMLVideoElement) {
        this.stRotation = 0;
        this.cornerCartesiansArray = Cesium.Cartesian3.fromDegreesArrayHeights([
            122, 45, 0,
            122.00001, 45, 0,
            122.00001, 44.99999, 0,
            122, 44.999999, 0
        ]);

        const polygon = viewer.entities.add({
            name : 'Video Polygon',
            polygon : {
                hierarchy : new Cesium.CallbackProperty(()=>{return {positions: this.cornerCartesiansArray};}, false),
                material: videoElement,
                stRotation: new Cesium.CallbackProperty(()=> this.stRotation, false),
            }
        });

        this.topLeftMarker = new CylinderEntity(viewer, 10, Cesium.Color.RED, 20, 0);
        this.topRightMarker = new CylinderEntity(viewer, 10, Cesium.Color.GREEN, 20, 0);
    }

    update(closestData: any) {
        this.cornerCartesiansArray = [
            toCartesian(closestData.topLeft),
            toCartesian(closestData.topRight),
            toCartesian(closestData.bottomRight),
            toCartesian(closestData.bottomLeft),
        ];
        
        this.topLeftMarker.update(toCartesian(closestData.topLeft));
        this.topRightMarker.update(toCartesian(closestData.topRight));

        const deltaY = closestData.topLeft.latitude - closestData.bottomLeft.latitude;
        const deltaX = closestData.topLeft.longitude - closestData.bottomLeft.longitude;

        const sideAngle = -Math.atan2(deltaY, deltaX);
        this.stRotation = sideAngle + Math.PI/2;
    }
}