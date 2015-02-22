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

	app.controller('ConfigController', ['$scope', '$http', 'Mail', 'Site', 'BootStrapAlert', function ($scope, $http, Mail, Site, BootStrapAlert) {            
            $scope.models = {
                mail: {
                    factory: Mail,
                    current: new Mail(),
                    list: Mail.query()
                },
                site: {
                    factory: Site,
                    current: new Site(),
                    list: Site.query()
                }
            };
            
            /**
             * Update an email params
             * @param Mail mail
             * @returns void
             */
            $scope.edit = function (modelName, model) {
                if (!$scope.models.hasOwnProperty(modelName)) return false;
                $scope.models[modelName].current = model;
            };

            $scope.delete = function (model) {
                if (!confirm('Delete ?')) return false;
                model.$delete({id: model.id});
            };

            $scope.save = function (model) {
                var options = isLoadedObject(model) ? {id: model.id}: undefined,
                    saveAlert = BootStrapAlert.add('info', 'Please wait');
                model.$save(options, function() {
                    saveAlert.type = 'success';
                    saveAlert.message = 'Configuration updated';
                }, function (err) {
                    saveAlert.type = 'danger';
                    saveAlert.message = err.statusText;
                });
            };
            
            function getList(model) {
                if (!$scope.models.hasOwnProperty(model)) return false;
                
                $http.get('/'+ model).success(function (response) {                    
                    $scope.models[model].list = response;
                }).error(function (err) {
                    BootStrapAlert.add('danger', err.statusText)
                    console.error(err);
                });
            };
        }]);
    
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
            $scope.article.title = title;
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
    
	app.controller('MultiSearchController', ['$scope', '$http', 'Site', 'Result', 'BootStrapAlert', 'MailService', function ($scope, $http, Site, Result, BootStrapAlert, MailService) {
        $scope.searchParams = defaultSearchParam;
        $scope.waiting = false;
        $scope.progress = 0;
        $scope.nbRequests = 0;
        $scope.nbResponses = 0;
        $scope.keywordsList = [];
        $scope.sitesList = Site.query();
        
        // Functions
        $scope.save = function (obj) {
            var result = new Result(obj),
                saveAlert = BootStrapAlert.add('info', 'Please wait');
            result.$save(function() {
                saveAlert.type = 'success';
                saveAlert.message = 'Recherche sauvegardée';
            }, function (err) {
                saveAlert.type = 'danger';
                saveAlert.message = err.statusText;
            });
        };
        
        $scope.sendMail = function (obj) {
            if (!obj.hasOwnProperty('emailData'))
                return BootStrapAlert.add('danger', 'Invalid request');
            if (!obj.hasOwnProperty('site'))
                return BootStrapAlert.add('danger', 'Please select a website');
            
            var postData = obj.emailData,
                mailAlert = BootStrapAlert.add('info', 'Please wait');
            postData.site = obj.site;
            
            MailService.send(postData, function (response) {
                mailAlert.type = 'success';
                mailAlert.message = 'Mail envoyé';
            }, function (err) {
                $log.error(err);
                mailAlert.type = 'danger';
                mailAlert.message = 'Échec de l\'envoi';
            });            
        };
        
        $scope.fetchKeywords = function () {
            $scope.waiting = true;
            
            strToArray($scope.searchParams.keywords, /\n/).forEach(function(keywords, index) {
                var item = {
                    keywords : strToArray(keywords, ' '),
                    linkList: [],
                    resultsIn: [],
                    resultsOut: [],
                    emailData: {
                        title: keywords,
                        content: ''
                    },
                    site: $scope.searchParams.site
                };
                
                searchEngines.forEach(function (searchEngine) {
					
					$http.post('/links/find', {
                        searchType: $scope.searchParams.searchType,
						keywords: item.keywords,
                        engine: searchEngine
					}).success(function (response) {
						response.urls.forEach(function (url) {
							if (!validUrl.test(url) || item.linkList.indexOf(url) !== -1)
								return false;
							$scope.nbRequests++;

							item.linkList.push(url);
                            
							$http.post('/keywords/find', {
								url: url,
								strict: $scope.searchParams.strict,
								keywords: item.keywords,
								maxResults: $scope.searchParams.maxResults
							}).success(function (response) {
								$scope.nbResponses++;
								
                                $scope.progress = parseInt($scope.nbResponses / $scope.nbRequests * 100, 10);
								if ($scope.nbResponses === $scope.nbRequests)
									$scope.waiting = false;
								
								if (!response.success)
									return;
								                                
								response.in.forEach(function (text) {
									if (item.resultsIn.indexOf(text) !== -1)
										return false;
									item.resultsIn.push(text);
                                    item.emailData.content += text.trim();
								});
                                
                                response.out.forEach(function (text) {
									if (item.resultsOut.indexOf(text) !== -1)
										return false;
									item.resultsOut.push({text: text, origin: url});
								});
							}).error(function () {
								$scope.nbResponses++;
                                $scope.progress = parseInt($scope.nbResponses / $scope.nbRequests * 100, 10);
								if ($scope.nbResponses === $scope.nbRequests)
									$scope.waiting = false;
							});
						});
					}).error(function () {
						$scope.waiting = false;
					});
				});
                $scope.keywordsList.push(item);
            });            
        };
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