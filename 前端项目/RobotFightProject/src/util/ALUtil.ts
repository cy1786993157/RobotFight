import { ALIntercept } from "../ALIntercept";
import { ALReport } from "../ALReport";
import { ALConfig } from "../ALConfig";
import { PlatformEnum,UserInfoData } from "../ALData";
//此处生命未放入到.d.ts文件中，因为会和CP项目中.d.ts中生命冲突
declare let wx: any;
declare let qq: any;
declare let tt: any;
declare let qg: any;//oppo或者vivo
declare let hbs: any;//华为
export class ALUtil {
    //public static DEBUG = false;
    public static DEBUG = true;//测试
    public static ToastStrList:Array<string> = [];
    public static TimerID = null;
    public static Showing = false;
    public static LOG(message?: any, ...data) {
        if (this.DEBUG) console.log("[AladinSDK]",message, data);
    }
    //添加appid前缀
    static addAppidPrefix(appid:string) {
        if(ALConfig.GamePlatform==PlatformEnum.Oppo||ALConfig.GamePlatform==PlatformEnum.Vivo||ALConfig.GamePlatform==PlatformEnum.HuaWei){
            return ALConfig.GamePlatform+appid
        }else{
            return appid
        }
    }
    /**
     * wx不存在
     */
    static wxNotExist() {
        if (typeof wx === 'undefined') return true;
        return false;
    }

    /**
     * wx存在
     */
    static wxExist() {
        if (typeof wx === 'undefined') return false;
        return true;
    }

    /**
     * tt存在
     */
    static ttExist() {
        if (typeof tt === 'undefined') return false;
        return true;
    }

    /**
     * tt存在
     */
    static ttNotExist() {
        if (typeof tt === 'undefined') return true;
        return false;
    }

    /**
     * qg存在
     */
    static qgExist() {
        if (typeof qg === 'undefined') return false;
        return true;
    }
    /**
     * qg不存在
     */
    static qgNotExist() {
        if (typeof qg === 'undefined') return true;
        return false;
    }

    /**
     * hbs存在
     */
    static hbsExist() {
        if (typeof hbs === 'undefined') return false;
        return true;
    }
    /**
     * hbs不存在
     */
    static hbsNotExist() {
        if (typeof hbs === 'undefined') return true;
        return false;
    }

    /**
     * qq不存在
     */
    static qqNotExist() {
        if (typeof qq === 'undefined') return true;
        return false;
    }

    /**
     * qq存在
     */
    static qqExist() {
        if (typeof qq === 'undefined') return false;
        return true;
    }

    /**
     * 在兼容的小游戏平台
     */
    static runEnvExist() {
        if (typeof wx === 'undefined' && typeof qq === 'undefined'&& typeof tt === 'undefined'&& typeof qg === 'undefined' && typeof hbs === 'undefined') return false;
        return true;
    }

    /**
     * 在其他平台
     */
    static runEnvNotExist() {
        if (typeof wx === 'undefined' && typeof qq === 'undefined'&& typeof tt === 'undefined'&& typeof qg === 'undefined' && typeof hbs === 'undefined') return true;
        return false;
    }

    //获取运行平台
    static initRunEnv() {
        switch(ALConfig.GamePlatform){
            case PlatformEnum.QQ : {
                ALConfig.RunEnv = qq;
                break;
            }
            case PlatformEnum.WeChat : {
                ALConfig.RunEnv = wx;
                break;
            }
            case PlatformEnum.TouTiao : {
                ALConfig.RunEnv = tt;
                break;
            }
            case PlatformEnum.HuaWei : {
                ALConfig.RunEnv = hbs;
                break;
            }
            case PlatformEnum.Oppo || PlatformEnum.Vivo : {
                ALConfig.RunEnv = qg;
                break;
            }
            default:{
                throw Error("getRunEnv erro: no match runtime environment");
            }
        }
    }
    //获取小游戏平台前缀字符串
    static initGamePlatform(){
        if(ALUtil.qqExist()){
            ALConfig.GamePlatform = PlatformEnum.QQ;
            return;
        }
        if(ALUtil.wxExist()){
            ALConfig.GamePlatform = PlatformEnum.WeChat;
            return;
        }
        if(ALUtil.ttExist()){
            ALConfig.GamePlatform = PlatformEnum.TouTiao;
            return;
        }
        if(ALUtil.hbsExist()){
            ALConfig.GamePlatform = PlatformEnum.HuaWei;
            return;
        }
        //oppo or vivo
        if(ALUtil.qgExist()){
            try{
                let info = qg.getSystemInfoSync();
                if(info && info.brand){
                    ALConfig.GamePlatform = info.brand.toLowerCase();
                    return;
                }
            } catch(error){
                console.error('initGamePlatform catch error:',error);
            }
        }
        ALConfig.GamePlatform = PlatformEnum.Other;
    }

