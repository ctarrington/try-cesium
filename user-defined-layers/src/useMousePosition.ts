import { useEffect, useState } from 'react';

import * as Cesium from 'cesium';
import {
  type Cartesian3,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
} from 'cesium';

export const useMousePosition = (viewer: Viewer | null) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [screenX, setScreenX] = useState<number | null>(null);
  const [screenY, setScreenY] = useState<number | null>(null);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [dragging, setDragging] = useState<boolean>(false);

  useEffect(() => {
    if (!viewer) {
      return;
    }

    const container = viewer.canvas.parentElement as HTMLElement;
    const onMouseLeave = () => {
      setLatitude(null);
      setLongitude(null);
      setScreenX(null);
      setScreenY(null);
      setCurrentId(undefined);
      setDragging(false);
    };
    container?.addEventListener('mouseleave', onMouseLeave);

    const onLeftUp: ScreenSpaceEventHandler.PositionedEventCallback = () => {
      setDragging(false);
    };

    const onLeftDown: ScreenSpaceEventHandler.PositionedEventCallback = ({
      position,
    }: ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesianPosition: Cartesian3 = viewer.scene.pickPosition(position);
      if (cartesianPosition) {
        const ids: string[] = viewer.scene
          .drillPick(position, 10, 20, 20)
          .filter((p) => {
            return !!p.id;
          })
          .map((p) => p.id);

        const newCurrentId = ids.length > 0 ? ids[0] : undefined;
        const newDragging = !!newCurrentId;

        viewer.scene.screenSpaceCameraController.enableRotate = !newDragging;
        if (newDragging !== dragging) {
          setDragging(newDragging);
        }
        if (newCurrentId !== currentId) {
          setCurrentId(newCurrentId);
        }
      }
    };

    const onMouseMove: ScreenSpaceEventHandler.MotionEventCallback = (
      motionEvent: ScreenSpaceEventHandler.MotionEvent,
    ) => {
      const cartesianPosition: Cartesian3 = viewer.scene.pickPosition(
        motionEvent.endPosition,
      );

      if (!cartesianPosition) {
        setLatitude(null);
        setLongitude(null);
        setScreenX(null);
        setScreenY(null);
        return;
      } else {
        const cartographicPosition =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(
            cartesianPosition,
          );
        const newLatitude = Cesium.Math.toDegrees(
          cartographicPosition.latitude,
        );
        setLatitude(newLatitude);
        const newLongitude = Cesium.Math.toDegrees(
          cartographicPosition.longitude,
        );
        setLongitude(newLongitude);
        const { endPosition } = motionEvent;
        const { x: newScreenX, y: newScreenY } = endPosition;
        setScreenX(newScreenX);
        setScreenY(newScreenY);
      }
    };

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(onLeftDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(onLeftUp, Cesium.ScreenSpaceEventType.LEFT_UP);

    return () => {
      container?.removeEventListener('mouseleave', onMouseLeave);
      handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
      handler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
      handler.destroy();
    };
  }, [viewer]);

  return {
    latitude,
    longitude,
    screenX,
    screenY,
    currentId,
    dragging,
  };
};
