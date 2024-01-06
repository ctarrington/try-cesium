import * as Cesium from 'cesium';
import {
  clamp,
  combine,
  cross,
  multiplyByScalar,
  normalize,
  raiseCartographic,
  subtractCartesians,
  toCartesian,
  toCartographic,
} from './cesium-helpers';

// An air pursuit path calculator calculates the next position by pursuing a target while trying to maintain a
// specified distance away from the target.

export class AirPursuitPathCalculator {
  targetPosition: Cesium.Cartesian3;
  currentPosition: Cesium.Cartesian3;
  speedInMetersPerSecond: number;
  altitude: number;
  goalDistance: number;

  normalMode: boolean;
  distanceDiv: HTMLDivElement;
  private lastUpdateTime: number;

  constructor(
    initialPosition: Cesium.Cartesian3,
    speedInMetersPerSecond: number,
    altitude: number,
    goalDistance: number,
    initialTargetPosition: Cesium.Cartesian3,
  ) {
    this.currentPosition = initialPosition;
    this.targetPosition = initialTargetPosition;
    this.speedInMetersPerSecond = speedInMetersPerSecond;
    this.altitude = altitude;
    this.goalDistance = goalDistance;

    this.normalMode = false;

    this.distanceDiv = document.createElement('div');
    document.body.appendChild(this.distanceDiv);

    this.lastUpdateTime = Date.now();
  }

  getPosition() {
    return this.currentPosition;
  }

  update(targetGroundPosition: Cesium.Cartesian3) {
    const targetCartographic = toCartographic(targetGroundPosition);
    const cartographicRaisedTarget = raiseCartographic(
      targetCartographic,
      this.altitude,
    );
    const targetCartesian = toCartesian(cartographicRaisedTarget);
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

    this.distanceDiv.innerText = 'Distance: ' + distance.toFixed(2);
    this.lastUpdateTime = Date.now();
  }
}