    /**
    * 读取申明的APPIDList
    */
    static readAppIDList() {
        return new Promise<string>((resolve, reject) => {
            // 该字段 “app - config.json”在手机上通用、当测试小游戏在IDE上时需要用game.json
            // const wxQQ = ALUtil.qqExist() ? qq : wx;
            const filePath = ALConfig.RunEnv.getSystemInfoSync().platform === 'devtools' ? 'game.json' : 'app-config.json';
            const fileSystemManager = ALConfig.RunEnv.getFileSystemManager();
            fileSystemManager.readFile({
                filePath: filePath,
                encoding: "utf-8",
                success: function (fileData) {
                    const dataStr = fileData['data'];
                    const data = JSON.parse(dataStr);
                    const appIdList: Array<string> = data['navigateToMiniProgramAppIdList'];
                    let appIdListStr = '';
                    if (appIdList) {
                        appIdListStr = appIdList.join(',');
                    }
                    ALUtil.LOG('ALSDK readAppIDList appIdListStr ', appIdListStr);
                    resolve(appIdListStr);
                },
                fail: function (error) {
                    ALUtil.LOG('ALSDK readAppIDList error ', error);
                    resolve('');
                }
            });
        });
    }
    
     /**
     * 获取file name
     * @param url
     */
    static getUrlFileName(url: string): string {
        //url.split('/').pop() 最后一个字段
        return url.split('/').pop().split('?')[0].split('#')[0];
    }

    /**
     * 获取report name
     * @param url 
     */
    static getUrlReportName(url: string): string {
        const tmpArr = url.split(ALConfig.ImgDomain);
        return tmpArr.length > 1 ? tmpArr[1].toString() : tmpArr[0].toString();
    }
   
    /**
     * 参数转化成queryString
     * @param params
     */
    static _buildQueryString(params: any): string {
        const paramArr = new Array<string>();
        for (let attr in params) {
            if (params.hasOwnProperty(attr)) {
                paramArr.push(attr + '=' + params[attr]);
            }
        }
        return paramArr.join('&');
    }

    /**
     * 合并参数
     * @param oriParam
     * @param paramObj
     */
    static _mergeParams(oriParam: any, paramObj: any) {
        for (let attr in paramObj) {
            if (paramObj.hasOwnProperty(attr)) {
                oriParam[attr] = paramObj[attr];
            }
        }
    }

    //获取小戏初始参数
    //假设从A（点击广告）途径进来，B（民间买量跳转）途径参数为空
    static _getInitParams(params: any, paramObj: any) {
        if (paramObj) {
            for (var attr in paramObj) {
                if (paramObj.hasOwnProperty(attr) && !params.hasOwnProperty(attr)) {
                params[attr] = paramObj[attr];//民间买量ads=TSA？？？？
                }
            }
        }
        return ALUtil._buildQueryString(params);
    }

    /**
     * 解析queryString
     * @param str 
     * @param element Array<string>
     */
    static _parseQueryString(str: string) {
        const result = {};
        if (!str) return result;
        const items = str.split("&");
        let arr: Array<string> = null;
        for (let i = 0, l = items.length; i < l; i++) {
            arr = items[i].split("=");
            result[arr[0]] = arr[1];
        }
        return result;
    }

    /**
     * 解析跳转地址参数
     * path和params里面都有可能有参数
     * 最终确定, appid, target_appid, param, path
     * @param element
     */
    static parseNavigateParam(element: Array<string>) {
        
        const appId = element[0];
        const target_appId = element[1];

        let path = element[2] || 'pages/index/index';

        let extraData = this._parseQueryString(element[3]);
        if (path.indexOf('?') > -1) {
            const pathArr = path.split('?');
            const pathParams = this._parseQueryString(pathArr[1]);
            this._mergeParams(extraData, pathParams);
        }
        
        //子盒子跳转 携带跳转的app id
        extraData['tgt'] = element[1];

        path += ('?' + this._buildQueryString(extraData));

        const rt = {
            appId: appId,
            path: path,
            extraData: extraData,
            target_appid: target_appId
        };

        return rt;
    }
    /**
     * 判断是否为整数
     * @param obj 
     * @returns
     */
    static isInteger(obj:any) {
        return Math.floor(obj) === obj
    }

