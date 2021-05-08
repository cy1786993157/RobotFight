import ResController from "../controller/ResController";
import CarConfig from "./CarConfig";


export default class MainConfig {


    public static LoadConfig() {
        let ConfigArr = [
            "config/Track.json",
            "config/Total.json",
            "config/FightMusic.json",
        ]
        Laya.loader.load(ConfigArr, Laya.Handler.create(this, this._onLoaded), null, Laya.Loader.JSON);
    }

    private static _onLoaded(): void {
        CarConfig.setRaceTrackInfo(Laya.loader.getRes("config/Track.json"));//车辆配置
        CarConfig.setScoreInfo(Laya.loader.getRes("config/Total.json"));//评分配置
        CarConfig.setCarSoundInfo(Laya.loader.getRes("config/FightMusic.json"));//车辆音效
        console.log("打印车辆配置为;", CarConfig.scoreInfo);
        ResController.ins.onAllAssetLoadFinish();
    }

    

}