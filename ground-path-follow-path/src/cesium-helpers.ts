const Cesium = require('cesium/Cesium');

const toCartographic = (cartesian:Cesium.Cartesian3) : Cesium.Cartographic => {
    return Cesium.Cartographic.fromCartesian(cartesian);
};

const toCartesian = (cartographic:Cesium.Cartographic) : Cesium.Cartesian3 => {
    return Cesium.Cartographic.toCartesian(cartographic);
};

const subtractCartesians = (to:Cesium.Cartesian3, from: Cesium.Cartesian3):Cesium.Cartesian3 => {
    return Cesium.Cartesian3.subtract(to, from, new Cesium.Cartesian3(0,0,0));
};

const subtractCartographics = (to:Cesium.Cartographic, from: Cesium.Cartographic):Cesium.Cartesian3 => {
    return Cesium.Cartesian3.subtract(toCartesian(to), toCartesian(from), new Cesium.Cartesian3(0,0,0));
};

const addCartesians = (first: Cesium.Cartesian3, second: Cesium.Cartesian3) : Cesium.Cartesian3 => {
    return Cesium.Cartesian3.add(first, second, new Cesium.Cartesian3(0,0,0));
};

const multiplyByScalar = (cartesian: Cesium.Cartesian3, scalar: number) : Cesium.Cartesian3 => {
    return Cesium.Cartesian3.multiplyByScalar(cartesian, scalar, new Cesium.Cartesian3(0,0,0));
};

const normalize = (cartesian:Cesium.Cartesian3) : Cesium.Cartesian3 => {
    return Cesium.Cartesian3.normalize(cartesian, new Cesium.Cartesian3(0,0,0));
};

const raiseCartographic = (original: Cesium.Cartographic, height:number) : Cesium.Cartographic => {
    return new Cesium.Cartographic(original.longitude, original.latitude, height);
};

const raiseCartesian = (original: Cesium.Cartesian3, height: number) : Cesium.Cartesian3 => {
    const raisedCartographic = raiseCartographic(toCartographic(original), height);
    return toCartesian(raisedCartographic);
};

const cross = (first: Cesium.Cartesian3, second: Cesium.Cartesian3) : Cesium.Cartesian3 => {
    return Cesium.Cartesian3.cross(first, second, new Cesium.Cartesian3(0,0,0));
};

const terrainCartesianFromScreen = (viewer: Cesium.Viewer, screen: Cesium.Cartesian2) =>
{
    const ray = viewer.camera.getPickRay(screen);
    return viewer.scene.globe.pick(ray, viewer.scene);
}

const toDegrees = Cesium.Math.toDegrees;

const combine = (first: Cesium.Cartesian3, second: Cesium.Cartesian3, alpha:number) => {
    const firstScaled = multiplyByScalar(first, alpha);
    const secondScaled = multiplyByScalar(second, 1-alpha);

    return addCartesians(firstScaled, secondScaled);
};

const cartesianMidpoint = (first: Cesium.Cartesian3, second: Cesium.Cartesian3) => {
    return combine(first, second, 0.5);
};

const clamp = (min:number, max:number, value:number) => {
    return Math.min(Math.max(min, value), max);
};

export {addCartesians, cartesianMidpoint, clamp, combine, cross, multiplyByScalar, normalize, raiseCartesian, raiseCartographic, subtractCartesians, subtractCartographics, terrainCartesianFromScreen, toCartesian, toCartographic, toDegrees};