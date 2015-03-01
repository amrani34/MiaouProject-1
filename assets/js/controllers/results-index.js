angular.module('miaou').controller('ResultsIndexController', ['Result', '$scope', function (Result, $scope) {
    'use strict';
    $scope.results = Result.query();
    $scope.deleteResult = function (result) {
        if (!confirm('Supprimer ce résultat ?'))
            return false;

        result.$remove({id: result.id}, function(obj){
            $scope.results.splice($scope.results.indexOf(obj), 1);
        });
    };
}]);