/* 
 * Angular MiaouProject App
 * 
 * Controllers
 * 
 * DISCLAIMER
 * 
 * Do not edit or add to this file if you wish to upgrade this module to newer
 * versions in the future. If you wish to customize our module for your
 * needs please refer to http://www.webincolor.fr for more information.
 * 
 *  @author    Gary PEGEOT <garypegeot@gmail.com>
 *  @license   MIT
 */

(function () {
    'use strict';
	var app = angular.module('miaouControllers', []);

	app.controller('MailFormController', ['$scope', '$http', function ($scope, $http) {
        $scope.sendMail = function () {
            $http.post('/mailer/send', $scope.article).success(function (response) {
            }).error(function () {
            });
        };
        $scope.startEdit = function (title, data) {
            $scope.article.title = title;
            $scope.article.content = data.map(function(obj){
                return obj.text.trim() + '. ';
            });
            $scope.modeEdit = true;            
        };
        $scope.article = {};
        $scope.modeEdit = false;        
    }]);
    
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
			$scope.resultsIn = [];
			$scope.resultsOut = [];
			$scope.progress = 0;

			$scope.emptyLinks = function () {
                $scope.progress = 0;
				$scope.linkList.length = 0;
				$scope.keywordsList.length = 0;
				$scope.resultsIn.length = 0;
				$scope.resultsOut.length = 0;
				$scope.searchParams.keywords = '';
				$scope.waiting = false;				
			}

			$scope.removeResult = function (index) {
				$scope.resultsIn.splice(index, 1)[0];
			}
            
            $scope.addResult = function (index) {
				$scope.resultsIn.push($scope.resultsOut.splice(index, 1)[0]);
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
				searchType: 'exact',
				strict: 1,
				maxResults: 2,
				minLength: 0
			};

			$scope.fetchKeywords = function () {
				$scope.waiting = true;
				searchEngines.forEach(function (searchEngine) {
					var linkData = {
						searchType: $scope.searchParams.searchType,
						keywords: strToArray($scope.searchParams.keywords, ' '),
                        engine: searchEngine
					};

					$http.post('/links/find', linkData).success(function (response) {						
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
								keywords: strToArray($scope.searchParams.keywords, ' '),
								maxResults: $scope.searchParams.maxResults
							};

							$http.post('/keywords/find', keywordData).success(function (response) {
								nbResponse++;
								
                                $scope.progress = parseInt(nbResponse / nbRequest * 100, 10);
								if (nbResponse === nbRequest)
									$scope.waiting = false;
								
								if (!response.success)
									return;
								                                
								response.in.forEach(function (text) {
									if (searchText(text, $scope.resultsIn))
										return false;
									$scope.resultsIn.push({text: text, origin: url});
								});
                                
                                response.out.forEach(function (text) {
									if (searchText(text, $scope.resultsOut))
										return false;
									$scope.resultsOut.push({text: text, origin: url});
								});
							}).error(function () {
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