const Cesium = require('cesium/Cesium');

type PathProvider = (terrainProvider : Cesium.TerrainProvider, waypoints:WayPoint[]) => Promise<Cesium.Cartographic[]>;

type WayPoint = {
  position: Cesium.Cartographic,
};

const generateCartographicGroundPath : PathProvider = (terrainProvider : Cesium.TerrainProvider, waypoints:WayPoint[]) => {
  const step = 0.0000005;

  const positions : Cesium.Cartographic[] = [];
  for (let wctr=0;wctr < waypoints.length-1; wctr++) {
    const firstCartographic = waypoints[wctr].position;
    const secondCartographic = waypoints[wctr+1].position;

    const deltaLon = secondCartographic.longitude - firstCartographic.longitude;
    const deltaLat = secondCartographic.latitude - firstCartographic.latitude;


    const numSteps = Math.max(Math.abs(deltaLon/step), Math.abs(deltaLat/step));
    const lonStep = deltaLon / numSteps;
    const latStep = deltaLat / numSteps;
    // console.log('numSteps, lonStep, latStep', numSteps, lonStep, latStep);

    let lon = firstCartographic.longitude;
    let lat = firstCartographic.latitude;
    for (let sctr=0; sctr<numSteps;sctr++) {
      const position = Cesium.Cartographic.fromRadians(lon, lat);
      positions.push(position);
      lon += lonStep;
      lat += latStep;
    }
  }

  var withHeightsPromise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
  return withHeightsPromise;

};

export {generateCartographicGroundPath, WayPoint};