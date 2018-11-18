const Cesium = require('cesium/Cesium');

const defaultPosition = new Cesium.Cartesian3(0,0,0);

export class ModelEntity {
    position: Cesium.Cartesian3;
    previousPosition: Cesium.Cartesian3;

    constructor(viewer:Cesium.Viewer, url: string, position: Cesium.Cartesian3 = defaultPosition) {
        this.position = position;
        this.previousPosition = null;

        const model = new Cesium.ModelGraphics({
            color: new Cesium.ConstantProperty(Cesium.Color.WHITE),
            minimumPixelSize : 32,
            maximumScale : 2000,
            uri: url,
        });

        const hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
        const hprQuaternion = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        const entity = new Cesium.Entity({
            name : 'Milk Truck',
            position: new Cesium.CallbackProperty(()=>{return this.position;}, false),
            orientation: new Cesium.ConstantProperty(hprQuaternion),
            model,
        });

        viewer.entities.add(entity);
    }

    update(position: Cesium.Cartesian3) {
        this.position = position;
    }
}
