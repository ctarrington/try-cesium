import { useEffect, useState } from 'react';

import { Viewer } from 'cesium';
import * as Cesium from 'cesium';

import { ACCESS_TOKEN } from './dontcheckin';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const options = {
  homeButton: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  animation: false,
  infoBox: false,
  geocoder: false,
  scene3DOnly: true,
};

let loading = false;

export const useCreateViewer = (containerId: string) => {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    if (!viewer || (viewer.isDestroyed() && !loading)) {
      loading = true;
      const newViewer = new Viewer(containerId, options);
      setTimeout(() => {
        setViewer(newViewer);
        loading = false;
      }, 100);
    }

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
        setViewer(null);
        loading = false;
      }
    };
  }, [containerId, viewer, setViewer]);

  return viewer;
};
