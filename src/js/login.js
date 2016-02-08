var app = angular.module('easishareApp', []);

app.controller('LoginCtrl', function ($scope) {
	var backUser = localStorage['username'];
	var backUrl = localStorage['url'];
	$scope.inProgress = false;
	$scope.url = localStorage['url'];
	$scope.username = localStorage['username'];
	$scope.login2 = function(){	
		chrome.browserAction.setPopup({ popup: "index.html"});
		window.location.href = "index.html";
	};
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
				$scope.apply();
			}
			$scope.inProgress = false;
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
		}
		//chrome.browserAction.setPopup({ popup: "index.html"});
		window.location.href = "index.html";
	};
});