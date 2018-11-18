const Cesium = require('cesium/Cesium');

const defaultPosition = new Cesium.Cartesian3(0,0,0);

export class ModelEntity {
    position: Cesium.Cartesian3;
    previousPosition: Cesium.Cartesian3;
    orientation: Cesium.Quaternion;

    constructor(viewer:Cesium.Viewer, url: string, position: Cesium.Cartesian3 = defaultPosition) {
        this.position = position;
        this.previousPosition = null;
        this.orientation = Cesium.Transforms.headingPitchRollQuaternion(this.position, new Cesium.HeadingPitchRoll(0, 0, 0));

        const model = new Cesium.ModelGraphics({
            color: new Cesium.ConstantProperty(Cesium.Color.WHITE),
            minimumPixelSize : 30,
            maximumScale : 2000,
            uri: url,
        });

        const hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
        const hprQuaternion = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        const entity = new Cesium.Entity({
            name : 'Milk Truck',
            position: new Cesium.CallbackProperty(()=>{return this.position;}, false),
            orientation: new Cesium.CallbackProperty(()=>{return this.orientation;}, false),
            model,
        });

        viewer.entities.add(entity);
    }

    update(position: Cesium.Cartesian3) {
        this.previousPosition = this.position;
        this.position = position;


        const firstCartographic = Cesium.Cartographic.fromCartesian(this.previousPosition);
        const secondCartographic = Cesium.Cartographic.fromCartesian(this.position);

        var deltaLon = secondCartographic.longitude - firstCartographic.longitude;
        var deltaLat = secondCartographic.latitude - firstCartographic.latitude;
        var deltaHeight = secondCartographic.height - firstCartographic.height;
        var distance = Cesium.Cartesian3.distance(this.previousPosition, this.position);

        var heading = -Math.atan2(deltaLat, deltaLon);
        var pitch = Math.atan2(deltaHeight, distance);
        var roll = 0;

        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        this.orientation = Cesium.Transforms.headingPitchRollQuaternion(this.position, hpr);


    }
}
