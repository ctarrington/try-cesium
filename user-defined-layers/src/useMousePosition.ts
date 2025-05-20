import { useEffect, useState } from 'react';

import * as Cesium from 'cesium';
import {
  type Cartesian3,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';

export type MousePosition = {
  latitude: number | null;
  longitude: number | null;
  screenX: number | null;
  screenY: number | null;
};

const emptyMousePosition: MousePosition = {
  latitude: null,
  longitude: null,
  screenX: null,
  screenY: null,
};

export const useMousePosition = (viewer: Viewer | null) => {
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(
    null,
  );

  useEffect(() => {
    if (!viewer) {
      return;
    }

    const container = viewer.canvas.parentElement as HTMLElement;
    const onMouseLeave = () => {
      console.log('Mouse left the viewer');
      setMousePosition({ ...emptyMousePosition });
    };
    container?.addEventListener('mouseleave', onMouseLeave);

    const onMouseMove: ScreenSpaceEventHandler.MotionEventCallback = (
      motionEvent: ScreenSpaceEventHandler.MotionEvent,
    ) => {
      const cartesianPosition: Cartesian3 = viewer.scene.pickPosition(
        motionEvent.endPosition,
      );

      if (!cartesianPosition) {
        setMousePosition({ ...emptyMousePosition });
      } else {
        const cartographicPosition =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(
            cartesianPosition,
          );
        const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
        const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
        const { x: screenX, y: screenY } = motionEvent.endPosition;

        setMousePosition({
          latitude,
          longitude,
          screenX,
          screenY,
        });
      }
    };

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      container?.removeEventListener('mouseleave', onMouseLeave);
      handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      handler.destroy();
    };
  }, [viewer, setMousePosition]);

  return mousePosition;
};
