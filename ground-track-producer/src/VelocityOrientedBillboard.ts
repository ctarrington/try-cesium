import * as Cesium from 'cesium';

import { calculateBearing } from './calculations';
import { toCartographic } from './cesium-helpers';

export class VelocityOrientedBillboard {
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  rotation: number;

  constructor(
    viewer: Cesium.Viewer,
    url: string,
    color: Cesium.Color = Cesium.Color.WHITE,
    initialPosition: Cesium.Cartesian3,
    width: number = 25,
    height = 25,
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
      rotation: 0,
    });

    const entity = new Cesium.Entity({
      position: this.position,
      billboard,
    });

    viewer.entities.add(entity);
  }

  update(position: Cesium.Cartesian3) {
    this.previousPosition = this.position;
    this.position = position;
    this.rotation = -calculateBearing(
      toCartographic(this.previousPosition),
      toCartographic(this.position),
    );
  }
}
