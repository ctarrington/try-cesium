import * as Cesium from 'cesium';
import {
  clamp,
  combine,
  cross,
  multiplyByScalar,
  normalize,
  raiseCartesian,
  subtractCartesians,
} from './cesium-helpers';

// An air pursuit path calculator calculates the next position by pursuing a target while trying to maintain a
// specified distance away from the target. It determines the direction to the target and then combines that with
// a tangent to the circle around the target to determine the next position. The distance from the target is used to adjust
// the weight of the two components.

export class AirPursuitPathCalculator {
  currentPosition: Cesium.Cartesian3;
  speedInMetersPerSecond: number;
  altitude: number;
  goalDistance: number;

  normalMode: boolean;
  lastUpdateTime: number;

  constructor(
    initialPosition: Cesium.Cartesian3,
    speedInMetersPerSecond: number,
    altitude: number,
    goalDistance: number,
  ) {
    this.currentPosition = initialPosition;
    this.speedInMetersPerSecond = speedInMetersPerSecond;
    this.altitude = altitude;
    this.goalDistance = goalDistance;

    this.normalMode = false;
    this.lastUpdateTime = Date.now();
  }

  getPosition() {
    return this.currentPosition;
  }

  update(targetGroundPosition: Cesium.Cartesian3) {
    const targetCartesian = raiseCartesian(targetGroundPosition, this.altitude);
    const distance = Cesium.Cartesian3.distance(
      targetCartesian,
      this.currentPosition,
    );

    const toTarget = normalize(
      subtractCartesians(targetCartesian, this.currentPosition),
    );
    const tangent = normalize(cross(this.currentPosition, toTarget));

    const overage = Math.max(distance - this.goalDistance, 0);
    const alpha = Math.min(1, overage / this.goalDistance);
    const newDirection = combine(toTarget, tangent, alpha);

    const elapsedTime = clamp(0, 1, Date.now() - this.lastUpdateTime);
    const progress = multiplyByScalar(
      newDirection,
      this.speedInMetersPerSecond * elapsedTime,
    );
    Cesium.Cartesian3.add(this.currentPosition, progress, this.currentPosition);

    this.lastUpdateTime = Date.now();
  }
}
