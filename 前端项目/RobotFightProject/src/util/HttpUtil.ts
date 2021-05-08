import { ALUtil } from "./ALUtil";
import { ALConfig } from "../ALConfig";
import { PlatformEnum } from "../ALData";

export const METHOD_GET = "GET";
export const METHOD_POST = "POST";

export interface HTTPRSP {
	isSucc: boolean;
	data?: any;
	reason?: string;
}

export interface HTTPData {
	msg: string;
	code: number;
	ret: number;
	data?: any;
}

declare let wx: any;
declare let qq: any;

export class HttpUtil {

	public static Authorization: string = null

	public static GET(URL: string, param?: any, cb?: Function,headers?: any){
		this._request(URL, METHOD_GET, param, cb,headers);
	}

	public static POST(URL: string, param?: any,cb?: Function, headers?: any){
		this._request(URL, METHOD_POST, param,cb, headers);
	}

	private static _request(url: string, method: string, param?: any, cb?: Function,headers?: any) {
		ALUtil.LOG("请求参数[param]", param);
		param.request_time=new Date().getTime();
		if (ALConfig.GamePlatform== PlatformEnum.WeChat||ALConfig.GamePlatform==PlatformEnum.QQ||ALConfig.GamePlatform==PlatformEnum.TouTiao||ALConfig.GamePlatform==PlatformEnum.Vivo) {//只有这几个平台可以request
			
			if (method == 'GET') {
				if (param) url = url + encodeURI("?"+this.objParam2PostString(param));
			}
			ALUtil.LOG("HttpUtil url ----- ", url);

			const params: any = {
				url: url,
				method: method,
				success(res: any) {
					ALUtil.LOG("HttpUtil responseText---", res);
					try {
						const httpData = <HTTPData>res.data;
						if (!httpData || httpData.code === 0 || httpData.ret === 0) {
							cb({
								isSucc: true,
								data: httpData ? httpData.data : null
							});
							return;
						} else {
							ALUtil.LOG('HttpUtil json---');
							cb({
								isSucc: false,
								reason: httpData.msg
							});
							return;
						}
					} catch (e) {
						ALUtil.LOG('HttpUtil parse---', e);
						cb({
							isSucc: false,
							reason: 'json_parse_error'
						});
						return;
					}
				},
				fail(res: any) {
					ALUtil.LOG('HttpUtil fail---', res);
					cb({
						isSucc: false,
						reason: 'network_error'
					});
					return;
				}
			}

			if (this.Authorization) {
				params.header = {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': this.Authorization
				};
			} else {
				params.header = {
					'content-type': 'application/x-www-form-urlencoded'
				};
			}

			//设置其他content-type
			if(headers&&headers['content-type']&&headers['content-type']!="application/x-www-form-urlencoded"){
				params.header["content-type"]=headers['content-type']
			}

			if (param) {
				params.data = param;
			}
			// const wxQQ = ALUtil.wxExist() ? wx : qq;
			ALConfig.RunEnv.request(params);
			
		} else {
			
			const req = new XMLHttpRequest();
			let paramData = null;
			if (method == 'GET') {
				if (param) url = url + encodeURI("?"+this.objParam2PostString(param));
			} else {
				// paramData = param == null ? null : encodeURI(this.objParam2PostString(param));
			}
			// ALUtil.LOG("HttpUtil url ----- ", url);

			req.open(method, url, true);
			// req.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			//设置其他header
			if(headers&&headers['content-type']&&headers['content-type']!="application/x-www-form-urlencoded"){
				req.setRequestHeader("content-type", headers['content-type']);
				if(param){
					paramData = param
				}
			}else{
				req.setRequestHeader("content-type", "application/x-www-form-urlencoded");
				paramData = param == null ? null : encodeURI(this.objParam2PostString(param));
			}
			//设置请求头
			if (this.Authorization) {
				req.setRequestHeader("Authorization", this.Authorization);
			}

			req.onreadystatechange = () => {
				// ALUtil.LOG("HttpUtil readyState---", req.readyState, req.status);
				if (req.readyState === 4 && (req.status > 199 && req.status < 400)) {
					ALUtil.LOG("HttpUtil responseText---", req.responseText);
					try {
						const ret = req.responseText ? JSON.parse(req.responseText) : null;
						const httpData = <HTTPData>ret;
						if (!httpData || httpData.code === 0 || httpData.ret === 0) {
							cb({
								isSucc: true,
								data: httpData ? httpData.data : null
							});
							return;
						} else {
							ALUtil.LOG('HttpUtil json---');
							cb({
								isSucc: false,
								reason: httpData.msg
							});
							return;
						}
					} catch (e) {
						ALUtil.LOG('HttpUtil parse---', e);
						cb({
							isSucc: false,
							reason: 'json_parse_error'
						});
						return;
					}
				}
			}
			req.onerror = (ev: any) => {
				ALUtil.LOG('HttpUtil onerror---', ev);
				cb({
					isSucc: false,
					reason: 'network_error'
				});
				return;
			}
			req.ontimeout = (ev: ProgressEvent) => {
				ALUtil.LOG('HttpUtil ontimeout---', ev);
				cb({
					isSucc: false,
					reason: 'timeout_error'
				});
				return;
			}
			req.send(paramData);
		
		}
	}

