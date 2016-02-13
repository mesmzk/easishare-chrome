var app = angular.module('easishareApp', []);

app.controller('SharedFilesCtrl', ['$scope', '$interval', function ($scope, $interval) {
	var token = GetToken();
	if(!token && token.length == 0){
		//chrome.browserAction.setPopup({ popup: "login.html"});
		window.location.href = "login.html";
		return;
	}
	$scope.files = localStorage['files'] ? JSON.parse(localStorage['files']) : [];
	$scope.newfiles	 = localStorage['new'] ? JSON.parse(localStorage['newfiles']) : [];
	$scope.lastrequest = Number(localStorage['lastRequest'] || 0)
	$scope.lastfullrequest = Number(localStorage['lastFullRequest'] || 0);
	$scope.error = '';
	$scope.inProgress = false;
	$scope.logout = function(){
		localStorage['password'] = '';
		SetToken('');
		//chrome.browserAction.setPopup({ popup: "login.html"});
		window.location.href = "login.html";
	};
	$scope.stop = $interval(function() { $scope.load(); }, 60000);
	$scope.load = function(){
		$scope.error = '';
		$scope.inProgress = true;
		var requestTime = new Date().getTime();
		var date = null;
		if($scope.lastrequest > 0 && (requestTime - $scope.lastfullrequest) < 6 * 60 * 1000){
			date = new Date($scope.lastrequest).toISOString();
		}
		GetSharedList(function(result) {
			if(result.Success){
				if(date){
					$scope.comparePartial(result.Result, requestTime);	
				}else{
					$scope.compareFull(result.Result, requestTime);				
				}
				$scope.$apply();
				$scope.updateIcon();
			}else{
				$scope.error = result.ErrorMessage;
			}
			$scope.inProgress = false;
		}, date);
	};
	$scope.compareFull = function(filesResult, requestTime){
		var IsNewDefault = $scope.lastfullrequest > 0;
		$scope.newfiles = $.grep(filesResult, function(o){
			var that = this;
			this.IsNew = IsNewDefault;
			$($scope.files).each(function(){
				if(this.ShareId == that.ShareId){
					that.IsNew = this.IsNew;
				}
			});
			return this.IsNew;
		});	
		$scope.files = filesResult;
		localStorage['files'] = JSON.stringify($scope.files);
		localStorage['newfiles'] = JSON.stringify($scope.newfiles);
		
		localStorage['lastFullRequest'] = $scope.lastfullrequest = requestTime;
		localStorage['lastRequest'] = $scope.lastrequest = requestTime;
	};
	$scope.comparePartial = function(filesResult, requestTime){
		var newfiles = $.grep(filesResult, function(o){
			var that = this;
			this.IsNew = true;
			$($scope.files).each(function(){
				if(this.ShareId == that.ShareId){
					that.IsNew = false;
				}
			});
			return this.IsNew;
		});
		$scope.files = $scope.files.concat(newfiles);
		$scope.newfiles = $scope.newfiles.concat(newfiles);
		localStorage['files'] = JSON.stringify($scope.files);
		localStorage['newfiles'] = JSON.stringify($scope.newfiles);
		
		localStorage['lastRequest'] = $scope.lastrequest = requestTime;
	};
	$scope.updateIcon = function(){
		var text = $scope.newfiles.length > 0 ? "" + $scope.newfiles.length : "";
		var color = $scope.newfiles.length > 0 ? "#f00": "#000";
		//chrome.browserAction.setBadgeText({ text: text});
		//chrome.browserAction.setBadgeBackgroundColor({ color: color });
	};
	$scope.updateIcon();
	$scope.load();
}]);