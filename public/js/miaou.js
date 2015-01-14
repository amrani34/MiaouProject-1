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
	
	app.controller('LinkController', function($scope) {
		$scope.linkList = [];
	});
	
	app.controller('KeywordController', function($scope) {
		$scope.resultList = [];
	});
	
})();


