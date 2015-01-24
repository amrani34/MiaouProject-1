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
    'use strict';
	var app = angular.module('miaou', ['miaouAnimate']);

	app.controller('KeywordsController', ['$scope', '$http', function ($scope, $http) {
			/*************************
			 * Variables definition  *
			 ************************/
			var searchEngines = ['google', 'bing'],
					validUrl = /^(https?:\/\/)/,
					strToArray = function (str, sep) {
						return str.split(sep).map(function (text) {
							return text.trim();
						});
					},
					removeTextFromResults = function (text) {
						var index = $scope.keywordsList.indexOf(text);

						if (index === -1)
							return false;

						$scope.keywordsList.splice(index, 1);
						return true;
					};

			$scope.linkList = [];
			$scope.keywordsList = [];
			$scope.results = [];
			$scope.progress = 0;

			$scope.emptyLinks = function () {
                $scope.progress = 0;
				$scope.linkList.length = 0;
				$scope.keywordsList.length = 0;
				$scope.results.length = 0;
				$scope.searchParams.keywords = '';
				$scope.waiting = false;				
			}

			$scope.removeResult = function (index) {
				var resultRemoved = $scope.results.splice(index, 1)[0];
				resultRemoved.data.forEach(function (text) {
					removeTextFromResults(text);
				});
			}

			$scope.removeText = function (index, result) {
				var text = result.data.splice(index, 1)[0];
				removeTextFromResults(text);
				if (!result.data.lentgh)
					$scope.removeResult($scope.results.indexOf(result));
			}

			$scope.waiting = false;
			$scope.showLinks = false;
			$scope.searchParams = {
				keywords: '',
				searchType: 'large',
				strict: 0,
				maxResults: 2,
				minLength: 0
			};

			$scope.fetchKeywords = function () {
				$scope.waiting = true;
				searchEngines.forEach(function (searchEngine) {
					var linkData = {
						searchType: $scope.searchParams.searchType,
						keywords: strToArray($scope.searchParams.keywords, ',')
					};

					$http.post('/links/' + searchEngine, linkData).success(function (response) {						
						var nbRequest = 0,
						nbResponse = 0;
						response.urls.forEach(function (url) {
							if (!validUrl.test(url) || $scope.linkList.indexOf(url) !== -1)
								return false;
							nbRequest++;

							$scope.linkList.push(url);

							var keywordData = {
								url: url,
								strict: $scope.searchParams.strict,
								keywords: strToArray($scope.searchParams.keywords, ','),
								maxResults: $scope.searchParams.maxResults
							};

							$http.post('/keyword', keywordData).success(function (response) {
								nbResponse++;
								
                                $scope.progress = parseInt(nbResponse / nbRequest * 100, 10);
								if (nbResponse === nbRequest)
									$scope.waiting = false;
								
								if (!response.success)
									return;
								var results = {
									origin: keywordData.url,
									active: true,
									data: []
								}
								response.p.forEach(function (text) {
									if ($scope.keywordsList.indexOf(text) !== -1)
										return false;
									$scope.keywordsList.push(text);
									results.data.push(text);
								});
								if (results.data.length)
									$scope.results.push(results);
							}).error(function () {
								console.log('miaou');
								nbResponse++;
                                $scope.progress = parseInt(nbResponse / nbRequest * 100, 10);
								if (nbResponse === nbRequest)
									$scope.waiting = false;
							});
						});
					}).error(function () {
						$scope.waiting = false;
					});
				});
			};
		}]);
})();