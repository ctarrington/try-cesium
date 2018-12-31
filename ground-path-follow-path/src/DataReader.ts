import {toCartesian} from "./cesium-helpers";

const Cesium = require('cesium/Cesium');

import {VideoData} from './VideoData';


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

    private parseData(raw:string): VideoData[] {
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

            const topLeft = Cesium.Cartographic.fromDegrees(topLeftLon, topLeftLat, topLeftHeight);
            const topRight = Cesium.Cartographic.fromDegrees(topRightLon, topRightLat, topRightHeight);
            const bottomRight = Cesium.Cartographic.fromDegrees(bottomRightLon, bottomRightLat, bottomRightHeight);
            const bottomLeft = Cesium.Cartographic.fromDegrees(bottomLeftLon, bottomLeftLat, bottomLeftHeight);
            const camera = Cesium.Cartographic.fromDegrees(cameraLon, cameraLat, cameraHeight);

            const cornerCartesians = [
                toCartesian(topLeft),
                toCartesian(topRight),
                toCartesian(bottomRight),
                toCartesian(bottomLeft),
            ];

            const cameraCartesian = toCartesian(camera);

            return {elapsedMilliseconds, topLeft, topRight, bottomRight, bottomLeft, camera, cornerCartesians, cameraCartesian};
        });

        return parsed;
    }

    load() {
        return this.loadedPromise;
    }

    findClosestData(elapsedMilliseconds: number) {

    }
}