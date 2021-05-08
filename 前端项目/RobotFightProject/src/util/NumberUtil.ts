
/**
*
* @ Author: Xuetu
* @ Data: 2020-02-29 21:37
*/
export default class NumberUtil {

    /**转换 比如1234.6，return 1,345    123456  1.23万    1 2345 6789  1.23亿*/
    public static getLongNum(num: any):string {
        //取正负
        let isNegative = false;
        if (num < 0) {
            isNegative = true;
            num *= -1;
        }
        let tempNum: number;
        tempNum = Math.floor(num);//取整
        let numstr = tempNum.toString();
        let houStr = ``

        if (numstr.length > 12) {
            tempNum = Math.floor(tempNum / 10000000000)
            tempNum = tempNum / 100;
            houStr = "万亿"
        } else if (numstr.length > 8) {
            tempNum = Math.floor(tempNum / 1000000)
            tempNum = tempNum / 100;
            houStr = "亿"
        } else if (numstr.length > 4) {
            tempNum = Math.floor(tempNum / 100)
            tempNum = tempNum / 100;
            houStr = "万"
        } else {
            houStr = "";
        }

        let result = '';
        let sp = tempNum.toString().split('.');
        let counter = 0
        for (var i = sp[0].length - 1; i >= 0; i--) {
            counter++;
            result = sp[0].charAt(i) + result;
            if (!(counter % 3) && i != 0) {
                result = ',' + result;
            }
        }


        if (sp[1]) {
            result = result + '.' + sp[1];
        } else {
             result = result + '.00';
        }

        result = result + houStr;

        if (isNegative) {
            result = '-' + result;
        }
        return result;

    }

    //0-10的中文
    public static getNumToWorld(num: number): string {
        //["零","一","二"]
        switch (num) {
            case 0:
                return "零";
            case 1:
                return "一";
            case 2:
                return "二";
            case 3:
                return "三";
            case 4:
                return "四";
            case 5:
                return "五";
            case 6:
                return "六";
            case 7:
                return "七";
            case 8:
                return "八";
            case 9:
                return "九";
            case 10:
                return "十";
            default:
            return "*";
        }

    }


    /**转换数字为 国际千分位显示 比如12345.6，return 12,345.60 */
    public static getInternationalNum(num: any): string {
        let isNegative = false;
        if (num < 0) {
            isNegative = true;
            num *= -1;
        }

        let numstr = num.toFixed(2);
        let sp = numstr.split('.');
        let result = '';
        let counter = 0
        for (var i = sp[0].length - 1; i >= 0; i--) {
            counter++;
            result = sp[0].charAt(i) + result;
            if (!(counter % 3) && i != 0) {
                result = ',' + result;
            }
        }
        if (sp[1]) {
            result = result + '.' + sp[1];
        } else {
            result = result + '.00';
        }

        if (isNegative) {
            result = '-' + result;
        }
        return result;
    }
    /**获得一个格式化的字符串，保留两位小数形式(12.3会变成12.30、12.345会变成12.35、12会变成12.00) */
    public static getSettleFont(num: number): string {
        var zsNum: number = num | 0;
        var xsNum: number = num - zsNum;
        var xsLen: number = xsNum.toString().length;
        if (xsLen == 1) {
            return `${num}.00`;
        } else if (xsNum.toString().length == 3) {
            return `${zsNum + xsNum}0`;
        } else {
            return num.toFixed(2);
        }
    }

    /**text 数字滚动变化 */
    public static rollTextNumber(ori: number, final: number, target: Laya.Text) {
        if (ori > final) {
            target.text = this.getLongNum(final);
            return;
        }

        let addtime = 20;
        let eachadd = ((final - ori) / addtime);
        for (let i = 0; i < addtime; i++) {
            Laya.timer.once(100 * i, this, function () {
                ori += eachadd;
                target.text = this.getLongNum(ori);
            })
        }

        Laya.timer.once(100 * addtime, this, function () {
            target.text = this.getLongNum(final);
        })
    }

    /**fontClip 数字滚动变化 */
    public static rollFontClipNumber(ori: number, final: number, target: Laya.FontClip) {
        if (ori > final) {
            target.value = this.getInternationalNum(final);
            return;
        }

        let addtime = 20;
        let eachadd = ((final - ori) / addtime);
        for (let i = 0; i < addtime; i++) {
            Laya.timer.once(100 * i, this, function () {
                ori += eachadd;
                target.value = this.getInternationalNum(ori);
            })
        }

        Laya.timer.once(100 * addtime, this, function () {
            target.value = this.getInternationalNum(final);
        })
    }

    /**Labe 数字滚动变化*/
    public static rollLableNumber1(start:number,end:number,target:Laya.Label,addtime:number=10)
    {
        target.text =(start|0).toString();
        Laya.timer.clear(this,this.rollFun1);
        let eachadd = ((end - start) / addtime);
        for (let i = 0; i < addtime; i++) {
            Laya.timer.once(50 * i, this,this.rollFun1,[start, eachadd*(i+1),target],false);
        }
    }

    public static rollFun1(start,num,target)
    {
        target.text = ((start+num)|0).toString();
    }
   /**Labe 数字滚动变化*/
   public static rollLableNumber0(start:number,end:number,target:Laya.Label,addtime:number=10)
   {
       target.text =(start|0).toString();
       Laya.timer.clear(this,this.rollFun0);
       let eachadd = ((end - start) / addtime);
       for (let i = 0; i < addtime; i++) {
           Laya.timer.once(50 * i, this,this.rollFun0,[start,eachadd*(i+1),target],false);
       }
   }

   public static rollFun0(start,num,target)
   {
       target.text = ((start+num)|0).toString();
   }

       /**Labe 数字滚动变化*/
       public static rollLableNumberSettle(start:number,end:number,target:Laya.Label,addtime:number=20)
       {
           let eachadd = ((end - start) / addtime);
           for (let i = 0; i < addtime; i++) {
               Laya.timer.once(100 * i, this, function () {
                   start += eachadd;
                   target.text = (start|0).toString();
               },null,true);
           }
   
           Laya.timer.once(100 * addtime, this, function () {
               target.text = (end|0).toString();
           },null,true);
       }


    /**驗證手機號碼是否正確,1為驗證手機號，2為驗證密碼 */
    public static checkPhoneNum(type: number, number: string): boolean {
        switch (type) {
            case 1:
                return /^1[3-9]\d{9}$/.test(number);
            case 2:
                return /^[a-zA-Z0-9_]{1,}$/.test(number)
        }
    }
}
