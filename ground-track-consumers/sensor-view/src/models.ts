import type { Cartesian3 } from "cesium";

export interface Metadata {
  cameraPosition: Cartesian3;
  lookDirection: Cartesian3;
  upDirection: Cartesian3;
  fovRadians: number;
}
