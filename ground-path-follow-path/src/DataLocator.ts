
// TODO type it
import {VideoData} from './VideoData';

export class DataLocator {
    key: string;
    rows:any[];

    constructor(increasingRows: any[], key: string) {
        this.rows = increasingRows;
        this.key = key;
    }

    private findClosestIndexBetween(startIndex:number, stopIndex:number, desiredValue: number) : number {
        const gap = stopIndex - startIndex;
        if (gap === 1) {
            return stopIndex;
        }

        const midIndex = startIndex + Math.floor(gap / 2);
        if (this.rows[midIndex][this.key] >= desiredValue) {
            return this.findClosestIndexBetween(startIndex, midIndex, desiredValue);
        } else {
            return this.findClosestIndexBetween(midIndex, stopIndex, desiredValue);
        }
    }

    findClosestData(desiredValue: number) : VideoData {
        if (desiredValue <= this.rows[0][this.key]) {
            return this.rows[0];
        }

        const lastIndex = this.rows.length-1;
        if (desiredValue >= this.rows[lastIndex][this.key]) {
            return this.rows[lastIndex];
        }

        const index = this.findClosestIndexBetween(0, lastIndex, desiredValue);
        return this.rows[index];
    }
}