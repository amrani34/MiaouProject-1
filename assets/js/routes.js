angular.module('miaou').config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/result/:id', {
        templateUrl: 'templates/directives/result-infos.html',
        controller: 'ResultsViewController'
    })
    .when('/', {
        templateUrl: 'templates/results/index.html',
        controller: 'ResultsIndexController'
    })
    .otherwise({redirectTo: '/'});
    
    // configure html5 to get links working on jsfiddle
    //$locationProvider.html5Mode(true);
});

