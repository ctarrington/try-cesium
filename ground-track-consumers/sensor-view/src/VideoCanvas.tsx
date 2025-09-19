import type { Metadata } from "./models.ts";
import { type PerspectiveFrustum, Viewer } from "cesium";

interface VideoCanvasProps {
  videoCanvasId: string;
  imageBlob: Blob | null;
  metadata: Metadata | null;
  viewer?: Viewer | null;
}

export function VideoCanvas({
  videoCanvasId,
  imageBlob,
  metadata,
  viewer,
}: VideoCanvasProps) {
  const ratio = calculateRatio(metadata, viewer);
  return (
    <div
      id={videoCanvasId}
      className="video-canvas"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: ratio,
        width: ratio,
        pointerEvents: "none",
        margin: "auto",
      }}
    >
      {imageBlob && (
        <img
          src={URL.createObjectURL(imageBlob)}
          alt="Sensor View"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      )}
    </div>
  );
}

function calculateRatio(
  metadata: Metadata | null | undefined,
  viewer: Viewer | null | undefined,
) {
  if (!metadata || !viewer) return "50%";

  const { frustum } = viewer.camera;
  const fov = (frustum as PerspectiveFrustum).fov;

  if (!fov) return "50%";

  const numericRatio = metadata.fovRadians / fov;
  return `${numericRatio * 100}%`;
}
