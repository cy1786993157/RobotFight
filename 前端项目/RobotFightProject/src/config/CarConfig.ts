

export default class CarConfig{

      //赛道配置信息
      public static carInfo: Array<Array<{
        TrackId: number,Speed:number, Ratio: number, CurveSpeed: number, Acceleration: number, TimeMultiple: number,
        Speed1:number,
    }>>=[];

    public static initData()
    {
        this.carInfo=[];
        this.carConstInfo=[];
    }


     public static setRaceTrackInfo(data:Array<any>)
    {
        for (let i = 0, len = data.length; i < len; i++) {
            this.carInfo[i]=[];
            this.carInfo[i][0] = {
                TrackId: data[i].TrackId,
                Speed:data[i].Speed,
                Speed1:data[i].Speed1,
                Ratio: data[i].Ratio,
                CurveSpeed: data[i].CurveSpeed,
                Acceleration: data[i].Acceleration,
                TimeMultiple: data[i].TimeMultiple,
            };
            this.carInfo[i][1] = {
                TrackId: data[i].TrackId,
                Speed:data[i].Speed,
                Speed1:data[i].Speed1,
                Ratio: data[i].Ratio,
                CurveSpeed: data[i].CurveSpeed,
                Acceleration: data[i].Acceleration,
                TimeMultiple: data[i].TimeMultiple,
            };
        }
    }


    //评分信息
    public static scoreInfo:{line:number,away:number,addSpeed100:number}
    public static setScoreInfo(data:Array<any>)
    {
        this.scoreInfo={line:data[8].Value,away:data[9].Value,addSpeed100:data[10].Value}
    }

    /**
     * scene  场景id   carPos 自己车位置   curCameraPos 相机位置 
     *  
     * 
     */

    //每关的常量配置
    public static carConstInfo:Array<{ scene:number, carPos:Laya.Vector3,curCameraPos:Laya.Vector3,curCameraRot:Laya.Vector3 ,car2Pos:Laya.Vector3,
    renderCameraPos:Laya.Vector3,renderCameraRot:Laya.Vector3,renderCameraSize:number,aniTime:number,lineNum:number,awayNum:number,
    camerConst:number,minMapIsGensui:boolean,isNew:boolean

}>=[]; 

    public static setCarConstInfo()
    {
        this.carConstInfo=[
            {scene:0,carPos:new Laya.Vector3(-197.5, 98.3, -112),curCameraPos:new Laya.Vector3(-210, 120, -103),
                curCameraRot:new Laya.Vector3(-51, -58, 0),car2Pos:new Laya.Vector3(-197.5, 98.3, -112),renderCameraPos:new Laya.Vector3(-172.8, 200, -137),
                 renderCameraRot:new Laya.Vector3(-90, 0, 0),
                 renderCameraSize:80,
                 aniTime:1224,
                 lineNum:7,
                 awayNum:10,
                 camerConst:5,
                 minMapIsGensui:false,
                 isNew:false,

                },
            {scene:1,carPos:new Laya.Vector3(155.5, 300.4, 19.4),
                curCameraPos:new Laya.Vector3(197, 332, 18),
                curCameraRot:new Laya.Vector3(-40, 90, 0),car2Pos:new Laya.Vector3(155.5, 300.4, 19.4),
                renderCameraPos:new Laya.Vector3(163, 800, 20),
                renderCameraRot:new Laya.Vector3(-90, 0, 180),
                renderCameraSize:80,
                aniTime:1224,
                lineNum:6,
                awayNum:6,
                camerConst:10,
                minMapIsGensui:true,
                isNew:false,
            },
            {scene:2,carPos:new Laya.Vector3(157, 209.5, -146),
                curCameraPos:new Laya.Vector3(190, 230, -148),
                curCameraRot:new Laya.Vector3(-31, 90, 0),car2Pos:new Laya.Vector3(157, 209.5, -154),
                renderCameraPos:new Laya.Vector3(130, 800, -140),
                renderCameraRot:new Laya.Vector3(-90, 0, 180),
                renderCameraSize:80,
                aniTime:1224,
                lineNum:0,
                awayNum:0,
                camerConst:10,
                minMapIsGensui:true,
                isNew:true,
            },
        ]
    }

    //音效配置
    public static carSoundInfo:Array<{Music1:string,Music2:string,Music3:string}>=[]
    
    public static setCarSoundInfo(data:Array<any>)
    {
        for (let i = 0, len = data.length; i < len; i++) {
            this.carSoundInfo[i]={
                Music1:data[i].Music1,
                Music2:data[i].Music2,
                Music3:data[i].Music3,
            }
        }

    }
    


}