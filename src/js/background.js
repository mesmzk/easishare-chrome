document.addEventListener('DOMContentLoaded', easishareload, false);
var loadInterval, inProgess = false;
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.job == "start"){
			loadInterval = setInterval(LoadSharedList, 60000);
		} else if (request.job == "stop") {
			clearInterval(loadInterval);
		} else if (request.job == "reload"){
			if(!inProgess) {
				LoadSharedList(function(){ port.postMessage({res: ""}); });
			}
		}
	}
);
function easishareload() {
	chrome.browserAction.setBadgeText({ text: "?"});
	chrome.browserAction.setBadgeBackgroundColor({"color": [0, 0, 0, 100]});
	localStorage["password"] = "";
	SetToken("");
}
var LoadSharedList = function LoadSharedListF(){
	inProgess = true;
	localStorage['error'] = '';
	chrome.runtime.sendMessage({job: "loadstarted"}, function(response) { });
	var files = localStorage['files'] ? JSON.parse(localStorage['files']) : [];
	var newfiles = localStorage['newfiles'] ? JSON.parse(localStorage['newfiles']) : [];
	var lastrequest = Number(localStorage['lastRequest'] || 0)
	var lastfullrequest = Number(localStorage['lastFullRequest'] || 0);
	var requestTime = new Date().getTime();
	var date = null;
	if(lastrequest > 0 && (requestTime - lastfullrequest) < 6 * 60 * 1000){
		date = new Date(lastrequest).toISOString();
	}
	GetSharedList(function(result) {
		if(result.Success){
			if(date){
				ComparePartialList(result.Result, files, newfiles, requestTime);	
			}else{
				CompareFullList(result.Result, files, requestTime, lastfullrequest);				
			}
			UpdateIcon();
		}else{
			localStorage['error'] = result.ErrorMessage;
		}
		inProgess = false;
		chrome.runtime.sendMessage({job: "loadfinished"}, function(response) { });
	}, date);
};
var CompareFullList = function CompareFullListF(filesResult, files, requestTime, lastfullrequest){
	var IsNewDefault = lastfullrequest > 0;
	var newfiles = $.grep(filesResult, function(o){
		o.IsNew = IsNewDefault;
		$(files).each(function(){
			if(this.ShareId == o.ShareId){
				o.IsNew = this.IsNew;
			}
		});
		return o.IsNew;
	});	
	localStorage['files'] = JSON.stringify(filesResult);
	localStorage['newfiles'] = JSON.stringify(newfiles);
	
	localStorage['lastFullRequest'] = requestTime;
	localStorage['lastRequest'] = requestTime;
};
var ComparePartialList = function ComparePartialList(filesResult, files, newFiles, requestTime){
	var newFilesResult = $.grep(filesResult, function(o){
		o.IsNew = true;
		$(files).each(function(){
			if(this.ShareId == o.ShareId){
				o.IsNew = false;
			}
		});
		return o.IsNew;
	});
	var _files = files.concat(newFilesResult);
	var _newfiles = newFiles.concat(newFilesResult);
	localStorage['files'] = JSON.stringify(_files);
	localStorage['newfiles'] = JSON.stringify(_newfiles);
	
	localStorage['lastRequest'] = requestTime;
};

var UpdateIcon = function UpdateIconF(){
	var newfiles = localStorage['newfiles'] ? JSON.parse(localStorage['newfiles']) : [];
	var text = newfiles.length > 0 ? "" + newfiles.length : "";
	var color = newfiles.length > 0 ? "#f00": "#000";
	chrome.browserAction.setBadgeText({ text: text });
	chrome.browserAction.setBadgeBackgroundColor({ color: color });
};