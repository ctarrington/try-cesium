import { Cartographic } from './types';
import * as Cesium from 'cesium';

// adapted from https://www.movable-type.co.uk/scripts/latlong.html
export const calculateBearing = (
  fromCartographic: Cartographic,
  toCartographic: Cartographic,
): number => {
  const lon1 = fromCartographic.longitude;
  const lat1 = fromCartographic.latitude;

  const lon2 = toCartographic.longitude;
  const lat2 = toCartographic.latitude;

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return Math.atan2(y, x);
};

export const clamp = (min: number, max: number, value: number) => {
  return Math.min(Math.max(min, value), max);
};

export const calculateSpeedInMPH = (
  initialPosition: Cesium.Cartesian3,
  finalPosition: Cesium.Cartesian3,
  elapsed: number,
) => {
  const meters = Cesium.Cartesian3.distance(initialPosition, finalPosition);
  const miles = meters * 0.000621371;
  const hours = elapsed / 1000 / 60 / 60;
  return miles / hours;
};
