const Cesium = require('cesium/Cesium');

export class DataReader {
    loadedPromise: Promise<any[]>;
    data: any[];
    constructor(path: string) {
        this.loadedPromise = this.readFile(path);
    }

    private readFile(path:string) {
        return new Promise<any[]>((resolve, reject) => {
            fetch(path)
                .then((response) => {
                    if (response.ok) {
                        response.text().then(data => {
                            resolve(this.parseData(data));
                        });
                    } else {
                        reject(`Error loading file ${response.statusText}`);
                    }

                    return;
                });
        });
    }

    private parseData(raw:string): any[] {
        const rows = raw.split(/[\r\n]+/);

        const parsed = rows.map(row => {
            const tokens = row.split(',');
            const values : number[] = [];
            for (let token of tokens) {
                if (token !== 't' && token !== 'f') {
                    values.push(Number(token));
                }
            }

            const [elapsedMilliseconds,
                topLeftLat, topLeftLon, topLeftHeight,
                topRightLat, topRightLon, topRightHeight,
                bottomRightLat, bottomRightLon, bottomRightHeight,
                bottomLeftLat, bottomLeftLon, bottomLeftHeight,
                cameraLat, cameraLon, cameraHeight] = values;

            const topLeft = Cesium.Cartographic.fromRadians(topLeftLon, topLeftLat, topLeftHeight);
            const topRight = Cesium.Cartographic.fromRadians(topRightLon, topRightLat, topRightHeight);
            const bottomRight = Cesium.Cartographic.fromRadians(bottomRightLon, bottomRightLat, bottomRightHeight);
            const bottomLeft = Cesium.Cartographic.fromRadians(bottomLeftLon, bottomLeftLat, bottomLeftHeight);
            const camera = Cesium.Cartographic.fromRadians(cameraLon, cameraLat, cameraHeight);

            return {elapsedMilliseconds, topLeft, topRight, bottomRight, bottomLeft, camera};
        });

        return parsed;
    }

    load() {
        return this.loadedPromise;
    }

    findClosestData(elapsedMilliseconds: number) {

    }
}