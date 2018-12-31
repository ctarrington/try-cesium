import {toCartesian} from './cesium-helpers';
import {CylinderEntity} from './CylinderEntity';
import {VideoData} from './VideoData';

const Cesium = require('cesium/Cesium');

export class VideoDrapedPolygon {
    cornerCartesians: Cesium.Cartesian3[];
    stRotation: number;
    topLeftMarker: CylinderEntity;
    topRightMarker: CylinderEntity;


    constructor(viewer:Cesium.Viewer, videoElement : HTMLVideoElement) {
        this.stRotation = 0;
        this.cornerCartesians = Cesium.Cartesian3.fromDegreesArrayHeights([
            122, 45, 0,
            122.00001, 45, 0,
            122.00001, 44.99999, 0,
            122, 44.999999, 0
        ]);

        const polygon = viewer.entities.add(new Cesium.Entity({
            name : 'Video Polygon',
            polygon : new Cesium.PolygonGraphics({
                hierarchy : new Cesium.CallbackProperty(()=>{return {positions: this.cornerCartesians};}, false),
                material : videoElement,
                stRotation: new Cesium.CallbackProperty(()=> this.stRotation, false),
            }),
        })
        );

        this.topLeftMarker = new CylinderEntity(viewer, 10, Cesium.Color.RED, 20, 0);
        this.topRightMarker = new CylinderEntity(viewer, 10, Cesium.Color.GREEN, 20, 0);
    }

    update(videoData: VideoData) {
        this.cornerCartesians = [
            toCartesian(videoData.topLeft),
            toCartesian(videoData.topRight),
            toCartesian(videoData.bottomRight),
            toCartesian(videoData.bottomLeft),
        ];
        
        this.topLeftMarker.update(toCartesian(videoData.topLeft));
        this.topRightMarker.update(toCartesian(videoData.topRight));

        const deltaY = videoData.topLeft.latitude - videoData.bottomLeft.latitude;
        const deltaX = videoData.topLeft.longitude - videoData.bottomLeft.longitude;

        const sideAngle = -Math.atan2(deltaY, deltaX);
        this.stRotation = sideAngle + Math.PI/2;
    }
}