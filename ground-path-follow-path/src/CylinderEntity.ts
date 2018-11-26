const Cesium = require('cesium/Cesium');

const defaultPosition = new Cesium.Cartesian3(1000,1000,1000);

export class CylinderEntity {
    position: Cesium.Cartesian3;

    constructor(viewer:Cesium.Viewer,
                length: number = 1,
                color: Cesium.Color = Cesium.Color.WHITE,
                bottomRadius: number = 10,
                topRadius: number = 10) {
        this.position = defaultPosition;

        const cylinder = new Cesium.CylinderGraphics({
            bottomRadius: new Cesium.ConstantProperty(bottomRadius),
            fill: new Cesium.ConstantProperty(true),
            length: new Cesium.ConstantProperty(length),
            material: color,
            outline: new Cesium.ConstantProperty(true),
            topRadius: new Cesium.ConstantProperty(topRadius),
        });


        const entity = new Cesium.Entity({
            name : 'cylinder',
            position: new Cesium.CallbackProperty(()=> {
                return this.position;
            }, false),
            cylinder,
        });

        viewer.entities.add(entity);
    }

    update(position: Cesium.Cartesian3) {
        this.position = position;
    }
}
