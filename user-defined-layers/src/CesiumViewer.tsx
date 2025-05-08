// CesiumViewer.tsx
import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import {ACCESS_TOKEN} from './dontcheckin';

// Your access token can be found at: https://cesium.com/ion/tokens.
// In this project, we're using a token stored in a separate file that is not checked in.
Cesium.Ion.defaultAccessToken = ACCESS_TOKEN;

const CesiumViewer: React.FC = () => {
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (viewerRef.current) {
            const viewer = new Cesium.Viewer(viewerRef.current);

            return () => {
                viewer.destroy();
            };
        }
    }, []);

    return <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />;
};

export default CesiumViewer;