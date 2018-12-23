import {toCartesian} from './cesium-helpers';
import {CylinderEntity} from './CylinderEntity';

const Cesium = require('cesium/Cesium');

export class VideoDrapedPolygon {
    cornerCartesiansArray: Cesium.Cartesian3[];
    stRotation: number;
    marker: CylinderEntity;


    constructor(viewer:Cesium.Viewer, videoElement : HTMLVideoElement) {
        this.stRotation = 0;
        this.cornerCartesiansArray = Cesium.Cartesian3.fromDegreesArrayHeights([
            122, 45, 0,
            122.00001, 45, 0,
            122.00001, 44.99999, 0,
            122, 44.999999, 0
        ]);

        this.calculateHierarchy = this.calculateHierarchy.bind(this);
        this.calculateStRotation = this.calculateStRotation.bind(this);

        const polygon = viewer.entities.add({
            name : 'Video Polygon',
            polygon : {
                hierarchy : new Cesium.CallbackProperty(this.calculateHierarchy, false),
                material: videoElement,
                stRotation: new Cesium.CallbackProperty(this.calculateStRotation, false),
            }
        });

        this.marker = new CylinderEntity(viewer, 10, Cesium.Color.RED, 20, 0);
    }

    calculateHierarchy() {
        return {positions: this.cornerCartesiansArray};
    }

    calculateStRotation() {
        return this.stRotation;
    }

    update(closestData: any) {
        this.cornerCartesiansArray = [
            toCartesian(closestData.topLeft),
            toCartesian(closestData.topRight),
            toCartesian(closestData.bottomRight),
            toCartesian(closestData.bottomLeft),
        ];
        
        this.marker.update(toCartesian(closestData.topLeft));
    }
}