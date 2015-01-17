/* 
 * Angular MiaouProject App
 * 
 * miaou.js - Last modified: 14 janv. 2015
 * 
 * DISCLAIMER
 * 
 * Do not edit or add to this file if you wish to upgrade this module to newer
 * versions in the future. If you wish to customize our module for your
 * needs please refer to http://www.webincolor.fr for more information.
 * 
 *  @author    Gary PEGEOT <garypegeot@gmail.com>
 *  @license   GNU
 */

(function () {	
	var app = angular.module('miaou', []);
	
	app.controller('GlobalController', ['$scope', '$http', function($scope, $http) {
			
		/*************************
		 * Variables definition  *
		 ************************/
		var searchEngines = ['google', 'bing'],
		validUrl = /^(https?:\/\/)/,
		strToArray = function (str, sep) {
			return str.split(sep).map(function(text) {
				return text.trim();
			});
		};
		
		$scope.linkList = [];
		$scope.keywordsList = [];
		$scope.emptyLinks = function() {
			$scope.linkList.length = 0;
		}
		$scope.waiting = false;
		$scope.searchParams = {
			keywords: '',
			searchType: 'large',
			strict: 0,
			maxResults: 2
		};
		
		$scope.fetchLinks = function() {
			$scope.waiting = true;
			searchEngines.forEach(function (searchEngine) {
				var data = {
					searchType: $scope.searchParams.searchType,
					keywords: strToArray($scope.searchParams.keywords, ',')
				};
				
				$http.post('/links/' + searchEngine, data).success(function(response) {
					$scope.waiting = false;
					response.urls.forEach(function(url) {
						if (validUrl.test(url) && $scope.linkList.indexOf(url) === -1)
							$scope.linkList.push(url);						
					});
				}).error(function () {
					$scope.waiting = false;
				});
			});
		};
		
		$scope.fetchKeywords = function () {
			$scope.waiting = true;
			$scope.linkList.forEach(function (url) {
				var data = {
					url: url,
					strict: $scope.searchParams.strict,
					keywords: strToArray($scope.searchParams.keywords, ','),
					maxResults: $scope.searchParams.maxResults
				};
				
				$http.post('/keyword', data).success(function(response) {
					$scope.waiting = false;
					if (!response.success)
						return;
					
					response.p.forEach(function(text) {
						if ($scope.keywordsList.indexOf(text) === -1)
							$scope.keywordsList.push(text);						
					});
				}).error(function () {
					$scope.waiting = false;
				});
			});
		};
	}]);	
})();


