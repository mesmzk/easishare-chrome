var app = angular.module('easishareApp', []);

app.controller('SharedFilesCtrl', ['$scope', '$interval', function ($scope, $interval) {
	$scope.files = localStorage['files'];
	$scope.newfiles	 = localStorage['new'];
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
		GetSharedList(function(result) {
			if(result.Success){
				$scope.files = result.Result;
				$scope.$apply();
			}else{
				$scope.error = result.ErrorMessage;
			}
			$scope.inProgress = false;
		});
	};
	$scope.load();
}]);