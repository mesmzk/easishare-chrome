var app = angular.module('easishareApp', []);

app.controller('SharedFilesCtrl', ['$scope', '$interval', function ($scope, $interval) {
	var token = GetToken();
	if(!token && token.length == 0){
		chrome.browserAction.setBadgeText({ text: "?"});
		chrome.browserAction.setBadgeBackgroundColor({"color": [225, 0, 0, 100]});
		chrome.browserAction.setPopup({ popup: "login.html"});
		window.location.href = "login.html";
		return;
	}
	$scope.files = localStorage['files'] ? JSON.parse(localStorage['files']) : [];
	$scope.error = localStorage['error'] ? localStorage['error']: '';
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if(request.job == "loadstarted"){
				$scope.error = localStorage['error'] ? localStorage['error']: '';
				$scope.inProgress = true;
				$scope.$apply();				
			} else if (request.job == "loadfinished"){
				$scope.files = localStorage['files'] ? JSON.parse(localStorage['files']) : [];
				$scope.error = localStorage['error'] ? localStorage['error']: '';
				$scope.inProgress = false;
				$scope.$apply();
			}
		}
	);
	$scope.error = localStorage['error']? localStorage['error']: '';
	$scope.inProgress = false;
	$scope.reset = function(){
		localStorage['files'] = $scope.files = [];
		localStorage['newfiles'] = $scope.newfiles = [];
		localStorage['lastRequest'] = 0;
		localStorage['lastFullRequest'] = 0;
	};
	$scope.refresh = function(){
		$scope.inProgress = true;		
		chrome.runtime.sendMessage({job: "reload"}, function(response) { });
	};
	$scope.logout = function(){
		chrome.runtime.sendMessage({job: "stop"}, function(response) { });
		localStorage['password'] = '';
		SetToken('');
		chrome.browserAction.setPopup({ popup: "login.html"});
		window.location.href = "login.html";
	};
}]);