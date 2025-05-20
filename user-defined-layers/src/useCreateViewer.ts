import { type RefObject, useEffect, useState } from 'react';

import { Viewer } from 'cesium';

import * as Cesium from 'cesium';
import { ACCESS_TOKEN } from './dontcheckin';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

export const useCreateViewer = (
  viewerRef: RefObject<HTMLDivElement | null>,
) => {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    if (viewerRef && viewerRef.current && !viewer) {
      setViewer(new Viewer(viewerRef.current));
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [viewerRef, viewer]);

  return viewer;
};
