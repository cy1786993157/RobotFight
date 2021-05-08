
export default class CommonUtil{

    public static  byte2int(b: Uint8Array):number {
        let i:number = 0;
        i += ((b[0] & 0xff) << 24);
        i += ((b[1] & 0xff) << 16);
        i += ((b[2] & 0xff) << 8);
        i += ((b[3] & 0xff));
        return i;
    }

    public static log(any)
    {
        console.log(any);
    }

}