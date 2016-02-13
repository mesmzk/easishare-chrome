var app = angular.module('easishareApp', []);

app.controller('LoginCtrl', function ($scope) {
	//chrome.browserAction.setBadgeText({ text: "?"});
	//chrome.browserAction.setBadgeBackgroundColor({ color: "#000"});
	var backUser = localStorage['username'];
	var backUrl = localStorage['url'];
	$scope.inProgress = false;
	$scope.url = localStorage['url'];
	$scope.username = localStorage['username'];
	$scope.login = function(){
		$scope.inProgress = true;
		$scope.error = "";
		this.save();
		SetToken('');
		GetDeviceStatus(function(result){
			if(result.Success){
				$scope.success();
			}else{
				$scope.error = result.ErrorMessage;
			}
			$scope.inProgress = false;
			$scope.$apply();
		});
	};
	$scope.clear = function(){
		localStorage['url'] = '';
		localStorage['username'] = '';
		localStorage['password'] = '';
	};
	$scope.save = function(){
		localStorage['url'] = this.url.replace(/\/$/,'');
		localStorage['username'] = this.username;
		localStorage['password'] = window.btoa(this.password);
	};
	$scope.success = function(){
		if(backUser && backUrl && (backUser.toLowerCase() !== localStorage['username'].toLowerCase() || backUrl.toLowerCase() !== localStorage['url'].toLowerCase())) {
			localStorage['files'] = [];
			localStorage['new'] = [];
			localStorage['lastrequest'] = 0;
		}
		//chrome.browserAction.setPopup({ popup: "index.html"});
		window.location.href = "index.html";
	};
});