
export default class RaceTraceConfig {

    //赛道配置信息
    public static RaceTrackInfo: Array<{
        TrackId: number, Speed: number, Ratio: number, CurveSpeed: number, Acceleration: number, TimeMultiple: number
    }> = [];
    public static setRaceTrackInfo(data: Array<any>) {
        for (let i = 0, len = data.length; i < len; i++) {
            this.RaceTrackInfo[i] = {
                TrackId: data[i].TrackId,
                Speed: data[i].Speed,
                Ratio: data[i].Ratio,
                CurveSpeed: data[i].CurveSpeed,
                Acceleration: data[i].Acceleration,
                TimeMultiple: data[i].TimeMultiple,
            }
        }
    }


}