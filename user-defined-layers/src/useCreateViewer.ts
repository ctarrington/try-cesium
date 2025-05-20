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

export const useCreateViewer = (containerId: string) => {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  useEffect(() => {
    if (!viewer) {
      createViewer(containerId).then((viewer: Viewer) => {
        setViewer(viewer);
      });
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [containerId, viewer]);

  return viewer;
};

const createViewer = async (containerId: string): Promise<Viewer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(new Viewer(containerId, options));
    }, 1000);
  });
};
