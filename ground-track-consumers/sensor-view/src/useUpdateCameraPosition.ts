import { PerspectiveFrustum, Viewer } from "cesium";
import type { Metadata } from "./models.ts";
import { useEffect } from "react";

export const useUpdateCameraPosition = (
  viewer: Viewer | null,
  metadata: Metadata | null,
) => {
  useEffect(() => {
    if (viewer && metadata) {
      console.log("Updating camera position", metadata);
      viewer.camera.setView({
        destination: metadata.cameraPosition,
        orientation: {
          direction: metadata.lookDirection,
          up: metadata.upDirection,
        },
      });

      const { clientWidth, clientHeight } = viewer.canvas;
      const aspectRatio = clientWidth / clientHeight;
      const zoomedFov = 3.0 * metadata.fovRadians;
      viewer.camera.frustum = new PerspectiveFrustum({
        fov: zoomedFov,
        aspectRatio,
      });
    }
  }, [viewer, metadata]);
};
