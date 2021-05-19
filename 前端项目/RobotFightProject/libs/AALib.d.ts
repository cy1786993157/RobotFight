declare module AA{
class ParticleController {
    private totalTime;
    prefabId: number;
    playCompleteFn: Function;
    parentSprite3D: Laya.Sprite3D;
    psArray: Array<Laya.ShuriKenParticle3D>;
    duration: number;
    /**duration：-1 表示无限循环  0：默认计算的最大时间 >0:单位毫秒的时间 */
    init(ps: Laya.Sprite3D, duration?: number): void;
    processPS(root: Laya.Sprite3D): void;
    play(pNode?: Laya.Node, scale?: number): void;
    stop(): void;
    onPlayComplete(): void;
    destroy(): void;
}
class ViewController {
    private static _appDic;
    private static _uiLoadscene;
    static setLoadingPage(uiLoadScene: Laya.Scene): void;
    private static isOpenMap;
    /**
     * 显示对话框
     * @param viewKey
     * @param closeOther 是否关闭其它的对话框。若值为true则关闭其它对话框。
     */
    static show(viewKey: string, data?: any, closeOther?: boolean): void;
    static close(viewKey: string): void;
    static getView(viewKey: string): Laya.Scene;
    static destory(viewKey: string): void;
}
/**
*
* @ Author: Darker
* @ Data: 2020-02-07 13:50
*/
class LibEvent {
    /**服务器登录失败 */
    static SERVER_LOGIN_FAIL: string;
    /**服务器SKEY过期 */
    static SERVER_SKEY_EXPIRE: string;
    /**登录分区服务器请求 */
    static LOGIN_REGION_SERVER: string;
    /**请求http连接错误 */
    static HTTP_REQ_ERROR: string;
    /**socket连接成功 */
    static CONNECT_SERVER_SUCCESS: string;
    /**收到socket消息 */
    static REC_SOCKET_MSG: string;
    static WS_CLOSED: string;
    /** 子游戏断线重连事件 */
    static SUBGAME_RECONNECT: string;
}
class LibHttpCmd {
    static ACCOUNT_LOGIN: string;
    static REGION_LOGIN: number;
    static MOBILE_LOGIN: string;
    static VISITOR_LOGIN: string;
    static ACCOUNT_OPERATE: string;
    static GET_VERIFY_CODE: string;
}
/**
 * <code>EventDispatcher</code> 类是可调度事件的所有类的基类。
 */
class EventDispatcher extends Laya.EventDispatcher {
    constructor();
    addEventListener(type: string, caller: any, listener: Function, args?: Array<any>): Laya.EventDispatcher;
    removeEventListener(type: string, caller: any, listener: Function, onceOnly?: boolean): Laya.EventDispatcher;
    hasEventListener(type: string): boolean;
    /**
     * 派发事件。
     * @param type	事件类型。
     * @param data	（可选）回调数据。<b>注意：</b>如果是需要传递多个参数 p1,p2,p3,...可以使用数组结构如：[p1,p2,p3,...] ；如果需要回调单个参数 p ，且 p 是一个数组，则需要使用结构如：[p]，其他的单个参数 p ，可以直接传入参数 p。
     * @return 此事件类型是否有侦听者，如果有侦听者则值为 true，否则值为 false。
     */
    dispatchEvent(type: string, data?: any): boolean;
}
/**
 * 事件管理器
 *
 */
class EventManager {
    private static _evtMap;
    constructor();
    /**
     * 发送事件(Event)
     * @param e
     */
    static dispatchEvent(type: any, ...args: any[]): void;
    /**
     * 添加事件侦听
     * @param type
     * @param listener
     *
     */
    static addEvent(type: any, caller: any, listener: Function, ...args: any[]): void;
    /**
     * 移除事件侦听
     * @param type
     * @param listener
     *
     */
    static removeEvent(type: any, caller: any, listener: Function): void;
    /**
     * 是否已经侦听了某类型事件
     * @param type
     * @return
     *
     */
    static hasTypeEvent(type: any): boolean;
    /**
     * 是否已经侦听了某类型某个事件
     * @param type
     * @return
     *
     */
    static hasEvent(type: any, caller: any, listener: Function): boolean;
    /**
     * 删除所有的事件监听
     *
     */
    static removeAllEvents(): void;
    /**
     * 返回同一类型事件列表
     * @param type
     * @return
     *
     */
    static getTypeEventList(type: any): Function[];
    /**
     * 返回同一类型事件列表
     * @param type
     * @return
     *
     */
    static getTypeEventsNum(type: any): number;
}
class GameManager {
    /**
     * 游戏启动类型
     */
    static gameStartUpType: number;
    /**是否开启调试模式
     * Debug模式下：
     * 1.会打印帧处理器中执行耗时超过5毫秒的函数
     * 2.会在底层检测耗时超过5毫秒的协议处理
     *
    */
    static isOpenDebug: boolean;
    private static _isTrace;
    static get isTrace(): boolean;
    static set isTrace(value: boolean);
    /**
     * 动态加载一个js文件
     * @param url 脚本路径
     * @param success 加载成功的回调
     * @param fail 加载失败的回调
     */
    static loadScript(url: string, success?: Function, fail?: Function, isNeedReload?: boolean): void;
    private static jsLoadTimes;
    private static allLoadedScript;
    static scriptISLoaded(url: string): boolean;
    static destroyScript(url: string): void;
}
enum GameStartUpType {
    GAME_STARTER = 0,
    GAME_LOBBY = 1,
    GAME_SUBGAME = 2
}
class MsgLockManager {
    private static _dic;
    static isLock(msg: any): boolean;
    static addLock(msg: any, time: number): void;
}
class ByteBuffer extends Laya.Byte {
    constructor(endianType?: string);
    writeVarint32(value: number): void;
    readVarint32(): number;
    readUint32(): number;
    writeUint32(value: number): void;
}
class GameSocket {
    private static _ins;
    private socket;
    serverIP: string;
    static get ins(): GameSocket;
    private constructor();
    private init;
    get connected(): boolean;
    connect(): void;
    send(outerBuf: any): void;
    private openHandler;
    private receiveHandler;
    private closeHandler;
    private errorHandler;
    close(): void;
}
class MiNi {
    constructor();
    static _miniHttpSerer: MiniServer;
    static setup(serverIP: string): void;
    static login(api: any, data: any): void;
    static regionLogin(): void;
    static request(api: any, data?: any, method?: string, heads?: any): void;
}
class MiniHttpRequest extends EventDispatcher {
    private _startTime;
    private _url;
    constructor();
    /**
     * 发送服务器请求
     * @param url
     * @param method
     * @param data
     * @param header
     */
    request(url: string, method: string, data?: any, header?: any): void;
    private onSuccess;
    private onFail;
}
class MiniServer {
    static WX_HEADER_CODE: 'X-WX-Code';
    static WX_HEADER_ENCRYPTED_DATA: 'X-WX-Encrypted-Data';
    static WX_HEADER_IV: 'X-WX-IV';
    static WX_HEADER_ID: 'X-WX-Id';
    static HEADER_TOKEN: 'X-Token';
    static WX_HEADER_REGION: string;
    static X_WX_GAME_ID: string;
    static X_WX_OPEN_ID: string;
    static CONTENT_TYPE: string;
    private _serverAddr;
    private _access_token;
    constructor();
    get access_token(): string;
    setup(serverAddr: string): void;
    login(data: any): void;
    regionLogin(): void;
    get isLoginSuccess(): boolean;
    request(api: any, data?: any, method?: string, heads?: any): void;
    private onReqSuccess;
    private onReqError;
}
class ArrayUtil {
    /**随机化一个数组*/
    static randomArray(array: Array<any>): Array<any>;
    private static randomArrayBySeed;
    /**一维数组转换成二维数组 */
    static dimension1To2(ary1: Array<any>, rowNum: number): Array<any>;
    static swatArray(ary: Array<any>, index1: number, index2: number): void;
    static getArraySameValue(ary1: Array<any>, ary2: Array<any>): Array<any>;
    /**获取 ary1 - ary2 的值 */
    static getArrayDiffValue(ary1: Array<any>, ary2: Array<any>): Array<any>;
}
class CallBackFunc {
    private thisArgs;
    private func;
    private args;
    constructor(thisArgs: any, func: Function, ...args: any[]);
    call(...calArgs: any[]): void;
}
class D3Tween {
    private static tweenMap;
    /**
     *
     * @param target 目标物体
     * @param toPos 要去的目的地
     * @param duration 间隔
     * @param caller 回调执行领域
     * @param ease 缓动函数
     * @param complete 播放完成回调
     * @param delay 延迟
     * @param coverBefore 是否覆盖上一个缓动
     * @param update 更新函数
     * @param frame 帧数间隔
     */
    static MoveTo(target: Laya.Sprite3D, toPos: Laya.Vector3, duration: number, caller: any, ease?: Function, complete?: Function, delay?: number, coverBefore?: boolean, update?: Function): void;
    static RotateTo(target: Laya.Sprite3D, toRotation: Laya.Vector3, duration: number, caller: any, ease?: Function, complete?: Function, delay?: number, coverBefore?: boolean, update?: Function): void;
    static RotateQuaternionTo(target: Laya.Sprite3D, toRotation: Laya.Quaternion, duration: number, caller: any, ease?: Function, complete?: Function, delay?: number, coverBefore?: boolean, update?: Function): void;
    static ScaleTo(target: Laya.Sprite3D, toScale: Laya.Vector3, duration: number, caller: any, ease?: Function, complete?: Function, delay?: number, coverBefore?: boolean, update?: Function): void;
    private static cacheTween;
    /**
     * 清除3d物体上的所有缓动动画
     * @param target
     */
    static ClearTween(target: Laya.Sprite3D): void;
}
/**
* <code>Dictionary</code> 是一个字典型的数据存取类。
*/
class Dictionary {
    private _keyValues;
    constructor();
    /**
     * 给指定的键名设置值。
     * @param	key 键名。
     * @param	value 值。
     */
    set(key: any, value: any): void;
    /**
     * 返回指定键名的值。
     * @param	key 键名对象。
     * @return 指定键名的值。
     */
    get(key: any): any;
    /**
     * 移除指定键名的值。
     * @param	key 键名对象。
     * @return 是否成功移除。
     */
    remove(key: any): boolean;
    /**
     * 清除此对象的键名列表和键值列表。
     */
    clear(): void;
    get keys(): Array<any>;
}
/**
 * 可以将循环内的大量操作分解到这个函数中执行
 * @author lymeng
 */
class FrameApplyUtil {
    /**
     * 保存所有待执行的handler，这里偷了个懒，直接使用了Laya内部的Handler
     * 如果后期性能还是低，可以考虑改成自定义的对象，只保留需要的数据
     */
    private static handlerList;
    /**最少执行的方法数量*/
    static minRunFunNum: number;
    /**初始化帧处理器 */
    static init(): void;
    /**添加一个handler到待执行列表中 */
    static addHandler(handler: Laya.Handler): void;
    /**添加一个function到待执行列表中 */
    static addFun(call: object, fun: Function, args?: any[]): void;
    private static thisRunNum;
    private static onUpdate;
    /**清除所有handler */
    static clearAll(): void;
}
class MathUtil {
    /**随机数种子 */
    static seed: number;
    static seedIndex: number;
    static seedAry: Array<number>;
    private static tempPos;
    /**
     * 获取一个指定范围内的随机整数 （不带参数默认0-100内）
     * @param max 最大值
     * @param min 最小值
     * @return
     *
     */
    static getRandom(min?: number, max?: number): number;
    /**自定义随机方法，根据随机种子变 */
    static seedRandom(min?: number, max?: number): number;
    static getAngleWithTwoPoint(aX: number, aY: number, bX: number, bY: number): number;
    static getRandomNumber(min?: number, max?: number): number;
    static toVec3String(v: Laya.Vector3): string;
    static DistanceOnXZPlane(s: Laya.Vector3, d: Laya.Vector3): number;
    static hasInSight(pos: Laya.Vector3, camera: Laya.Camera): boolean;
    static hexToRgba(hex: string, out?: Laya.Vector4): Laya.Vector4;
    /**
     * 一定范围取随机数
     * @param min 最小值
     * @param max 最大值
     * @param count 随机数量
     */
    static getRandomNums(min: any, max: any, count: any): any[];
    /**TypedArray数组concat 方法
     *
     * concatenate(Uint8Array, Uint8Array.of(1, 2), Uint8Array.of(3, 4))
    */
    static concatenate(resultConstructor: any, ...arrays: any[]): any;
}
 class ShaderCompileUtil {
    constructor();
    private static isRunning;
    private static callHandler;
    static compileShader(model: any, handler: Laya.Handler): void;
    private static doCompileShader;
    private static allModelObjArr;
    private static findAllObject;
}
class StringUtil {
    /**获得一个删减的字符串，用在玩家名字过长的处理 */
    static getAbridgeString(str: string, len?: number): string;
    /**
     *
     * @param str 需要截断的字符串
     * @param maxChars 保留的汉字长度
     * @param suffix 添加的后缀 （注意，如果后缀不为null或者'' ，则要占用一个汉字的位置,具体看下方的示例代码)
     */
    static strClamp(str: string, maxChars: number, suffix?: string): string;
    /**
     * 获取字符串字数
     * @param str 字符串
     */
    static getLabelCount(str: string): number;
}
class SystemUtil {
    /**
     * 判断当前的运行环境是否在本地
     * @returns 返回true代表在本地
     */
    static isLocal(): boolean;
    /**
     * 获得当前JS所在域
     */
    static getThisBasePath(): string;
}
class TimeUtil {
    /**获取当前时间的字符串：如：1988-1-1 */
    static getTimeStr(): string;
    /**
     *转换日期对象为日期字符串,例如：yyyy-MM-dd hh:mm:ss
      y:年，M:月份，d：天，h：小时，m:分钟，s:秒 S:毫秒
     */
    static formatTime(time: Date, fmt: string): string;
    /**获得 00:00:00 的字符串，小于一小时会显示成 00:00, a:秒*/
    static getSecondTimeFomate(a: number): string;
    /** 获取中文描述的时间 格式：20小时23分50秒  (time:秒)*/
    static getTimeStrFomate(time: number): string;
    /** 获取描述时间 格式：20:23:50  (time:秒)*/
    static getTimeFomate(time: number): string;
    /**
     * 是否过了1天
     * @param curTime 当前时间
     * @param lastTime 上次时间
     */
    static checkIfPass1Day(curTime: Date, lastTime: Date): boolean;
}
class UINumber extends Laya.Sprite {
    private _skin;
    private _align;
    private _gap;
    private _box;
    constructor(skin?: string, gap?: number, align?: string);
    init(skin?: string, gap?: number, align?: string, width?: number): void;
    set gap(value: number);
    private clearBox;
    set number(value: number);
    private createClip;
}
class Utils {
    static findChildRecursive(name: string, root: Laya.Node): any;
    /**递归的执行一个函数，从root节点开始。包含所有的子节点*/
    static runFunctionRecursive(root: Laya.Sprite3D, caller: any, method: Function): void;
    static playerDragonBoneAni(url: string, parentNode: Laya.Node, x: number, y: number, onComplete?: Function): Laya.Skeleton;
}
}