    /**
     * 判断是否为函数
     * @param fn 
     * @returns 
     */
    static isFunction(fn:any) {
        return Object.prototype.toString.call(fn)=== '[object Function]';
     }

    /**
     * 转换版本号为数字
     * @param str 
     * @returns 
     */
    static convertVersionStringToNumber(str: string):Number {
        var vstr = str.split(".");
        var num = (Number(vstr[0]) << 24) | 0 +
            (Number(vstr[1]) << 16) | 0 +
            (Number(vstr[2]) | 0);
        return num;
    }
    /**
     * 由于旧版本获取用户权限接口变更，在变更以前，如果能获取到玩家信息，就上报服务器
     */
    static reportUserInfo(){
        if(ALConfig.GamePlatform==PlatformEnum.WeChat||ALConfig.GamePlatform==PlatformEnum.QQ){
            ALConfig.RunEnv.getUserInfo({
                success : function(res){
                    //如果玩家性别为0，则认为getUserInfo接口变更已经生效，平台返回匿名userinfo信息
                    if( res && res.userInfo && res.userInfo.gender != 0 && res.userInfo.language != "" && res.userInfo.country != ""){
                        let paramObj:any = {};
                        paramObj.nickName = UserInfoData.NickName = res.userInfo.nickName || "";
                        paramObj.avatarUrl = UserInfoData.AvatarUrl = res.userInfo.avatarUrl || "";
                        paramObj.country = UserInfoData.Country =  res.userInfo.country || "";
                        paramObj.gender =  UserInfoData.Gender = res.userInfo.gender !== undefined ? res.userInfo.gender : 0 ;
                        paramObj.language = UserInfoData.Language =  res.userInfo.language  || "";
                        paramObj.province = UserInfoData.Province =  res.userInfo.province || "";
                        paramObj.city =  UserInfoData.City = res.userInfo.city || "";
                        ALReport.reportDataToServer(paramObj);
                    }else{
                        console.log("getUserInfo interface return anonymous userinfo!");
                    }
                },
                fail: function (res) {
                    console.warn("reportUserInfo getUserInfo fail:",res);
                }
              })
        } 
    }
    /**
     *    
     * @returns 
     */
    static saveSystemInfo():void{
        if(ALUtil.runEnvNotExist()){
            return;
        }
        try {
            UserInfoData.Model = ALConfig.RunEnv.getSystemInfoSync().model;
        } catch (error) {
            console.error("getSystemInfoSync erro");
        }
    }
    static saveNetworkType():void{
        if(ALUtil.runEnvNotExist()){
            return;
        }
        try {
            ALConfig.RunEnv.getNetworkType({
                success(res) {
                    ALIntercept.NetworkType = res.networkType
                }
            })
        } catch (error) {
            console.error("getNetworkType erro");
        }
    }
    static saveAccountInfo():void{
        if(ALConfig.GamePlatform != PlatformEnum.WeChat){
            return;
        }
        try{
            ALConfig.AccountInfo = ALConfig.RunEnv.getAccountInfoSync();           
        }
        catch(error){
            console.error('saveAccountInfo catch error:',error);
        }
    }
    static showString(str:string):void{
        if(ALConfig.GamePlatform != PlatformEnum.WeChat)
            return;
        if(!window.ShowReportTips){
            return;
        }
        var durTime = 300;
        let showstr = () => {
            if(ALUtil.Showing){
                return;
            }
            if(ALUtil.ToastStrList.length == 0){
                return;
            }
            ALUtil.Showing = true;
            ALConfig.RunEnv.showToast({
                title: '打点:'+ ALUtil.ToastStrList.shift(),
                icon: 'success',
                duration: durTime,
                success:()=>{
                    if(ALUtil.TimerID){
                        clearTimeout(ALUtil.TimerID);
                    }
                    ALUtil.TimerID = setTimeout(()=>{
                        ALUtil.Showing = false;
                        ALUtil.TimerID  = null;
                        showstr();
                    },durTime);
                    console.log('showtoast success');
                },
                fail:()=>{
                    ALUtil.Showing = false;
                },
                complete:()=>{
                    ALUtil.Showing = true;
                }
            })   
        }
        //if(ALConfig.AccountInfo && ALConfig.AccountInfo.miniProgram.envVersion == 'develop'){
            ALUtil.ToastStrList.push(str);
            showstr();
            // let context = canvas.getContext('2d');
            // context.font = '32px Arial';
            // context.textAligin = 'center';
            // context.fillStyle = 'rgb(122, 61,25)';
            // context.fillText(str);
        //}
    }
}
