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
	var app = angular.module('miaouControllers', []),
        defaultSearchParam = {
            keywords: '',
            searchType: 'exact',
            strict: 1,
            maxResults: 2,
            minLength: 0,
            site: null
        },
        searchEngines = ['google', 'bing'],
        validUrl = /^(https?:\/\/)/,
        strToArray = function (str, sep) {
            return str.split(sep).map(function (text) {
                return text.trim();
            });
        };

	app.controller('MailFormController', ['$scope', '$http', '$log', function ($scope, $http, $log) {
        $scope.sendMail = function () {
            $scope.alertClass = 'alert-info';
            $scope.alertMessage = 'Veuillez patienter';
            $scope.showAlert = true;

            $http.post('/mail/send', $scope.article).success(function (response) {
                $log.log(response);
                $scope.alertClass = 'alert-success';
                $scope.alertMessage = 'Mail envoyé';
            }).error(function (err) {
                $log.error(err);
                $scope.alertClass = 'alert-danger';
                $scope.alertMessage = 'Échec de l\'envoi';
            });
        };

        $scope.startEdit = function (title, data) {
            $scope.article.title = title.capitalize();
            $scope.article.content = data.map(function(obj){
                var text = obj.text.trim();
                $scope.wordCount += text.split(' ').length;
                return text;
            }).join('. ');
            $scope.modeEdit = true;
        };

        $scope.article = {};
        $scope.wordCount = 0;
        $scope.modeEdit = false;
        $scope.showAlert = false;
        $scope.alertClass = '';
        $scope.alertMessage = '';

    }]);

	app.controller('KeywordsController', ['$scope', '$http', function ($scope, $http) {
			/*************************
			 * Variables definition  *
			 ************************/
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

			$scope.waiting = false;
			$scope.searchParams = defaultSearchParam;

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
