import CarConfig from "../config/CarConfig";
import { TrackType } from "../enum/CommonEnum";


export default class CarUtil {


    //获取速度对应的 引擎音效
    public static getSpeedSoundIndex(speedNum) {
        let maxSpeed = CarConfig.carInfo[TrackType.line][0].Speed1;
        if (speedNum < maxSpeed * 0.3) {
            return 1;
        } else if (speedNum < maxSpeed * 0.7) {
            return 2;
        } else {
            return 3;
        }
    }

    //计算
    public static arrFun(str: string): Array<number> {
        let tempArr = str.split(",");
        let arr = [];
        for (let i = 0, len = tempArr.length; i < len; i++) {
            arr.push(this.numFun(tempArr[i]));
        }
        return arr;
    }

    public static numFun(str: string): number {
        let tempArr = str.split(".");
        if (tempArr.length == 1) {
            return parseInt(tempArr[0]);
        }
        if (tempArr.length == 2) {
            let index = tempArr[1].length;
            let num = parseInt(tempArr[1]);
            while (index > 0) {
                num = num / 10;
                index--;
            }
            return parseInt(tempArr[0]) + num;
        }
    }



}