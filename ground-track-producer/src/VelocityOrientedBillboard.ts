import * as Cesium from 'cesium';

import { calculateBearing } from './calculations';
import { raiseCartesian, toCartographic } from './cesium-helpers';

// A velocity oriented billboard is a billboard that rotates to face the direction of travel.

const svgArrowLiteral = `
<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15 25 L 15 5 L 8 12 M 15 5 L 22 12" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;

const svgArrowURL = 'data:image/svg+xml,' + encodeURIComponent(svgArrowLiteral);

export class VelocityOrientedBillboard {
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  rotation: number;

  constructor(
    viewer: Cesium.Viewer,
    initialPosition: Cesium.Cartesian3,
    width: number = 25,
    height = 25,
    color: Cesium.Color = Cesium.Color.WHITE,
    url = svgArrowURL,
  ) {
    this.position = initialPosition;
    this.previousPosition = initialPosition;
    this.rotation = 0;

    const billboard = new Cesium.BillboardGraphics({
      alignedAxis: Cesium.Cartesian3.UNIT_Z,
      pixelOffset: new Cesium.Cartesian2(0, 0),
      image: url,
      color,
      width,
      height,
      eyeOffset: new Cesium.Cartesian3(0, 0, 0),
      rotation: new Cesium.CallbackProperty(() => {
        return this.rotation;
      }, false) as any,
    });

    const entity = new Cesium.Entity({
      position: new Cesium.CallbackProperty(() => {
        return this.position;
      }, false) as any,
      billboard,
    });

    viewer.entities.add(entity);
  }

  update(position: Cesium.Cartesian3) {
    this.previousPosition = this.position;
    this.position = raiseCartesian(position, 0);
    this.rotation = -calculateBearing(
      toCartographic(this.previousPosition),
      toCartographic(this.position),
    );
  }
}
