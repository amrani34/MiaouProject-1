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
	
	app.service('linkManager', function() {
		var linkList = [],
		validUrl = /^(https?:\/\/)/;
		
		return {
			addLink: function(url) {
				if (validUrl.test(url) && linkList.indexOf(url) === -1)
					linkList.push(url);
			},
			getLinkCount: function () {
				console.log(linkList);
				return linkList.length;
			},
			getLinkList: function () {
				return linkList;
			},
			emptyLinks: function () {
				linkList.length = 0;
			}
		};
	});
	
	app.controller('LinkController', ['$scope', '$http', 'linkManager', function($scope, $http, linkManager) {
		var searchEngines = ['google', 'bing'];
		$scope.nbLinks = 0;
		$scope.emptyLinks = function() {
			$scope.nbLinks = 0;
			return linkManager.emptyLinks();
		}
		$scope.waiting = false;
		$scope.reqParams = {
			keywords: '',
			searchType: 'large'
		};
		
		$scope.fetchLinks = function() {
			$scope.waiting = true;
			searchEngines.forEach(function (searchEngine) {
				$http.post('/links/' + searchEngine, $scope.reqParams).success(function(response) {
					$scope.waiting = false;
					response.urls.forEach(function(url) {
						linkManager.addLink(url);						
					});
					$scope.nbLinks = linkManager.getLinkCount();
				}).error(function () {
					$scope.waiting = false;
				});
			});
		};
	}]);
	
	app.controller('KeywordController', function($scope) {
		$scope.resultList = [];
	});
	
})();


