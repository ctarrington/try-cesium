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
  currentId?: string;
};

const emptyMousePosition: MousePosition = {
  latitude: null,
  longitude: null,
  screenX: null,
  screenY: null,
  currentId: undefined,
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
        const { endPosition } = motionEvent;
        const { x: screenX, y: screenY } = endPosition;

        const ids: string[] = viewer.scene
          .drillPick(endPosition, 10, 20, 20)
          .filter((p) => {
            return !!p.id;
          })
          .map((p) => p.id);

        const currentId = ids.length > 0 ? ids[0] : undefined;

        setMousePosition({
          latitude,
          longitude,
          screenX,
          screenY,
          currentId,
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
