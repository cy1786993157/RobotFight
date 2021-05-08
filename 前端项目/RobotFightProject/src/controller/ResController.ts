// import MainConfig from "../config/MainConfig";
// import ViewKey from "../enum/ViewKey";
// import EventKey from "../EventKey";
// import CarDataManager from "../manager/CarDataManager";
// import UILoadingView from "../script/UILoadingView";
// import EventType from "../static/EventType";
// import GlobalApi from "../static/GlobalApi";

export default class ResController {
//     private static _instance: ResController;

//     private static _firstLoadingProgressCallback: Laya.Handler;

//     static get ins() {
//         if (this._instance == null) {
//             this._instance = new ResController();
//         }
//         return this._instance;
//     }

//     public static loadVersion(progressCallback: Laya.Handler) {
//         ResController._firstLoadingProgressCallback = progressCallback;

//         let ConfigArr = [
//             "GameConfig.json",
//         ]
//         Laya.loader.load(ConfigArr, Laya.Handler.create(this, this.onLoaded), null, Laya.Loader.JSON);
//     }

//     private static onLoaded(): void {
//         let res = Laya.loader.getRes("GameConfig.json");
//         console.log('版本控制文件加载完成：', res);
//         if (res.wsServerIP) {
//             AA.GameSocket.ins.serverIP = res.wsServerIP;
//         }
//         console.log("请求服务器:", res.wsServerIP);
//     }

//     private ressource: Array<string>;
//     //批量加载资源
//     public preLoadingRes() {
//         //url
//         let url = GlobalApi.resUrl + "/fkfc2/";
//         //预加载所有资源
//         this.ressource = [
//             url + `${CarDataManager.sceneStr}/Conventional/saidao_${CarDataManager.curScene }.ls`,
//             url + `${CarDataManager.sceneStr}/Conventional/Assets/Animation/CardAni${CarDataManager.curScene}a-CardAni${CarDataManager.curScene}a.lani`,
//             url + `${CarDataManager.sceneStr}/Conventional/Tires.lh`,
//             url + `${CarDataManager.sceneStr}/Conventional/Assets/Animation/CardAni${CarDataManager.curScene}b-CardAni${CarDataManager.curScene}b.lani`,
//         ];
//         UILoadingView.ins.show();
//         // Laya.loader.load
//         console.log("清理所有未加载的*************************");
//         Laya.loader.clearUnLoaded();
//         Laya.loader.create(this.ressource, Laya.Handler.create(this, this._onPreLoadFinish),Laya.Handler.create(this, this._onProgress),null,null,null,0);
       
//         // Laya.loader.create(this.ressource, Laya.Handler.create(this, this._onPreLoadFinish), UILoadingView.ins.progressHandler);
//     }

//     private _onProgress(index) {
//         console.log("加载进度", index);
//     }

//     public clearRes() {
//         // for(let i=0,len=this.ressource.length;i<len;i++)
//         // {
//         //     // Laya.loader.clearRes(this.ressource[i]);
//         // }
//     }

//     // 3D资源加载完成
//     private _onPreLoadFinish() {
//         console.log("3D资源加载完成");
//         MainConfig.LoadConfig();
//     }

//     //2D资源加载完成
//     public onAllAssetLoadFinish() {
//         console.log("2D资源加载完成");
//           //boss地图加载完成
//           GlobalApi.evtManager.event(EventType.BOSS_START_COMPLETE)
//         UILoadingView.ins.close();
//         //AA.ViewController.show(ViewKey.carGameView,null,true);
//         Laya.Scene.open("test/CarGameView.scene", false);
//         AA.EventManager.dispatchEvent(EventKey.RES_FINISH);
//     }

}