import * as Cesium from 'cesium';

const defaultPosition = new Cesium.Cartesian3(1000, 1000, 1000);

export class ModelEntity {
  position: Cesium.Cartesian3;
  previousPosition: Cesium.Cartesian3;
  orientation: Cesium.Quaternion;

  constructor(
    viewer: Cesium.Viewer,
    url: string,
    position: Cesium.Cartesian3 = defaultPosition,
    color: Cesium.Color = Cesium.Color.WHITE,
    minimumPixelSize: number = 32,
  ) {
    this.position = position;
    this.previousPosition = null;
    this.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      this.position,
      new Cesium.HeadingPitchRoll(0, 0, 0),
    );

    const model = new Cesium.ModelGraphics({
      color: new Cesium.ConstantProperty(color),
      minimumPixelSize,
      maximumScale: 20000,
      uri: url,
    });

    const hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
    const hprQuaternion = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr,
    );

    const entity = new Cesium.Entity({
      name: 'Milk Truck',
      position: new Cesium.CallbackProperty(() => {
        return this.position;
      }, false) as any,
      orientation: new Cesium.CallbackProperty(() => {
        return this.orientation;
      }, false),
      model,
    });

    viewer.entities.add(entity);
  }

  update(position: Cesium.Cartesian3) {
    this.previousPosition = this.position;
    this.position = position;

    const firstCartographic = Cesium.Cartographic.fromCartesian(
      this.previousPosition,
    );
    const secondCartographic = Cesium.Cartographic.fromCartesian(this.position);

    const deltaLon = secondCartographic.longitude - firstCartographic.longitude;
    const deltaLat = secondCartographic.latitude - firstCartographic.latitude;
    const deltaHeight = secondCartographic.height - firstCartographic.height;
    const distance = Cesium.Cartesian3.distance(
      this.previousPosition,
      this.position,
    );

    const heading = -Math.atan2(deltaLat, deltaLon) + Math.PI / 2.0;
    const pitch = Math.atan2(deltaHeight, distance);
    const roll = 0;

    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    this.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      this.position,
      hpr,
    );
  }
}