	// private static _request(url: string, method: string, param?: any, headers?: any) {
	// 	if (typeof wx !== 'undefined'||typeof qq !== 'undefined') {
	// 		return new Promise<HTTPRSP>((resolve, reject) => {
	// 			if (method == 'GET') {
	// 				if (param) url = url + encodeURI(this.objParam2GetString(param));
	// 			}
	// 			ALUtil.LOG("HttpUtil url ----- ", url);

	// 			const params: any = {
	// 				url: url,
	// 				method: method,
	// 				success(res: any) {
	// 					ALUtil.LOG("HttpUtil responseText---", res);
	// 					try {
	// 						const httpData = <HTTPData>res.data;
	// 						if (!httpData || httpData.code === 0 || httpData.ret === 0) {
	// 							resolve({
	// 								isSucc: true,
	// 								data: httpData ? httpData.data : null
	// 							});
	// 						} else {
	// 							ALUtil.LOG('HttpUtil json---');
	// 							resolve({
	// 								isSucc: false,
	// 								reason: httpData.msg
	// 							});
	// 						}
	// 					} catch (e) {
	// 						ALUtil.LOG('HttpUtil parse---', e);
	// 						resolve({
	// 							isSucc: false,
	// 							reason: 'json_parse_error'
	// 						});
	// 					}
	// 				},
	// 				fail(res: any) {
	// 					ALUtil.LOG('HttpUtil fail---', res);
	// 					resolve({
	// 						isSucc: false,
	// 						reason: 'network_error'
	// 					});
	// 				}
	// 			}

	// 			if (this.Authorization) {
	// 				params.header = {
	// 					'content-type': 'application/x-www-form-urlencoded',
	// 					'Authorization': this.Authorization
	// 				};
	// 			} else {
	// 				params.header = {
	// 					'content-type': 'application/x-www-form-urlencoded'
	// 				};
	// 			}

	// 			if (param) {
	// 				params.data = param;
	// 			}
	// 			const wxQQ = ALUtil.wxExist() ? wx : qq;
	// 			wxQQ.request(params);
	// 		});
	// 	} else {
	// 		return new Promise<HTTPRSP>((resolve, reject) => {
	// 			const req = new XMLHttpRequest();
	// 			let paramData = null;
	// 			if (method == 'GET') {
	// 				if (param) url = url + encodeURI(this.objParam2GetString(param));
	// 			} else {
	// 				paramData = param == null ? null : encodeURI(this.objParam2PostString(param));
	// 			}
	// 			// ALUtil.LOG("HttpUtil url ----- ", url);

	// 			req.open(method, url, true);
	// 			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	// 			//设置请求头
	// 			if (this.Authorization) {
	// 				req.setRequestHeader("Authorization", this.Authorization);
	// 			}

	// 			req.onreadystatechange = () => {
	// 				// ALUtil.LOG("HttpUtil readyState---", req.readyState, req.status);
	// 				if (req.readyState === 4 && (req.status > 199 && req.status < 400)) {
	// 					ALUtil.LOG("HttpUtil responseText---", req.responseText);
	// 					try {
	// 						const ret = req.responseText ? JSON.parse(req.responseText) : null;
	// 						const httpData = <HTTPData>ret;
	// 						if (!httpData || httpData.code === 0 || httpData.ret === 0) {
	// 							resolve({
	// 								isSucc: true,
	// 								data: httpData ? httpData.data : null
	// 							});
	// 						} else {
	// 							ALUtil.LOG('HttpUtil json---');
	// 							resolve({
	// 								isSucc: false,
	// 								reason: httpData.msg
	// 							});
	// 						}
	// 					} catch (e) {
	// 						ALUtil.LOG('HttpUtil parse---', e);
	// 						resolve({
	// 							isSucc: false,
	// 							reason: 'json_parse_error'
	// 						});
	// 					}
	// 				}
	// 			}
	// 			req.onerror = (ev: any) => {
	// 				ALUtil.LOG('HttpUtil onerror---', ev);
	// 				resolve({
	// 					isSucc: false,
	// 					reason: 'network_error'
	// 				});
	// 			}
	// 			req.ontimeout = (ev: ProgressEvent) => {
	// 				ALUtil.LOG('HttpUtil ontimeout---', ev);
	// 				resolve({
	// 					isSucc: false,
	// 					reason: 'timeout_error'
	// 				});
	// 			}
	// 			req.send(paramData);
	// 		});
	// 	}
	// }

	/**
	 * 将对象转成Post请求参数
	 * @param obj 对象
	 */
	private static objParam2PostString(obj: any) {
		let paramStr = "";
		for (var k in obj) {
			paramStr += (k + "=" + obj[k]);
			paramStr += "&";
		}
		if (paramStr != "") {
			paramStr = paramStr.slice(0, paramStr.length - 1);
		}
		return paramStr;
	}

}
