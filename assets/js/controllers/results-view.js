angular.module('miaou').controller('ResultsViewController', ['Result', '$scope', '$routeParams', function (Result, $scope, $routeParams) {
    'use strict';
    $scope.result = Result.get({id: $routeParams.id});
    $scope.deleteResult = function (result) {
        if (!confirm('Supprimer ce résultat ?'))
            return false;

        result.$remove({id: result.id}, function(obj){
            $scope.results.splice($scope.results.indexOf(obj), 1);
        });
    };
}]);