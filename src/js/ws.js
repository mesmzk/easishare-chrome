$.soap({
		appendMethodToURL: false,
		soap12: true,
		namespaceURL: 'http://tempuri.org/',
});
var HandleSOAPError = function HandleSOAPErrorF(soapResponse, callback){
	callback({ Success: false, ResultCode: -10000, ErrorMessage: soapResponse.status + "  " + soapResponse.httpCode });
};
var GetUrl = function GetUrlF(asmx){
	return localStorage["url"] + '/' + asmx;
};
var GetSettings = function GetSettingsF(){
	return {
		username: localStorage['username'],
		password: window.atob(localStorage['password'])
	};
};
var GetToken = function GetTokenF(){
	return localStorage['token'];
};
var SetToken = function SetTokenF(token){
	localStorage['token'] = token;
};
var WSLogin = function WSLoginF(username, password, callback){
	SetToken('');
	var url = GetUrl('Share.asmx');
	$.soap({
		url: url,
		method: 'Login',
		data: {
			Username: username,
			Password: password,
			Options: {
				DeviceID: /Chrome[^\s]+/.exec(navigator.userAgent)[0].replace(/\//g, ' '),
				DeviceType: "EasiSharePortal",
				AppVersion: "0.1",
				DeviceName: "Chrome Extension",
				DeviceSystem: "Google Chrome"
			}
		},

		success: function (soapResponse) {
			var res = $.xml2json($(soapResponse.toXML()).find('LoginResult')[0]).LoginResult;
			res.Success = res.ResultCode == '0';
			if(res.Success){
				SetToken(res.Result);
			}
			callback(res);
		},
		error: function (SOAPResponse) {
			HandleSOAPError(SOAPResponse, callback);
		}
	});
};
var CallWS = function CallWSF(method, callback){
	var methodArgs = arguments.length > 2 ? Array.prototype.splice.call(arguments, 2, arguments.length - 2): [];
	var token = GetToken();
	if(!token || token.length == 0){
		Relogin(method, callback, methodArgs);
		return;
	}
	methodArgs.unshift(function(result){
		if(result && result.InvalidToken){
			Relogin(method, callback, methodArgs);
			return;		
		}
		callback(result);
	});
	method.apply(this, methodArgs);
};
var Relogin = function ReloginF(method, callback, methodArgs){
	var sets = GetSettings();
	if(sets && sets.username && sets.password){
		WSLogin(sets.username, sets.password, function(loginResult){
			if(loginResult.Success){
				methodArgs.unshift(callback)
				method.apply(this, methodArgs);
			}else{
				callback(loginResult);
			}
		});
	}
};
var GetDeviceStatus = function GetDeviceStatusF(callback){
	CallWS(GetDeviceStatusWS, callback);
};
var GetDeviceStatusWS = function GetDeviceStatusWSF(callback){
	var url = GetUrl('EasiShareWS.asmx');
	var token = GetToken();
	$.soap({
		url: url,
		method: 'GetDeviceStatus',

		data: {
			Token: token
		},

		success: function (soapResponse) {
			var res = $.xml2json($(soapResponse.toXML()).find('GetDeviceStatusResult')[0]);
			res.Success = res.GetDeviceStatusResult == "1;A";
			res.Result = res.GetDeviceStatusResult;
			res.InvalidToken = new RegExp(/^-1;/).test(res.GetDeviceStatusResult);
			if(!res.Success) { res.ErrorMessage = "Device inactive"; }
			callback(res);
		},
		error: function (SOAPResponse) {
			HandleSOAPError(SOAPResponse, callback);
		}
	});
};
var GetSharedList = function GetSharedListF(callback, sinceDate){
	CallWS(GetSharedListWS, callback, sinceDate);	
};
var GetSharedListWS = function GetSharedListWSF(callback, sinceDate){
	var url = GetUrl('Share.asmx');
	var token = GetToken();
	$.soap({
		url: url,
		method: 'GetSharedList',

		data: {
			Options: {
				Token: token,
				SharedInList: true,
				FilterOutSharedToSender: true,
				SinceDate: sinceDate
			}
		},

		success: function (soapResponse) {
			var res = $.xml2json($(soapResponse.toXML()).find('GetSharedListResult')[0]).GetSharedListResult;
			res.Success = res.ResultCode == '0';
			res.InvalidToken = res.ResultCode == '-1';
			if(!res.Result || res.Result == "") res.Result = { FileProperty: []};
			res.Result = res.Result.FileProperty;
			if(Object.prototype.toString.call( res.Result ) !== '[object Array]') res.Result = [res.Result];
			callback(res);
		},
		error: function (SOAPResponse) {
			HandleSOAPError(SOAPResponse, callback);
		}
	});
};