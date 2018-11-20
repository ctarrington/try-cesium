const Cesium = require('cesium/Cesium');

export class PursuitCamera {
    camera: Cesium.Camera;

    constructor(camera: Cesium.Camera) {
        this.camera = camera;
    }

    update(targetCartesian: Cesium.Cartesian3, pursuitCartesian: Cesium.Cartesian3) {
        const targetCartographic = new Cesium.Cartographic(0,0,0);
        Cesium.Cartographic.fromCartesian(targetCartesian, Cesium.Ellipsoid.WGS84, targetCartographic);

        const pursuitCartographic = new Cesium.Cartographic(0,0,0);
        Cesium.Cartographic.fromCartesian(pursuitCartesian, Cesium.Ellipsoid.WGS84, pursuitCartographic);

        const targetRaisedCartographic = new Cesium.Cartographic(targetCartographic.longitude,targetCartographic.latitude, pursuitCartographic.height);
        const targetRaisedCartesian = new Cesium.Cartesian3(0,0,0);
        Cesium.Cartographic.toCartesian(targetRaisedCartographic, Cesium.Ellipsoid.WGS84, targetRaisedCartesian);

        // https://www.movable-type.co.uk/scripts/latlong.html
        const lon1 = pursuitCartographic.longitude;
        const lat1 = pursuitCartographic.latitude;

        const lon2 = targetCartographic.longitude;
        const lat2 = targetCartographic.latitude;

        const y = Math.sin(lon2-lon1) * Math.cos(lat2);
        const x = Math.cos(lat1)*Math.sin(lat2) -
            Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
        const bearing = Math.atan2(y, x);

        const pitch = Cesium.Cartesian3.angleBetween(targetCartesian, targetRaisedCartesian);

        this.camera.setView({
            destination : pursuitCartesian,
            orientation: {
                heading : bearing,
                pitch : -pitch-Math.PI/5,
                roll : 0.0
            }
        });
    }

}