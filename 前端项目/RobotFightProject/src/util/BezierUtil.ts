export default class BezierUtil {
    private p0: Laya.Point = new Laya.Point();
    private p1: Laya.Point = new Laya.Point();
    private p2: Laya.Point = new Laya.Point();
    private _t: number;
    private icon: Laya.Sprite;
    private static _instance: BezierUtil;
    constructor() {

    }

    public static get instance(): BezierUtil {
        if (!BezierUtil._instance) {
            BezierUtil._instance = new BezierUtil();
        }
        return BezierUtil._instance;
    }

    public start(icon: Laya.Sprite, time: number, endP: Laya.Point): void {
        Laya.Tween.clearAll(this);
        if (this.icon) {
            this.end();
        }
        this.icon = icon;
        this._t = 0;
        this.p0.x = icon.x;
        this.p0.y = icon.y;
        this.p2 = endP;
        this.p1.x = icon.x + 600;
        this.p1.y = icon.y - 400;
        console.log("icon");
        console.log(this.icon);
        Laya.Tween.to(this, { t: 1 }, time, null, Laya.Handler.create(this, this.end));
    }

    public end(): void {
        if (this.icon) {
            if (this.icon.parent) {
                this.icon.parent.removeChild(this.icon);
            }
            this.icon.destroy();
        }
    }

    public cancle(): void {
        Laya.Tween.clearAll(this);
        if (this.icon) {
            this.end();
        }
    }

    public get t(): number {
        return this._t;
    }

    public set t(_t: number) {
        this._t = _t;
        let x: number = Math.pow(1 - _t, 2) * this.p0.x + 2 * _t * (1 - _t) * this.p1.x + Math.pow(_t, 2) * this.p2.x;
        let y: number = Math.pow(1 - _t, 2) * this.p0.y + 2 * _t * (1 - _t) * this.p1.y + Math.pow(_t, 2) * this.p2.y;
        console.log(x, y);
        this.icon.x = x;
        this.icon.y = y;
    }

}