chrome.runtime.onStartup.addListener(function (){
	localStorage["password"] = "";
	SetToken("");
});