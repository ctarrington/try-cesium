const Cesium = require('cesium/Cesium');

type PathProvider = (positions:Cesium.Cartographic[], initialPursuitPosition: Cesium.Cartesian3, speedInMetersPerSecond: number, goalDistance: number, height : number) => Cesium.Cartesian3[];

const TIME_PER_TICK = 1/33;

function combine(first: Cesium.Cartesian3, second: Cesium.Cartesian3, alpha:number) {
    const firstScaled = new Cesium.Cartesian3(0,0,0);
    const secondScaled = new Cesium.Cartesian3(0,0,0);
    const combination =  new Cesium.Cartesian3(0,0,0);

    Cesium.Cartesian3.multiplyByScalar(first, alpha, firstScaled);
    Cesium.Cartesian3.multiplyByScalar(second, 1-alpha, secondScaled);
    Cesium.Cartesian3.add(firstScaled, secondScaled, combination);

    return combination;
}

const generateAirPursuitPath : PathProvider = (targetPositions, initialPursuitPosition, speedInMetersPerSecond, goalDistance, height) => {
    const positions = [];
    const overheadDistance = 2*goalDistance / 3;
    let normalMode = false;

    const pursuitCartesian = Cesium.Cartesian3.clone(initialPursuitPosition);
    const targetCartesian = new Cesium.Cartesian3(0,0,0);
    const nextTargetCartesian = new Cesium.Cartesian3(0,0,0);


    const cartographicRaisedTarget = new Cesium.Cartographic(0,0,0);
    const nextCartographicRaisedTarget = new Cesium.Cartographic(0,0,0);

    const toTarget = new Cesium.Cartesian3(0, 0, 0);
    const tangent =  new Cesium.Cartesian3(0, 0, 0);
    const progress = new Cesium.Cartesian3(0, 0, 0)
    const targetsVector = new Cesium.Cartesian3(0, 0, 0);

    for (let ctr=0;ctr<targetPositions.length;ctr++) {
        Cesium.Cartographic.fromRadians(targetPositions[ctr].longitude, targetPositions[ctr].latitude, height, cartographicRaisedTarget);
        Cesium.Cartographic.toCartesian(cartographicRaisedTarget, Cesium.Ellipsoid.WGS84, targetCartesian);
        const distance = Cesium.Cartesian3.distance(targetCartesian, pursuitCartesian);

        let newDirection = null;
        if (!normalMode && distance < overheadDistance) {
            Cesium.Cartographic.fromRadians(targetPositions[ctr+1].longitude, targetPositions[ctr+1].latitude, height, nextCartographicRaisedTarget);
            Cesium.Cartographic.toCartesian(nextCartographicRaisedTarget, Cesium.Ellipsoid.WGS84, nextTargetCartesian);
            Cesium.Cartesian3.subtract(nextTargetCartesian, targetCartesian, targetsVector);
            Cesium.Cartesian3.normalize(targetsVector, targetsVector);

            newDirection = targetsVector;
            //console.log(`targetsVector: ${targetsVector}, distance: ${distance}`);
        } else {
            normalMode = true;
            Cesium.Cartesian3.subtract(targetCartesian, pursuitCartesian, toTarget);
            Cesium.Cartesian3.normalize(toTarget, toTarget);

            Cesium.Cartesian3.cross(pursuitCartesian, toTarget, tangent);
            Cesium.Cartesian3.normalize(tangent, tangent);

            const overage = Math.max((distance - goalDistance), 0);
            const alpha = Math.min(1, overage/goalDistance);
            newDirection = combine(toTarget, tangent, alpha);
            //console.log(`alpha: ${alpha}, distance: ${distance}`);
        }


        Cesium.Cartesian3.multiplyByScalar(newDirection, speedInMetersPerSecond*TIME_PER_TICK, progress);
        Cesium.Cartesian3.add(pursuitCartesian, progress, pursuitCartesian);
        positions.push(Cesium.Cartesian3.clone(pursuitCartesian));
    }

    return positions;
};


export {generateAirPursuitPath};