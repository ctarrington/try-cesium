import { useEffect, useRef } from 'react';

import { Billboard, BillboardCollection, Cartesian3, Viewer } from 'cesium';

import type { ReferencePoint } from './model.ts';

type BillboardMap = { [key: string]: Billboard };

const pinLiteral = `
<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M12,14 C9.790861,14 8,12.209139 8,10 C8,7.790861 9.790861,6 12,6 C14.209139,6 16,7.790861 16,10 C16,12.209139 14.209139,14 12,14 Z M12,13 C13.6568542,13 15,11.6568542 15,10 C15,8.34314575 13.6568542,7 12,7 C10.3431458,7 9,8.34314575 9,10 C9,11.6568542 10.3431458,13 12,13 Z M12.3391401,20.8674017 C12.1476092,21.0441994 11.8523908,21.0441994 11.6608599,20.8674017 C7.23483091,16.7818365 5,13.171725 5,10 C5,6.13400675 8.13400675,3 12,3 C15.8659932,3 19,6.13400675 19,10 C19,13.171725 16.7651691,16.7818365 12.3391401,20.8674017 Z M18,10 C18,6.6862915 15.3137085,4 12,4 C8.6862915,4 6,6.6862915 6,10 C6,12.7518356 7.98660341,16.0353377 12,19.8163638 C16.0133966,16.0353377 18,12.7518356 18,10 Z"/>
</svg>
`;
const svgPin = 'data:image/svg+xml,' + encodeURIComponent(pinLiteral);

function updateBillboards(
  referencePoints: ReferencePoint[],
  billboardCollection: BillboardCollection,
  billboardMap: BillboardMap,
  viewer: Viewer,
) {
  const ellipsoid = viewer.scene.globe.ellipsoid;
  referencePoints.forEach((referencePoint) => {
    const { id, latitude, longitude } = referencePoint;
    if (isNaN(longitude) || isNaN(latitude)) {
      return;
    }

    const position = Cartesian3.fromDegrees(longitude, latitude, 0, ellipsoid);
    const image = svgPin;
    const billboard =
      billboardMap[id] ||
      billboardCollection.add({
        position,
        scale: 1.5,
        image,
      });
    billboardMap[id] = billboard;

    billboard.position = position;
    billboard.id = id;
  });
}

export const useUpdateReferencePoints = (
  referencePoints: ReferencePoint[],
  viewer: Viewer | null,
) => {
  const billboardCollectionRef = useRef<BillboardCollection | null>(null);
  const billboardMapRef = useRef<BillboardMap>({});

  useEffect(() => {
    if (!viewer?.scene) {
      return;
    }

    if (
      !billboardCollectionRef.current ||
      billboardCollectionRef.current.isDestroyed()
    ) {
      billboardCollectionRef.current = viewer.scene.primitives.add(
        new BillboardCollection(),
      );
    } else {
      updateBillboards(
        referencePoints,
        billboardCollectionRef.current,
        billboardMapRef.current,
        viewer,
      );
    }
  }, [viewer, referencePoints]);
};
