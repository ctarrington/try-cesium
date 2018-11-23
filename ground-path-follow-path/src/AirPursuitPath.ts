import {
    addCartesians,
    cross,
    multiplyByScalar,
    normalize,
    raiseCartographic,
    subtractCartesians,
    toCartesian
} from "./cesium-helpers";

const Cesium = require('cesium/Cesium');

type PathProvider = (positions:Cesium.Cartographic[], initialPursuitPosition: Cesium.Cartesian3, speedInMetersPerSecond: number, goalDistance: number, height : number) => Cesium.Cartesian3[];

const TIME_PER_TICK = 1/33;

function combine(first: Cesium.Cartesian3, second: Cesium.Cartesian3, alpha:number) {
    const firstScaled = multiplyByScalar(first, alpha);
    const secondScaled = multiplyByScalar(second, 1-alpha);

    return addCartesians(firstScaled, secondScaled);
}

const generateAirPursuitPath : PathProvider = (targetPositions, initialPursuitPosition, speedInMetersPerSecond, goalDistance, height) => {
    const positions = [];
    const overheadDistance = 2*goalDistance / 3;
    let normalMode = false;

    const pursuitCartesian = Cesium.Cartesian3.clone(initialPursuitPosition);

    for (let ctr=0;ctr<targetPositions.length;ctr++) {
        const cartographicRaisedTarget = raiseCartographic(targetPositions[ctr], height);
        const targetCartesian = toCartesian(cartographicRaisedTarget);
        const distance = Cesium.Cartesian3.distance(targetCartesian, pursuitCartesian);

        let newDirection = null;
        if (!normalMode && distance < overheadDistance) {
            const nextCartographicRaisedTarget = raiseCartographic(targetPositions[ctr+1], height);
            const nextTargetCartesian = toCartesian(nextCartographicRaisedTarget);
            const targetsVector = normalize(subtractCartesians(nextTargetCartesian, targetCartesian));
            newDirection = targetsVector;
        } else {
            normalMode = true;
            const toTarget = normalize(subtractCartesians(targetCartesian, pursuitCartesian));
            const tangent = normalize(cross(pursuitCartesian, toTarget));

            const overage = Math.max((distance - goalDistance), 0);
            const alpha = Math.min(1, overage/goalDistance);
            newDirection = combine(toTarget, tangent, alpha);
        }


        const progress = multiplyByScalar(newDirection, speedInMetersPerSecond*TIME_PER_TICK);
        Cesium.Cartesian3.add(pursuitCartesian, progress, pursuitCartesian);
        positions.push(Cesium.Cartesian3.clone(pursuitCartesian));
    }

    return positions;
};


export {generateAirPursuitPath};