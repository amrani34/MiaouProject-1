ResultsIndexController = (Result, $scope) ->
    $scope.results = Result.query();
    $scope.deleteResult = (result) ->
        return false if !confirm('Supprimer ce résultat ?')
        result.$remove id: result.id, (obj) -> $scope.results.splice $scope.results.indexOf(obj), 1
angular.module('miaou').controller 'ResultsIndexController', ['Result', '$scope', ResultsIndexController]
